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
  Sparkles
} from "lucide-react";
import { Employee, Attendance, Payroll as PayrollType } from "../types";

interface TimeAttendanceProps {
  employees: Employee[];
  attendance: Attendance[];
  setAttendance: Dispatch<SetStateAction<Attendance[]>>;
  payroll: PayrollType[];
  setPayroll: Dispatch<SetStateAction<PayrollType[]>>;
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

  const [activeSubTab, setActiveSubTab] = useState<"daily" | "monthlyRoster">("daily");
  const [bridgeResult, setBridgeResult] = useState<{
    processed: boolean;
    totalLates: number;
    employeesAffected: number;
    totalPenaltyAmount: number;
  } | null>(null);

  const recentDates = ["2026-05-16", "2026-05-17", "2026-05-18", "2026-05-19", "2026-05-20"];

  const handleBridgeDeductionsToPayroll = () => {
    if (!payroll || !setPayroll) return;

    let totalLatesCount = 0;
    let employeesAffectedCount = 0;
    const penaltyRate = 120000; // 120,000 VND per late check-in

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

    // Reset after 8 seconds
    setTimeout(() => {
      setBridgeResult(null);
    }, 8000);
  };

  // Select first employee or HR Manager (Lan Anh) on mount
  useEffect(() => {
    if (employees.length > 0) {
      const manager = employees.find(e => e.id === "emp04" || e.name.includes("Lan Anh"));
      if (manager) {
        setSelectedEmpId(manager.id);
      } else {
        setSelectedEmpId(employees[0].id);
      }
    }
  }, [employees]);

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

  const handleCheckInSimulate = () => {
    if (!selectedEmpId) {
      alert("Vui lòng chọn nhân viên!");
      return;
    }

    if (isCheckedInToday && todayRecordForActive?.checkOut) {
      alert(`Nhân viên ${activeEmployee?.name} đã hoàn thành check-out hôm nay!`);
      return;
    }

    if (!isCheckedInToday) {
      // Check in
      const currentHour = time.getHours();
      const currentMin = time.getMinutes();
      // Late threshold: 08:30 AM
      const isLate = currentHour > 8 || (currentHour === 8 && currentMin > 30);
      
      const newRecord: Attendance = {
        id: `att-${Date.now()}`,
        employeeId: selectedEmpId,
        date: "2026-05-20",
        checkIn: timeString,
        checkOut: null as any,
        status: isLate ? "Đi muộn" : "Đúng giờ",
        notes: `Ghi nhận check-in trực tuyến của ${activeEmployee?.name}`
      };

      setAttendance([...attendance, newRecord]);
      setJustCheckedIn("CHECK_IN");
      setTimeout(() => setJustCheckedIn(null), 3000);
    } else {
      // Check out
      setAttendance(attendance.map(a => {
        if (a.employeeId === selectedEmpId && a.date === "2026-05-20") {
          return {
            ...a,
            checkOut: timeString,
            notes: `Ghi nhận check-out hoàn thành ngày công của ${activeEmployee?.name}`
          };
        }
        return a;
      }));
      setJustCheckedIn("CHECK_OUT");
      setTimeout(() => setJustCheckedIn(null), 3000);
    }
  };

  // Stats today
  const todayDateStr = "2026-05-20";
  const todayLogs = attendance.filter(a => a.date === todayDateStr);
  const presentCount = todayLogs.filter(a => a.checkIn !== null).length;
  const lateCount = todayLogs.filter(a => a.status === "Đi muộn").length;
  const onTimeCount = todayLogs.filter(a => a.status === "Đúng giờ").length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Hệ thống chấm công</h1>
        <p className="text-slate-400 text-sm mt-1">Ghi nhận giờ công thực tế, quản lý kỉ luật đi muộn, vắng mặt.</p>
      </div>

