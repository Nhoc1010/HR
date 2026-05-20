/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Search, 
  ArrowRight,
  UserCheck,
  Zap,
  Coffee,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  X,
  Settings
} from "lucide-react";
import { Employee, Attendance, Payroll as PayrollType } from "../types";

interface TimeAttendanceProps {
  employees: Employee[];
  attendance: Attendance[];
  setAttendance: Dispatch<SetStateAction<Attendance[]>>;
  payroll: PayrollType[];
  setPayroll: Dispatch<SetStateAction<PayrollType[]>>;
}

interface Toast {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
}

interface ShiftConfig {
  startTime: string; // "hh:mm"
  endTime: string;   // "hh:mm"
  penaltyRate: number; // in VND
  gracePeriod: number; // in minutes
}

export default function TimeAttendance({ 
  employees, 
  attendance, 
  setAttendance,
  payroll,
  setPayroll
}: TimeAttendanceProps) {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [justCheckedIn, setJustCheckedIn] = useState<string | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Shift & Timing Config State
  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(() => {
    const saved = localStorage.getItem("hrm_shift_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      startTime: "08:30",
      endTime: "17:30",
      penaltyRate: 120000,
      gracePeriod: 10
    };
  });

  // Save config on change
  useEffect(() => {
    localStorage.setItem("hrm_shift_config", JSON.stringify(shiftConfig));
  }, [shiftConfig]);

  const [activeSubTab, setActiveSubTab] = useState<"daily" | "monthlyRoster" | "shiftConfig">("daily");
  const [bridgeResult, setBridgeResult] = useState<{
    processed: boolean;
    totalLates: number;
    employeesAffected: number;
    totalPenaltyAmount: number;
  } | null>(null);

  const recentDates = ["2026-05-16", "2026-05-17", "2026-05-18", "2026-05-19", "2026-05-20"];

  const addToast = (type: "success" | "warning" | "info" | "error", title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };
    setToasts(prev => [newToast, ...prev].slice(0, 4));
    
    // Auto-remove toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleBridgeDeductionsToPayroll = () => {
    if (!payroll || !setPayroll) return;

    let totalLatesCount = 0;
    let employeesAffectedCount = 0;
    const penaltyRate = shiftConfig.penaltyRate; // Use dynamic penalty rate from shiftConfig

    const updatedPayroll = payroll.map(p => {
      // Find employee's attendance logs in the last 5 days
      const empLogs = attendance.filter(a => a.employeeId === p.employeeId && recentDates.includes(a.date));
      const lateLogs = empLogs.filter(a => a.status === "Đi muộn");
      
      if (lateLogs.length > 0) {
        totalLatesCount += lateLogs.length;
        employeesAffectedCount += 1;
        const penaltyValue = lateLogs.length * penaltyRate;

        // Base deductions is 1,000,000đ (standard BHXH). Let's accumulate late checks!
        const targetDeductions = p.deductions + penaltyValue;
        const recalculatedNet = p.basicSalary + p.allowance - targetDeductions - p.advance;

        return {
          ...p,
          deductions: targetDeductions,
          netSalary: recalculatedNet
        };
      }
      return p;
    });

    setPayroll(updatedPayroll);
    setBridgeResult({
      processed: true,
      totalLates: totalLatesCount,
      employeesAffected: employeesAffectedCount,
      totalPenaltyAmount: totalLatesCount * penaltyRate
    });

    addToast(
      "success",
      "Đồng bộ hạch toán",
      `Đã chuyển tiếp phạt hành vi đi muộn tổng cộng +${(totalLatesCount * penaltyRate).toLocaleString()}đ vào bảng lương kì này!`
    );

    // Reset after 8 seconds
    setTimeout(() => {
      setBridgeResult(null);
    }, 8000);
  };

  // Select first employee or HR Manager (Lan Anh) on mount or if deleted
  useEffect(() => {
    if (employees.length > 0) {
      const exists = employees.some(e => e.id === selectedEmpId);
      if (!selectedEmpId || !exists) {
        const manager = employees.find(e => e.id === "emp04" || e.name.includes("Lan Anh"));
        if (manager) {
          setSelectedEmpId(manager.id);
        } else {
          setSelectedEmpId(employees[0].id);
        }
      }
    }
  }, [employees, selectedEmpId]);

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString("vi-VN", { hour12: false });
  const dateString = time.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const activeEmployee = employees.find(e => e.id === selectedEmpId);
  const isCheckedInToday = attendance.some(a => a.employeeId === selectedEmpId && a.date === "2026-05-20");
  const todayRecordForActive = attendance.find(a => a.employeeId === selectedEmpId && a.date === "2026-05-20");

  // Dynamic real-time calculations
  const getWorkDuration = (checkInStr: string, checkOutStr?: string | null): string => {
    if (!checkInStr) return "";
    try {
      const parts = checkInStr.split(":");
      if (parts.length < 2) return "";
      
      const checkInDate = new Date();
      checkInDate.setHours(parseInt(parts[0], 10));
      checkInDate.setMinutes(parseInt(parts[1], 10));
      checkInDate.setSeconds(parseInt(parts[2] || "0", 10));
      
      let endDate = time;
      if (checkOutStr) {
        const outParts = checkOutStr.split(":");
        if (outParts.length >= 2) {
          endDate = new Date();
          endDate.setHours(parseInt(outParts[0], 10));
          endDate.setMinutes(parseInt(outParts[1], 10));
          endDate.setSeconds(parseInt(outParts[2] || "0", 10));
        }
      }
      
      const diffMs = endDate.getTime() - checkInDate.getTime();
      if (diffMs <= 0) return "00g 00p 00s";
      
      const hrs = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      
      const pad = (num: number) => num.toString().padStart(2, "0");
      return `${pad(hrs)}g ${pad(mins)}p ${pad(secs)}s`;
    } catch {
      return "";
    }
  };

  const getExpectedShiftHours = (): number => {
    try {
      const [startHour, startMin] = shiftConfig.startTime.split(":").map(Number);
      const [endHour, endMin] = shiftConfig.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const diffMinutes = endMinutes - startMinutes;
      return diffMinutes > 0 ? diffMinutes / 60 : 8;
    } catch {
      return 8;
    }
  };

  const getProgressPercentage = (): number => {
    if (!todayRecordForActive) return 0;
    try {
      const parts = todayRecordForActive.checkIn.split(":");
      const checkInDate = new Date();
      checkInDate.setHours(parseInt(parts[0], 10));
      checkInDate.setMinutes(parseInt(parts[1], 10));
      checkInDate.setSeconds(parseInt(parts[2] || "0", 10));
      
      let endDate = time;
      if (todayRecordForActive.checkOut) {
        const outParts = todayRecordForActive.checkOut.split(":");
        endDate = new Date();
        endDate.setHours(parseInt(outParts[0], 10));
        endDate.setMinutes(parseInt(outParts[1], 10));
        endDate.setSeconds(parseInt(outParts[2] || "0", 10));
      }
      
      const diffMs = endDate.getTime() - checkInDate.getTime();
      if (diffMs <= 0) return 0;
      
      const expectedHours = getExpectedShiftHours();
      const percent = (diffMs / (expectedHours * 3600000)) * 100;
      return Math.min(100, Math.round(percent));
    } catch {
      return 0;
    }
  };

  const getDynamicOnTimeSample = (): string => {
    try {
      const [h, m] = shiftConfig.startTime.split(":").map(Number);
      let totalMins = h * 60 + m - 15;
      if (totalMins < 0) totalMins = 0;
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    } catch {
      return "08:15:00";
    }
  };

  const getDynamicLateSample = (): string => {
    try {
      const [h, m] = shiftConfig.startTime.split(":").map(Number);
      const totalMins = h * 65 + m + shiftConfig.gracePeriod + 15;
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    } catch {
      return "09:12:00";
    }
  };

  const getDynamicEarlyCheckoutSample = (): string => {
    try {
      const [h, m] = shiftConfig.endTime.split(":").map(Number);
      let totalMins = h * 60 + m - 30;
      if (totalMins < 0) totalMins = 0;
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    } catch {
      return "15:15:00";
    }
  };

  const getDynamicOnTimeCheckoutSample = (): string => {
    try {
      const [h, m] = shiftConfig.endTime.split(":").map(Number);
      const totalMins = h * 60 + m + 15;
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    } catch {
      return "17:45:00";
    }
  };

  const isWorking = isCheckedInToday && !todayRecordForActive?.checkOut;
  const isCompleted = isCheckedInToday && todayRecordForActive?.checkOut;
  const currentDuration = todayRecordForActive ? getWorkDuration(todayRecordForActive.checkIn, todayRecordForActive.checkOut) : "";
  const workPercent = getProgressPercentage();

  const handleCheckInSimulate = (mockTimeStr?: string) => {
    if (!selectedEmpId) {
      addToast("error", "Lỗi điểm danh", "Vui lòng chọn nhân viên cần ghi nhận!");
      return;
    }

    const targetTime = mockTimeStr || timeString;
    const parts = targetTime.split(":");
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);

    if (isCheckedInToday && todayRecordForActive?.checkOut) {
      addToast(
        "error",
        "Trùng lặp ghi nhận",
        `Nhân viên ${activeEmployee?.name} đã hoàn thành đầy đủ check-out hôm nay. Không thể tiếp tục ghi nhận!`
      );
      return;
    }

    const [startHour, startMin] = shiftConfig.startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const checkInMinutes = hour * 60 + minute;

    if (!isCheckedInToday) {
      // Check in
      const isLate = checkInMinutes > (startMinutes + shiftConfig.gracePeriod);
      let note = `Ghi nhận check-in trực tuyến của ${activeEmployee?.name}`;
      if (mockTimeStr) note += ` (Chế độ giả lập: ${mockTimeStr})`;
      
      const newRecord: Attendance = {
        id: `att-${Date.now()}`,
        employeeId: selectedEmpId,
        date: "2026-05-20",
        checkIn: targetTime,
        checkOut: null as any,
        status: isLate ? "Đi muộn" : "Đúng giờ",
        notes: note
      };

      setAttendance([...attendance, newRecord]);
      setJustCheckedIn("CHECK_IN");
      setTimeout(() => setJustCheckedIn(null), 3000);

      if (isLate) {
        const minsLate = checkInMinutes - startMinutes;
        addToast(
          "warning",
          "Ghi nhận Đi Trễ",
          `Check-in thành công lúc ${targetTime}. ${activeEmployee?.name} đi muộn ${minsLate} phút (Mốc chuẩn: ${shiftConfig.startTime}, ân hạn cho phép: ${shiftConfig.gracePeriod}p). Hệ thống hạch toán khấu trừ kỷ luật ${shiftConfig.penaltyRate.toLocaleString()}đ.`
        );
      } else {
        addToast(
          "success",
          "Đúng Giờ",
          `Check-in Đúng Giờ thành công lúc ${targetTime}! Tác phong của ${activeEmployee?.name} chuẩn mực, xuất sắc ghi nhận ngày công.`
        );
      }
    } else {
      // Check out
      let note = `Ghi nhận check-out hoàn thành ngày công của ${activeEmployee?.name}`;
      if (mockTimeStr) note += ` (Chế độ giả lập: ${mockTimeStr})`;

      setAttendance(attendance.map(a => {
        if (a.employeeId === selectedEmpId && a.date === "2026-05-20") {
          return {
            ...a,
            checkOut: targetTime,
            notes: note
          };
        }
        return a;
      }));
      setJustCheckedIn("CHECK_OUT");
      setTimeout(() => setJustCheckedIn(null), 3000);

      const [endHour, endMin] = shiftConfig.endTime.split(":").map(Number);
      const endMinutes = endHour * 60 + endMin;
      const checkOutMinutes = hour * 60 + minute;

      const isEarly = checkOutMinutes < endMinutes;
      if (isEarly) {
        const earlyMins = endMinutes - checkOutMinutes;
        addToast(
          "warning",
          "Check-out Sớm",
          `${activeEmployee?.name} check-out sớm lúc ${targetTime} (Sớm hơn giờ hành chính chuẩn ${shiftConfig.endTime} là ${earlyMins} phút).`
        );
      } else {
        addToast(
          "success",
          "Hoàn Thành Công Việc",
          `Check-out thành công lúc ${targetTime}! ${activeEmployee?.name} đã hoàn thành xuất sắc ngày làm việc chuẩn.`
        );
      }
    }
  };

  // Stats today
  const todayDateStr = "2026-05-20";
  const todayLogs = attendance.filter(a => a.date === todayDateStr);
  const presentCount = todayLogs.filter(a => a.checkIn !== null).length;
  const lateCount = todayLogs.filter(a => a.status === "Đi muộn").length;
  const onTimeCount = todayLogs.filter(a => a.status === "Đúng giờ").length;

  return (
    <div className="space-y-6 relative">
      
      {/* Absolute floating notifications toast container */}
      <div className="fixed bottom-6 right-6 z-55 pointer-events-none space-y-3 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-slate-950/95 backdrop-blur-md shadow-2xl relative overflow-hidden"
              style={{
                borderColor: 
                  t.type === "success" ? "rgba(16,185,129,0.3)" :
                  t.type === "warning" ? "rgba(245,158,11,0.35)" :
                  t.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"
              }}
            >
              <div 
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{
                  backgroundColor: 
                    t.type === "success" ? "#10b981" :
                    t.type === "warning" ? "#f59e0b" :
                    t.type === "error" ? "#ef4444" : "#6366f1"
                }}
              />
              <div className="shrink-0 mt-0.5">
                {t.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />}
                {t.type === "error" && <XCircle className="w-5 h-5 text-rose-500" />}
                {t.type === "info" && <Clock className="w-5 h-5 text-indigo-400" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">{t.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{t.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{t.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="shrink-0 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Hệ thống chấm công</h1>
        <p className="text-slate-400 text-sm mt-1">Ghi nhận giờ công thực tế, quản lý kỉ luật đi muộn, vắng mặt.</p>
      </div>

      {/* Realtime logs counts - Elevated to lead layout for high-level numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/20 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block font-display">Sĩ số có mặt</span>
            <p className="text-4xl font-mono font-bold text-white mt-1">{presentCount}</p>
            <p className="text-[11px] text-slate-500">Số lượng nhân sự đã ghi nhận điểm danh hôm nay</p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 mt-4 flex items-center space-x-1.5 text-indigo-400 text-xs">
            <UserCheck className="w-4 h-4 shrink-0 text-indigo-400" />
            <span className="font-semibold">Tỷ lệ: {employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0}% phòng ban</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/20 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block font-display">Đúng giờ</span>
            <p className="text-4xl font-mono font-bold text-emerald-400 mt-1">{onTimeCount}</p>
            <p className="text-[11px] text-slate-500">Điểm danh trước <span className="font-semibold text-emerald-500">{shiftConfig.startTime}</span> (ân hạn +{shiftConfig.gracePeriod}p)</p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 mt-4 flex items-center space-x-1.5 text-emerald-400 text-xs">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-500/10 shrink-0" />
            <span className="font-semibold">Kiên trì kỷ luật xuất sắc</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-amber-500/20 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block font-display">Vi phạm đi muộn</span>
            <p className="text-4xl font-mono font-bold text-amber-500 mt-1">{lateCount}</p>
            <p className="text-[11px] text-slate-500">Điểm danh sau mốc <span className="font-semibold text-amber-500">{shiftConfig.startTime}</span> (+{shiftConfig.gracePeriod}p)</p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 mt-4 flex items-center space-x-1.5 text-amber-400 text-xs">
            <Coffee className="w-4 h-4 text-amber-450 shrink-0" />
            <span className="font-semibold">Đồng bộ chế tài trừ lương</span>
          </div>
        </div>

      </div>

      {/* Check In Panel - Horizontal Control Center Row */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#101321]/90 to-indigo-950/40 border border-violet-500/15 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Section 1: Selector, Digital Time & Punch Command Action */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs uppercase font-extrabold text-violet-400 tracking-wider">Chấm Công Trực Tuyến</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">{dateString}</span>
              </div>

              {/* Employee Picker Selector Dropdown */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] text-violet-300 font-bold uppercase tracking-wider block">
                    Chọn Nhân Viên Chấm Công
                  </label>
                  <span className="text-[8px] bg-violet-500/15 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-mono font-bold">HR SIM</span>
                </div>
                <select
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value);
                    const emp = employees.find(item => item.id === e.target.value);
                    addToast("info", "Đã chọn nhân viên", `Chuyển màn hình theo dõi sang nhân sự: ${emp?.name}`);
                  }}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-lg text-white text-xs px-2.5 py-1.5 cursor-pointer font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Clock Ticker Area */}
              <div className="flex items-center space-x-3.5 py-1">
                <div className="p-2.5 bg-violet-600/10 border border-violet-500/20 rounded-xl shrink-0">
                  <Clock className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-mono font-bold text-white tracking-widest leading-none drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">{timeString}</h2>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-450 mt-1">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Hà Nội HQ (IP GPS GPS)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCheckInSimulate()}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg ${
                  isCheckedInToday 
                    ? todayRecordForActive?.checkOut 
                      ? "bg-slate-800 text-slate-500 border border-slate-700 pointer-events-none opacity-40"
                      : "bg-amber-600 hover:bg-amber-500 text-white hover:scale-[1.01]"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:scale-[1.01] glow-purple"
                }`}
              >
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {isCheckedInToday 
                    ? todayRecordForActive?.checkOut 
                      ? "Hôm nay đã hoàn thành" 
                      : `Check-out (${activeEmployee?.name.split(" ").pop()})`
                    : `Check-in (${activeEmployee?.name.split(" ").pop()})`}
                </span>
              </motion.button>
              
              {justCheckedIn && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-[10px] font-semibold text-emerald-400 mt-1.5 flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Chấm công thành công cho {activeEmployee?.name}!</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Section 2: Today Progress Radar & Real Metrics */}
          <div className="bg-slate-950/45 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] text-violet-305 font-extrabold uppercase tracking-wider block">
                Radar Trạng Thái Hôm Nay
              </span>
              <div className="flex items-center space-x-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isWorking ? "bg-emerald-500 animate-pulse" : isCompleted ? "bg-violet-400" : "bg-slate-500"
                }`} />
                <span className={`text-[9px] font-bold font-mono tracking-wider ${
                  isWorking ? "text-emerald-400" : isCompleted ? "text-violet-400" : "text-slate-400"
                }`}>
                  {isWorking ? "ĐANG LÀM VIỆC" : isCompleted ? "ĐÃ RA CA" : "CHƯA CÓ MẶT"}
                </span>
              </div>
            </div>

            {isCheckedInToday ? (
              <div className="space-y-3 py-1 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-950/60 border border-white/[0.03]">
                    <span className="text-slate-500 block text-[8px] uppercase">Giờ Vào Thống Kê</span>
                    <strong className="text-emerald-400 text-sm">{todayRecordForActive?.checkIn}</strong>
                    {todayRecordForActive?.status === "Đi muộn" && (
                      <span className="text-[8px] text-amber-500 block font-semibold mt-0.5">⚠️ Trễ giờ</span>
                    )}
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-white/[0.03]">
                    <span className="text-slate-500 block text-[8px] uppercase">Giờ Ra Thống Kê</span>
                    <strong className="text-indigo-400 text-sm">{todayRecordForActive?.checkOut || "Đang làm..."}</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-450">Thời giờ làm liên tục:</span>
                    <strong className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{currentDuration}</strong>
                  </div>
                  <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      style={{ width: `${workPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                    <span>Mốc ca chuẩn: {getExpectedShiftHours()}H</span>
                    <span>Tỉ lệ: {workPercent}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-[11px] flex-1 flex flex-col items-center justify-center space-y-1.5">
                <p>Chưa ghi nhận sự hiện diện thực tế hôm nay.</p>
                <div className="text-[8px] font-mono text-slate-650 uppercase bg-white/5 px-2 py-0.5 rounded">Phòng ban: {activeEmployee?.department}</div>
              </div>
            )}
          </div>

          {/* Section 3: Time Presets for QA/Simulation & Testing */}
          <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] text-violet-300 font-bold uppercase tracking-wider block">
                Bảng Thử Nghiệm Giả Lập Giờ
              </span>
              <span className="text-[8px] text-slate-450 font-mono">Hiệu lực: {activeEmployee?.name.split(" ").pop()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 flex-1 py-1">
              <button
                onClick={() => handleCheckInSimulate(getDynamicOnTimeSample())}
                disabled={isCompleted}
                className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 text-center disabled:opacity-20 flex flex-col items-center justify-center"
                title={`Check-in đúng giờ lúc ${getDynamicOnTimeSample()}`}
              >
                <span>☀️ Sáng {getDynamicOnTimeSample().slice(0, 5)}</span>
                <span className="text-[8px] font-normal text-emerald-400/70">Đúng ca</span>
              </button>
              <button
                onClick={() => handleCheckInSimulate(getDynamicLateSample())}
                disabled={isCompleted}
                className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 text-center disabled:opacity-20 flex flex-col items-center justify-center"
                title={`Check-in đi muộn lúc ${getDynamicLateSample()}`}
              >
                <span>⚠️ Trễ {getDynamicLateSample().slice(0, 5)}</span>
                <span className="text-[8px] font-normal text-amber-450/70">Phạt trễ</span>
              </button>
              <button
                onClick={() => handleCheckInSimulate(getDynamicEarlyCheckoutSample())}
                disabled={!isWorking}
                className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 text-center disabled:opacity-20 flex flex-col items-center justify-center"
                title={`Check-out sớm lúc ${getDynamicEarlyCheckoutSample()}`}
              >
                <span>🏃 Về {getDynamicEarlyCheckoutSample().slice(0, 5)}</span>
                <span className="text-[8px] font-normal text-rose-400/70">Về sớm</span>
              </button>
              <button
                onClick={() => handleCheckInSimulate(getDynamicOnTimeCheckoutSample())}
                disabled={!isWorking}
                className="py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 text-center disabled:opacity-20 flex flex-col items-center justify-center"
                title={`Check-out đúng giờ lúc ${getDynamicOnTimeCheckoutSample()}`}
              >
                <span>✅ Đủ {getDynamicOnTimeCheckoutSample().slice(0, 5)}</span>
                <span className="text-[8px] font-normal text-indigo-400/70">Đủ ca</span>
              </button>
            </div>
            
            <p className="text-[8px] text-slate-500 italic text-center">
              * Click mốc thời gian giả định để kiểm tra cơ chế tự động đi muộn/về sớm.
            </p>
          </div>

        </div>
      </div>

      {/* Filter and Log table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        
        {/* Subtabs Choice */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-white/5">
          <div className="flex bg-[#161a23] border border-white/5 rounded-xl p-0.5 space-x-0.5 items-center select-none shrink-0 h-9">
            <button
              onClick={() => setActiveSubTab("daily")}
              className={`px-3.5 h-full rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center ${
                activeSubTab === "daily"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Xem Chi Tiết Ngày
            </button>
            <button
              onClick={() => setActiveSubTab("monthlyRoster")}
              className={`px-3.5 h-full rounded-lg text-xs font-bold transition-all duration-150 flex items-center space-x-1 cursor-pointer ${
                activeSubTab === "monthlyRoster"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bảng Công Tổng Hợp</span>
            </button>
            <button
              onClick={() => setActiveSubTab("shiftConfig")}
              className={`px-3.5 h-full rounded-lg text-xs font-bold transition-all duration-150 flex items-center space-x-1 cursor-pointer ${
                activeSubTab === "shiftConfig"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>Cài đặt Ca & Quy định</span>
            </button>
          </div>

          {activeSubTab === "monthlyRoster" && (
            <button
              onClick={handleBridgeDeductionsToPayroll}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-550 hover:to-orange-550 text-white rounded-xl flex items-center space-x-1.5 shadow-lg active:scale-95 duration-150 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Đồng Bộ Phạt Sang Lương</span>
            </button>
          )}
        </div>

        {activeSubTab === "daily" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <span>Sổ ghi nhận chấm công hôm nay — {todayDateStr}</span>
            </h3>
            
            {/* Search tool */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhân sự..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-805 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-505 transition-all text-sm"
                />
              </div>

              <div className="w-full sm:w-56">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white appearance-none cursor-pointer focus:outline-none text-sm font-semibold"
                >
                  <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                  <option value="Đúng giờ">Đúng giờ</option>
                  <option value="Đi muộn">Đi muộn</option>
                  <option value="Chưa điểm danh">Chưa điểm danh</option>
                </select>
              </div>
            </div>

            {/* Attendance table list */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-xs uppercase font-bold">
                    <th className="p-4">Nhân viên</th>
                    <th className="p-4">Mã NV</th>
                    <th className="p-4">Giờ Check-in</th>
                    <th className="p-4">Giờ Check-out</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const log = attendance.find(a => a.employeeId === emp.id && a.date === todayDateStr);
                    const isEmployeeMatchingQuery = emp.name.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    // Status mapping
                    let statusVal = "Chưa điểm danh";
                    if (log) {
                      statusVal = log.status;
                    } else if (emp.status === "Nghỉ phép") {
                      statusVal = "Nghỉ phép";
                    }

                    // Check filter status match
                    const matchesStatusFilter = 
                      selectedStatus === "Tất cả trạng thái" ||
                      (selectedStatus === "Chưa điểm danh" && !log) ||
                      (log && log.status === selectedStatus);

                    if (!isEmployeeMatchingQuery || !matchesStatusFilter) return null;

                    return (
                      <tr key={emp.id} className="border-b border-slate-800/60 hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs font-mono">
                            {emp.name.split(" ").pop()?.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{emp.name}</span>
                        </td>
                        <td className="p-4 font-mono text-xs">{emp.code}</td>
                        <td className="p-4 font-mono text-emerald-400 font-medium">
                          {log?.checkIn || <span className="text-slate-650">—</span>}
                        </td>
                        <td className="p-4 font-mono text-indigo-405 font-medium">
                          {log?.checkOut || <span className="text-slate-650">—</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            statusVal === "Đúng giờ" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : statusVal === "Đi muộn" 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : statusVal === "Nghỉ phép"
                                  ? "bg-stone-800 text-stone-400"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                          }`}>
                            {statusVal}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400">{log?.notes || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === "monthlyRoster" && (
          <div className="space-y-4">
            {/* Bridge Success Toast */}
            <AnimatePresence>
              {bridgeResult && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl bg-gradient-to-r from-amber-600/15 via-orange-600/10 to-[#12141c] border border-amber-500/30 text-white space-y-2"
                >
                  <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs tracking-wider uppercase">
                    <CheckCircle className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span>Đồng bộ khấu trừ thành công sang bảng lương kì này!</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono">
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Số hành vi trễ phát hiện</span>
                      <strong className="text-amber-400 text-md">{bridgeResult.totalLates} lượt</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Lao động chịu phạt</span>
                      <strong className="text-amber-400 text-md">{bridgeResult.employeesAffected} nhân viên</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Tổng hạch toán phạt</span>
                      <strong className="text-rose-405 text-md">+{bridgeResult.totalPenaltyAmount.toLocaleString()}đ</strong>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 italic pt-1 text-right">
                    * Hệ thống đã gộp các hành vi đi muộn trong tuần ({shiftConfig.penaltyRate.toLocaleString()}đ/lượt) vào mục Khấu trừ & tự động giảm trừ Thực lĩnh trong bảng lương.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Roster Grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#101217]/50">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-405 border-b border-slate-800 font-mono text-xs uppercase font-bold">
                    <th className="p-4">Nhân viên</th>
                    {recentDates.map(d => (
                      <th key={d} className="p-4 text-center">
                        {d.slice(8, 10)}/{d.slice(5, 7)}
                      </th>
                    ))}
                    <th className="p-4 text-center">Tổng Trễ</th>
                    <th className="p-4 text-right">Ảnh hưởng lương (Ước tính)</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    // Count late times in recentDates
                    const empLogs = attendance.filter(a => a.employeeId === emp.id && recentDates.includes(a.date));
                    const lateTimes = empLogs.filter(a => a.status === "Đi muộn").length;
                    
                    return (
                      <tr key={emp.id} className="border-b border-slate-800/55 hover:bg-slate-900/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-950/65 text-indigo-405 flex items-center justify-center font-bold text-xs font-mono">
                              {emp.name.split(" ").pop()?.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-white block">{emp.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{emp.code} • {emp.department}</span>
                            </div>
                          </div>
                        </td>

                        {recentDates.map(d => {
                          const log = attendance.find(a => a.employeeId === emp.id && a.date === d);
                          
                          let badge = (
                            <span className="text-[10px] text-slate-650">• Vắng</span>
                          );
                          if (log) {
                            if (log.status === "Đúng giờ") {
                              badge = (
                                <span className="text-emerald-400 font-extrabold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">✔ Đúng giờ</span>
                              );
                            } else if (log.status === "Đi muộn") {
                              badge = (
                                <span className="text-amber-400 font-extrabold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">⚠ Trễ</span>
                              );
                            }
                          } else if (emp.status === "Nghỉ phép") {
                            badge = (
                              <span className="text-stone-400 text-[10px] bg-stone-850 px-2 py-0.5 rounded">☕ Phép</span>
                            );
                          }

                          return (
                            <td key={d} className="p-4 text-center">
                              {badge}
                            </td>
                          );
                        })}

                        <td className="p-4 text-center font-bold text-xs font-mono text-amber-500">
                          {lateTimes > 0 ? `${lateTimes} lần` : <span className="text-white/20 font-normal">-</span>}
                        </td>

                        <td className="p-4 text-right font-mono font-extrabold text-xs text-rose-500">
                          {lateTimes > 0 ? `-${(lateTimes * shiftConfig.penaltyRate).toLocaleString()}đ` : <span className="text-white/30 font-normal">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-white/2 rounded-xl text-[10px] text-slate-500 flex items-center gap-1.5 font-sans justify-center">
              <HelpCircle className="w-3.5 h-3.5 text-slate-650" />
              <span>Các mốc "Trễ" trong tuần được tổng hợp và tự động gánh phạt khấu trừ trực tiếp {shiftConfig.penaltyRate.toLocaleString()} VND / lần đi muộn.</span>
            </div>
          </div>
        )}

        {activeSubTab === "shiftConfig" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-violet-400" />
                  <span>Cấu hình Ca làm việc & Chế tài Kỷ luật</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Điều chỉnh linh hoạt thời giờ ca kíp hành chính, biên độ ân hạn và chế tài trừ lương tự động.</p>
              </div>
              <button
                onClick={() => {
                  addToast("success", "Lưu thiết lập", "Đã đồng bộ hoá toàn bộ thời gian & cấu hình kỷ luật mới thành công!");
                }}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer active:scale-95 duration-100"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Lưu & Áp dụng</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form inputs */}
              <div className="lg:col-span-7 bg-[#11141c]/50 p-6 rounded-2xl border border-slate-800/80 space-y-5">
                <h4 className="text-xs font-bold text-violet-350 uppercase tracking-wider font-mono">Mốc Thời Gian Chuẩn</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">Giờ vào ca hành chính (Check-in)</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="time" 
                        value={shiftConfig.startTime} 
                        onChange={(e) => setShiftConfig(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 font-mono cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">Giờ về ca hành chính (Check-out)</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="time" 
                        value={shiftConfig.endTime} 
                        onChange={(e) => setShiftConfig(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 font-mono cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs text-slate-300 font-semibold block">Biên sai số / Thời gian ân hạn đi muộn</label>
                    <span className="text-xs font-extrabold text-violet-400 font-mono">{shiftConfig.gracePeriod} phút</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="60" 
                      step="5"
                      value={shiftConfig.gracePeriod}
                      onChange={(e) => setShiftConfig(prev => ({ ...prev, gracePeriod: Number(e.target.value) }))}
                      className="flex-1 accent-violet-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0p (Không ân hạn)</span>
                    <span>15p</span>
                    <span>30p</span>
                    <span>60p</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-800/60 pt-4">
                  <h4 className="text-xs font-bold text-violet-350 uppercase tracking-wider font-mono">Hạch toán rủi ro & Chế tài</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-semibold block">Mức tiền phạt đi trễ mỗi lượt (VND)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550 font-semibold text-xs">VND</span>
                        <input 
                          type="number" 
                          value={shiftConfig.penaltyRate} 
                          onChange={(e) => setShiftConfig(prev => ({ ...prev, penaltyRate: Number(e.target.value) }))}
                          className="w-full pl-12 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 font-mono"
                          placeholder="Nhập số tiền..."
                        />
                      </div>
                      
                      {/* Presets */}
                      <div className="flex gap-1 shrink-0">
                        {[50000, 100000, 120000, 150000, 200000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setShiftConfig(prev => ({ ...prev, penaltyRate: preset }))}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              shiftConfig.penaltyRate === preset
                                ? "bg-violet-600/30 text-violet-400 border-violet-500/30"
                                : "bg-slate-950 text-slate-550 border-slate-850 hover:bg-slate-900"
                            }`}
                          >
                            {(preset / 1000).toLocaleString()}k
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#141620] to-[#0e1017] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1.5 pb-2 border-b border-white/5">
                    <Sparkles className="w-4 h-4 text-violet-400 animate-pulse animate-duration-1000" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider block font-display">Tác động chuyển hóa</span>
                  </div>

                  {/* Scheduler timeline graphic */}
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Lao động chấm công vào những khoảng thời giờ khác nhau sẽ tự động hạch toán theo biểu mẫu dưới đây:
                    </p>

                    <div className="space-y-2.5">
                      {/* On-Time Period */}
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-12 rounded bg-emerald-500 shrink-0 mt-1" />
                        <div className="flex-1 space-y-0.5">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 font-display">
                            ĐÚNG GIỜ (Hợp lệ)
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono">Trước {shiftConfig.startTime}</p>
                          <p className="text-[10px] text-slate-450 italic">Đạt chỉ tiêu kỷ luật, không hao tổn ngày công.</p>
                        </div>
                      </div>

                      {/* Grace Period */}
                      {shiftConfig.gracePeriod > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-1 h-12 rounded bg-amber-500 shrink-0 mt-1" />
                          <div className="flex-1 space-y-0.5">
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 font-display">
                              ÂN HẠN (Mở rộng)
                            </span>
                            <p className="text-[10px] text-slate-500 font-mono">Từ {shiftConfig.startTime} đến {
                              (() => {
                                const [h, m] = shiftConfig.startTime.split(":").map(Number);
                                const total = h * 60 + m + shiftConfig.gracePeriod;
                                return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
                              })()
                            }</p>
                            <p className="text-[10px] text-slate-450 italic">Trễ trong biên độ {shiftConfig.gracePeriod}p cho phép, không hạch toán phạt lội.</p>
                          </div>
                        </div>
                      )}

                      {/* Late Period */}
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-12 rounded bg-rose-500 shrink-0 mt-1" />
                        <div className="flex-1 space-y-0.5">
                          <span className="text-[11px] font-bold text-rose-450 flex items-center gap-1 font-display">
                            ĐI MUỘN (Phạt tiền)
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono">Sau {
                            (() => {
                              const [h, m] = shiftConfig.startTime.split(":").map(Number);
                              const total = h * 60 + m + shiftConfig.gracePeriod;
                              return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
                            })()
                          }</p>
                          <p className="text-[10px] text-slate-450 italic font-semibold">Tự động cấu trừ <span className="text-rose-400 font-bold">-{shiftConfig.penaltyRate.toLocaleString()}đ</span> từ bảng lương.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-violet-300 font-mono tracking-wider block">CƠ CHẾ ĐỒNG BỘ ĐỒNG THỜI</span>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-sans">
                    Phạt tiền đi trễ cộng dồn trong quá trình lưu trữ sẽ được quy nạp tự động vào mục "Khấu trừ" của bảng lương mỗi kì khi nhấn nút <strong className="text-amber-500">Đồng Bộ Phạt Sang Lương</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