      {/* Check In Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Clock Box */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-violet-950/40 border border-violet-500/20 flex flex-col items-center text-center justify-between relative overflow-hidden min-h-[385px] h-auto space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 w-full">
            <span className="text-xs uppercase font-bold text-violet-400 tracking-wider">Chấm Công Trực Tuyến</span>
            <p className="text-[11px] text-slate-400">{dateString}</p>
          </div>

          {/* Employee Picker Selector Dropdown */}
          <div className="w-full text-left bg-slate-950/30 p-3 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-violet-300 font-bold uppercase tracking-wider block">
                Chọn Nhân viên chấm công
              </label>
              <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-mono">HR SIM</span>
            </div>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-lg text-white text-xs px-2.5 py-1.5 cursor-pointer font-medium"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.code} - {emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 w-full">
            <h2 className="text-4xl font-mono font-bold text-white tracking-widest leading-none drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">{timeString}</h2>
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 mt-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Vị trí hợp lệ: Trụ sở Hà Nội (IP GPS)</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full pt-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCheckInSimulate}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg ${
                isCheckedInToday 
                  ? todayRecordForActive?.checkOut 
                    ? "bg-slate-800 text-slate-500 border border-slate-700 pointer-events-none"
                    : "bg-amber-600 hover:bg-amber-500 text-white hover:scale-[1.01]"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:scale-[1.01] glow-purple"
              }`}
            >
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {isCheckedInToday 
                  ? todayRecordForActive?.checkOut 
                    ? "Đã hoàn thành ngày công" 
                    : `Check-out (${activeEmployee?.name.split(" ").pop()})`
                  : `Check-in (${activeEmployee?.name.split(" ").pop()})`}
              </span>
            </motion.button>
            
            {justCheckedIn && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-xs font-semibold text-emerald-400 mt-2 flex items-center justify-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Thực hiện {justCheckedIn === "CHECK_IN" ? "Check-in" : "Check-out"} cho {activeEmployee?.name}!</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Realtime logs counts */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Điểm danh có mặt</span>
              <p className="text-4xl font-display font-bold text-white mt-1">{presentCount}</p>
              <p className="text-[11px] text-slate-500">Số lượng nhân sự đã check-in hôm nay</p>
            </div>
            <div className="pt-3 border-t border-slate-800/60 mt-4 flex items-center space-x-1 text-emerald-400 text-xs">
              <UserCheck className="w-4 h-4" />
              <span>Tỉ lệ: {Math.round((presentCount / employees.length) * 100)}% toàn thể</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Check-in Đúng giờ</span>
              <p className="text-4xl font-display font-bold text-emerald-400 mt-1">{onTimeCount}</p>
              <p className="text-[11px] text-slate-500">Điểm danh trước 08:30 AM sáng nay</p>
            </div>
            <div className="pt-3 border-t border-slate-800/60 mt-4 flex items-center space-x-1 text-emerald-400 text-xs">
              <Zap className="w-4 h-4 fill-emerald-500/20" />
              <span>Tác phong kỷ luật xuất sắc</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Vi phạm Đi muộn</span>
              <p className="text-4xl font-display font-bold text-amber-500 mt-1">{lateCount}</p>
              <p className="text-[11px] text-slate-500">Nhân sự điểm danh muộn sau 08:31 AM</p>
            </div>
            <div className="pt-3 border-t border-slate-800/60 mt-4 flex items-center space-x-1 text-amber-400 text-xs">
              <Coffee className="w-4 h-4" />
              <span>Rà soát nhắc nhở kỉ luật</span>
            </div>
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

        {activeSubTab === "daily" ? (
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
                          {log?.checkIn || <span className="text-slate-605">—</span>}
                        </td>
                        <td className="p-4 font-mono text-indigo-405 font-medium">
                          {log?.checkOut || <span className="text-slate-605">—</span>}
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
        ) : (
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
                    * Hệ thống đã gộp các hành vi đi muộn trong tuần (120,000 VND/lượt) vào mục Khấu trừ & tự động giảm trừ Thực lĩnh trong bảng lương.
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
                          {lateTimes > 0 ? `-${(lateTimes * 120000).toLocaleString()}đ` : <span className="text-white/30 font-normal">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-white/2 rounded-xl text-[10px] text-slate-500 flex items-center gap-1.5 font-sans justify-center">
              <HelpCircle className="w-3.5 h-3.5 text-slate-650" />
              <span>Các mốc "Trễ" trong tuần được tổng hợp và tự động gánh phạt khấu trừ trực tiếp 120,000 VND / làn đi muộn.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
