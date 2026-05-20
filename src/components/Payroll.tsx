/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  RefreshCcw, 
  CornerDownRight, 
  HelpCircle, 
  CheckCircle, 
  Eye, 
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  FileText,
  Clock,
  Briefcase,
  Search,
  Download
} from "lucide-react";
import { Employee, Attendance, LeaveRequest, Contract, Payroll as PayrollType } from "../types";

interface PayrollProps {
  employees: Employee[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  contracts: Contract[];
  payroll: PayrollType[];
  setPayroll: Dispatch<SetStateAction<PayrollType[]>>;
}

export default function Payroll({ 
  employees, 
  attendance, 
  leaveRequests, 
  contracts, 
  payroll, 
  setPayroll 
}: PayrollProps) {
  const [selectedMonth, setSelectedMonth] = useState("05/2026");
  const [selectedPay, setSelectedPay] = useState<PayrollType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  const factor = viewMode === "yearly" ? 12 : 1;

  // Advance modal form
  const [advancingPay, setAdvancingPay] = useState<PayrollType | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState(2000000);

  // Recalculately Sync logs
  const [syncStatusLog, setSyncStatusLog] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Statistics
  const totalPayrollCost = payroll.reduce((acc, p) => acc + p.netSalary, 0);
  const averageSalary = payroll.length > 0 ? Math.round(totalPayrollCost / payroll.length) : 0;
  const pendingApprovalCount = payroll.filter(p => p.status === "Chờ duyệt").length;

  // Sync Logic: Deeply connects Contracts, Attendance and Leaves!
  const handleSyncWithHRM = () => {
    setSyncStatusLog("syncing");
    
    // Simulate complex calculation
    setTimeout(() => {
      const updatedPayrollList = employees.map(emp => {
        // 1. Get base salary & allowance from active contract (Module 4 limit link!)
        const activeCon = contracts.find(c => c.employeeId === emp.id && c.status === "Đang hiệu lực");
        const basicSalary = activeCon ? activeCon.basicSalary : emp.salary;
        const allowance = activeCon ? activeCon.allowance : 1000000;

        // 2. Count actual present days from Chấm công module (Module 2 link!)
        const empAttendance = attendance.filter(att => att.employeeId === emp.id && att.date.startsWith("2026-05"));
        const presentDaysCount = empAttendance.filter(att => att.status === "Đúng giờ" || att.status === "Đi muộn").length;
        
        // Count late arrivals
        const lateCount = empAttendance.filter(att => att.status === "Đi muộn").length;

        // 3. Count approved leaves from Nghi phép module (Module 5 link!)
        // If they had "Phép năm", it is paid. If "Việc riêng", it is unpaid -> deducts salary!
        const approvedLeaves = leaveRequests.filter(lr => lr.employeeId === emp.id && lr.status === "Đã duyệt");
        const unpaidLeaveDays = approvedLeaves.filter(lr => lr.type === "Việc riêng" || lr.type === "Nghỉ ốm").length; // simple logic

        // Standard working days per month is 22
        const defaultWorkDays = presentDaysCount > 0 ? presentDaysCount : 20; // fallback to seed
        
        // 4. Calculate deductions: (Late Count * 100,000đ penalty) + (Unpaid Leaves * (basicSalary / 22))
        const latePenalty = lateCount * 100000;
        const unpaidDeduction = Math.round(unpaidLeaveDays * (basicSalary / 22));
        const deductions = 1000000 + latePenalty + unpaidDeduction; // base insurance flat ~ 1M + penalty

        // 5. Overtime logic: each tech lead gets small mock hours
        const overtimeHours = emp.department === "Kỹ thuật" ? 8 : 0;
        const overtimePay = overtimeHours * 200000; // 200k/hour

        // Existing advance payments
        const existingRecord = payroll.find(p => p.employeeId === emp.id);
        const advanceValue = existingRecord ? existingRecord.advance : 0;

        // Net computation:
        // Basic salary pro-rated to actual work days + allowance + overtime - deductions - advance
        const calculatedNet = Math.round(
          (basicSalary * (defaultWorkDays / 22)) + allowance + overtimePay - deductions - advanceValue
        );

        return {
          id: existingRecord?.id || `pay0${Math.floor(Math.random() * 1000)}`,
          employeeId: emp.id,
          employeeName: emp.name,
          month: selectedMonth,
          basicSalary,
          workDays: defaultWorkDays,
          overtimeHours,
          allowance,
          deductions,
          advance: advanceValue,
          netSalary: calculatedNet > 0 ? calculatedNet : 1000000, // safety floor
          status: "Chờ duyệt" as const
        };
      });

      setPayroll(updatedPayrollList);
      setSyncStatusLog("Đã đồng bộ thành công! Số liệu được tổng hợp từ " + attendance.length + " lịch sử chấm công và " + leaveRequests.length + " phiếu nghỉ phép.");
    }, 850);
  };

  // Advance submission
  const handleAdvanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!advancingPay) return;

    const updated = payroll.map(p => {
      if (p.id === advancingPay.id) {
        const newAdvanceVal = p.advance + advanceAmount;
        const recalculatedNet = p.netSalary - advanceAmount;
        return {
          ...p,
          advance: newAdvanceVal,
          netSalary: recalculatedNet > 0 ? recalculatedNet : 0
        };
      }
      return p;
    });

    setPayroll(updated);
    setAdvancingPay(null);
  };

  // Change individual status to Paid
  const handleApprovePayroll = (id: string) => {
    const updated = payroll.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: "Đã thanh toán" as const
        };
      }
      return p;
    });
    setPayroll(updated);
  };

  // Update workDays directly in state & recalculate net
  const handleUpdateWorkDays = (id: string, newDays: number) => {
    if (newDays < 0 || newDays > 31) return;
    const updated = payroll.map(p => {
      if (p.id === id) {
        const overtimePay = p.overtimeHours * 200000;
        const netSal = Math.round(
          (p.basicSalary * (newDays / 22)) + p.allowance + overtimePay - p.deductions - p.advance
        );
        return {
          ...p,
          workDays: newDays,
          netSalary: netSal > 0 ? netSal : 0
        };
      }
      return p;
    });
    setPayroll(updated);
  };

  // Update OT hours directly in state & recalculate net
  const handleUpdateOvertime = (id: string, newHours: number) => {
    if (newHours < 0) return;
    const updated = payroll.map(p => {
      if (p.id === id) {
        const overtimePay = newHours * 200000;
        const netSal = Math.round(
          (p.basicSalary * (p.workDays / 22)) + p.allowance + overtimePay - p.deductions - p.advance
        );
        return {
          ...p,
          overtimeHours: newHours,
          netSalary: netSal > 0 ? netSal : 0
        };
      }
      return p;
    });
    setPayroll(updated);
  };

  // Batch approve/pay all Pending records
  const handleBatchApprove = () => {
    const updated = payroll.map(p => {
      if (p.status === "Chờ duyệt") {
        return {
          ...p,
          status: "Đã thanh toán" as const
        };
      }
      return p;
    });
    setPayroll(updated);
    
    setSyncStatusLog("Chi trả hàng loạt thành công! Đã kích hoạt chuyển khoản thực tế qua cổng ảo cho " + pendingApprovalCount + " nhân sự.");
  };

  // Export current salary report to CSV/Excel format
  const handleExportPayroll = () => {
    const headers = [
      "ID nhan vien",
      "Ho va ten",
      "Chu ky / Che do",
      `Luong co ban (${viewMode === "yearly" ? "Nam" : "Thang"})`,
      `Ngay cong (${viewMode === "yearly" ? "Nam" : "Thang"})`,
      `Tang ca (${viewMode === "yearly" ? "Nam" : "Gio"})`,
      `Phu cap & OT (${viewMode === "yearly" ? "Nam" : "Thang"})`,
      `Khau tru (${viewMode === "yearly" ? "Nam" : "Thang"})`,
      `Tam ung (${viewMode === "yearly" ? "Nam" : "Thang"})`,
      `Thuc linh (${viewMode === "yearly" ? "Du toan Nam" : "Thang"})`,
      "Trang thai"
    ];

    const rows = filteredPayroll.map(pay => {
      const basic = pay.basicSalary * factor;
      const workDays = viewMode === "yearly" ? pay.workDays * 12 : pay.workDays;
      const otHours = viewMode === "yearly" ? pay.overtimeHours * 12 : pay.overtimeHours;
      const bonusOt = (pay.allowance + pay.overtimeHours * 200000) * factor;
      const deductions = pay.deductions * factor;
      const advance = pay.advance * factor;
      const net = pay.netSalary * factor;

      return [
        pay.employeeId,
        `"${pay.employeeName.replace(/"/g, '""')}"`,
        `"${viewMode === "yearly" ? "Ca nam 12 thang" : pay.month}"`,
        basic,
        workDays,
        otHours,
        bonusOt,
        deductions,
        advance,
        net,
        `"${pay.status}"`
      ];
    });

    // Excel compatibility: use UTF-8 BOM (\uFEFF)
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const modeStr = viewMode === "yearly" ? "NAM" : `THANG_${selectedMonth.replace("/", "_")}`;
    link.download = `Dong_Bo_Bao_Cao_Luong_${modeStr}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSyncStatusLog("Báo cáo lương hiện tại đã được xuất thành công dưới dạng CSV (Tốc độ cao & Đọc được trực tiếp bằng Excel)!");
  };

  // Filter lists
  const filteredPayroll = payroll.filter(p => {
    const matchesSearch = p.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "Tất cả" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-text">
      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight font-sans">Bảng Tính Lương Doanh Nghiệp</h1>
          <p className="text-white/45 text-sm mt-1">Chu kỳ hạch toán lương kết tuần/tháng, kết xuất khấu trừ & tạm ứng chính xác</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSyncWithHRM}
            disabled={syncStatusLog === "syncing"}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
          >
            <RefreshCcw className={`w-4 h-4 ${syncStatusLog === "syncing" ? "animate-spin" : ""}`} />
            <span>{syncStatusLog === "syncing" ? "Đang đồng bộ..." : "Đồng bộ Chấm công & Phép"}</span>
          </button>
        </div>
      </header>

      {/* KPI Salary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              {viewMode === "yearly" ? "Ước tính Quỹ lương Năm" : `Tổng quỹ lương ${selectedMonth}`}
            </span>
            <p className="text-2xl font-mono font-bold text-violet-400">{(totalPayrollCost * factor).toLocaleString()}đ</p>
            <p className="text-xs text-white/55">
              {viewMode === "yearly" ? "Dự toán chuyển khoản 12 tháng" : "Thực lĩnh bàn giao nhân sự"}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-violet-600/10 text-violet-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              {viewMode === "yearly" ? "Thu nhập bình quân Năm" : "Lương bình quân thực tế"}
            </span>
            <p className="text-2xl font-mono font-bold text-emerald-400">{(averageSalary * factor).toLocaleString()}đ</p>
            <p className="text-xs text-white/55">Đã bao gồm phụ cấp & OT</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Chưa phê duyệt chi</span>
            <p className="text-2xl font-mono font-bold text-amber-500">{pendingApprovalCount}</p>
            <p className="text-xs text-white/55">Phiếu lương đang chờ duyệt</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              {viewMode === "yearly" ? "Ước tính Khấu trừ Năm" : "Khấu trừ toàn cục"}
            </span>
            <p className="text-2xl font-mono font-bold text-rose-400">
              {(payroll.reduce((acc, p) => acc + p.deductions, 0) * factor).toLocaleString()} <span className="text-xs">đ</span>
            </p>
            <p className="text-xs text-white/55">Thuế, phạt, BHXH, v.v...</p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sync Log Alert Notification */}
      {syncStatusLog && syncStatusLog !== "syncing" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-violet-600/15 border border-violet-500/30 text-white text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-violet-400" />
            <span>{syncStatusLog}</span>
          </div>
          <X className="w-4 h-4 opacity-55 hover:opacity-100 cursor-pointer" onClick={() => setSyncStatusLog("")} />
        </motion.div>
      )}

      {/* Tables Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          {/* Monthly / Yearly view toggler */}
          <div className="flex border border-white/10 bg-[#161920] rounded-xl p-0.5 space-x-0.5 h-9 items-center shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={`px-3.5 h-full rounded-lg text-xs font-bold transition-all duration-255 select-none cursor-pointer flex items-center ${
                viewMode === "monthly"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20"
                  : "text-white/60 hover:text-white hover:bg-white/3"
              }`}
            >
              Lương Tháng
            </button>
            <button
              type="button"
              onClick={() => setViewMode("yearly")}
              className={`px-3.5 h-full rounded-lg text-xs font-bold transition-all duration-255 select-none cursor-pointer flex items-center ${
                viewMode === "yearly"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20"
                  : "text-white/60 hover:text-white hover:bg-white/3"
              }`}
            >
              Lương Toàn Năm (x12)
            </button>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 h-9 bg-[#161920] border border-white/10 rounded-xl text-white text-xs select-none focus:outline-none cursor-pointer"
          >
            <option value="05/2026">Chu kỳ 05/2026</option>
            <option value="06/2026">Chu kỳ 06/2026</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 h-9 bg-[#161920] border border-white/10 rounded-xl text-white text-xs select-none focus:outline-none cursor-pointer"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đang tính toán">Đang tính toán</option>
          </select>

          {pendingApprovalCount > 0 && (
            <button
              onClick={handleBatchApprove}
              className="px-3.5 h-9 bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl flex items-center space-x-1 shadow-lg active:scale-95 duration-150 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Duyệt Chi Khẩn Cấp ({pendingApprovalCount})</span>
            </button>
          )}

          <button
            onClick={handleExportPayroll}
            className="px-3.5 h-9 bg-violet-600/20 border border-violet-500/35 hover:bg-violet-600 hover:border-violet-400 text-violet-200 hover:text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg active:scale-95 duration-150 cursor-pointer transition-all"
            title="Xuất bảng lương ra dạng tệp CSV/Excel"
          >
            <Download className="w-3.5 h-3.5 text-violet-300" />
            <span>Xuất báo cáo lương</span>
          </button>
        </div>
      </div>

      {/* Main Payslip Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/65 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80 border-collapse">
            <thead className="bg-[#0b0c12]/90 text-white/40 uppercase tracking-widest font-mono text-[9px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4.5 font-bold">Nhân viên / Chu kỳ</th>
                <th className="px-5 py-4.5 text-right font-bold">Lương cơ bản ({viewMode === "yearly" ? "năm" : "tháng"})</th>
                <th className="px-4 py-4.5 text-center font-bold">Ngày công {viewMode === "yearly" ? "(năm)" : "(Chuển 22)"}</th>
                <th className="px-4 py-4.5 text-center font-bold">Tăng ca {viewMode === "yearly" ? "(năm)" : "(Giờ)"}</th>
                <th className="px-4 py-4.5 text-right font-bold">Phụ cấp & OT ({viewMode === "yearly" ? "năm" : "tháng"})</th>
                <th className="px-4 py-4.5 text-right font-bold">Khấu trừ ({viewMode === "yearly" ? "năm" : "tháng"})</th>
                <th className="px-4 py-4.5 text-right font-bold">Tạm ứng ({viewMode === "yearly" ? "năm" : "tháng"})</th>
                <th className="px-6 py-4.5 text-right font-extrabold text-violet-300 bg-violet-950/10">Thực lĩnh ({viewMode === "yearly" ? "Dự toán" : "tháng"})</th>
                <th className="px-6 py-4.5 text-center font-bold">Trạng thái</th>
                <th className="px-6 py-4.5 text-center font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredPayroll.map((pay) => {
                // Generate a beautiful colorful avatar initial for the employee
                const nameInitials = pay.employeeName
                  ? pay.employeeName.split(" ").slice(-2).map(n => n ? n[0] : "").join("")
                  : "NV";
                
                return (
                  <tr key={pay.id} className="hover:bg-violet-600/[0.03] transition-all duration-150 group">
                    <td className="px-6 py-5.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/20 flex items-center justify-center font-bold text-violet-300 text-xs shadow-inner">
                          {nameInitials}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-violet-400 transition-colors duration-150 text-xs">
                            {pay.employeeName}
                          </p>
                          <span className="text-[10px] text-white/35 font-mono">
                            {viewMode === "yearly" ? "Mô phỏng 12 tháng" : pay.month}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5.5 text-right font-mono text-white/70">
                      {(pay.basicSalary * factor).toLocaleString()}đ
                    </td>
                    <td className="px-4 py-5.5 text-center">
                      {viewMode === "yearly" ? (
                        <span className="font-mono font-bold text-violet-400 bg-violet-450/10 border border-violet-500/15 py-1 px-2.5 rounded-lg">
                          {pay.workDays * 12} ngày
                        </span>
                      ) : (
                        <div className="inline-flex items-center space-x-1 border border-white/5 bg-slate-950/50 p-1 rounded-lg">
                          <button
                            onClick={() => handleUpdateWorkDays(pay.id, pay.workDays - 1)}
                            disabled={pay.status === "Đã thanh toán" || pay.workDays <= 0}
                            className="w-5 h-5 bg-white/5 hover:bg-white/10 text-white rounded-md flex items-center justify-center font-mono text-xs cursor-pointer disabled:opacity-20 disabled:pointer-events-none duration-100"
                          >
                            -
                          </button>
                          <span className="text-violet-400 font-bold font-mono text-xs w-6 text-center">{pay.workDays}</span>
                          <button
                            onClick={() => handleUpdateWorkDays(pay.id, pay.workDays + 1)}
                            disabled={pay.status === "Đã thanh toán" || pay.workDays >= 31}
                            className="w-5 h-5 bg-white/5 hover:bg-white/10 text-white rounded-md flex items-center justify-center font-mono text-xs cursor-pointer disabled:opacity-20 disabled:pointer-events-none duration-100"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-5.5 text-center">
                      {viewMode === "yearly" ? (
                        <span className="font-mono text-white/50 bg-white/3 border border-white/5 py-1 px-2 rounded-lg">
                          {pay.overtimeHours > 0 ? `+${pay.overtimeHours * 12}h` : "-"}
                        </span>
                      ) : (
                        <div className="inline-flex items-center space-x-1 border border-white/5 bg-slate-950/50 p-1 rounded-lg">
                          <button
                            onClick={() => handleUpdateOvertime(pay.id, Math.max(0, pay.overtimeHours - 1))}
                            disabled={pay.status === "Đã thanh toán" || pay.overtimeHours <= 0}
                            className="w-5 h-5 bg-white/5 hover:bg-white/10 text-white rounded-md flex items-center justify-center font-mono text-xs cursor-pointer disabled:opacity-20 disabled:pointer-events-none duration-100"
                          >
                            -
                          </button>
                          <span className="text-white/70 font-mono text-xs w-6 text-center">{pay.overtimeHours}h</span>
                          <button
                            onClick={() => handleUpdateOvertime(pay.id, pay.overtimeHours + 1)}
                            disabled={pay.status === "Đã thanh toán"}
                            className="w-5 h-5 bg-white/5 hover:bg-white/10 text-white rounded-md flex items-center justify-center font-mono text-xs cursor-pointer disabled:opacity-20 duration-100"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-5.5 text-right font-mono">
                      <span className="inline-block bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                        +{((pay.allowance + pay.overtimeHours * 200000) * factor).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-4 py-5.5 text-right font-mono">
                      <span className="inline-block bg-rose-500/5 text-rose-400 border border-rose-500/10 px-2.5 py-1 rounded-lg text-[11px]">
                        -{(pay.deductions * factor).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-4 py-5.5 text-right font-mono">
                      {pay.advance > 0 ? (
                        <span className="inline-block bg-amber-500/5 text-amber-400 border border-amber-500/10 px-2.5 py-1 rounded-lg text-[11px]">
                          -{(pay.advance * factor).toLocaleString()}đ
                        </span>
                      ) : (
                        <span className="text-white/20">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5.5 text-right font-mono bg-violet-950/10 border-x border-violet-500/5">
                      <span className="text-violet-300 font-extrabold text-[13px] bg-violet-500/10 border border-violet-500/15 py-1.5 px-3 rounded-xl shadow-inner">
                        {(pay.netSalary * factor).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-6 py-5.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                        pay.status === "Đã thanh toán"
                          ? "bg-emerald-500/8 text-emerald-300 border border-emerald-500/20"
                          : pay.status === "Chờ duyệt"
                            ? "bg-amber-500/8 text-amber-300 border border-amber-500/20 animate-pulse"
                            : "bg-white/5 text-white/40 border border-white/5"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          pay.status === "Đã thanh toán" ? "bg-emerald-400" : pay.status === "Chờ duyệt" ? "bg-amber-400" : "bg-white/30"
                        }`} />
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-5.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedPay(pay)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-violet-600 border border-transparent hover:border-violet-500/30 rounded-xl text-white/70 hover:text-white transition-all duration-150 flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
                          title="In phiếu lương"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Phiếu</span>
                        </button>

                        {pay.status !== "Đã thanh toán" && (
                          <>
                            <button
                              onClick={() => setAdvancingPay(pay)}
                              className="px-2.5 py-1.5 border border-amber-500/25 text-amber-500 hover:bg-amber-500/15 hover:text-amber-300 rounded-xl text-[11px] font-semibold cursor-pointer transition-all active:scale-95 duration-100"
                              title="Tạm ứng tiền"
                            >
                              T.Ứ
                            </button>
                            
                            <button
                              onClick={() => handleApprovePayroll(pay.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black cursor-pointer transition-all duration-150 shadow-md shadow-emerald-950/20 active:scale-95"
                              title="Thanh toán lương"
                            >
                              Chi
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredPayroll.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-white/30 font-mono">
                    <HelpCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    Không tìm thấy thông tin lương phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Modal Setup */}
      <AnimatePresence>
        {advancingPay && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161920] border border-white/10 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Giải ngân tạm ứng nhân sự</h3>
                <button
                  type="button"
                  onClick={() => setAdvancingPay(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAdvanceSubmit} className="p-6 space-y-4 text-xs font-medium">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl space-y-1">
                  <p className="font-bold">DANH NGHĨA LIÊN KẾT</p>
                  <p className="text-[11px] leading-relaxed">Khoản tiền ứng sẽ tự động ghi có vào phần KHẤU TRỪ / TẠM ỨNG của bảng lương nhân viên {advancingPay.employeeName} trong kỳ này.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/60">Nhân viên đề xuất</label>
                  <input
                    type="text"
                    disabled
                    value={advancingPay.employeeName}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 text-white/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/60">Số tiền ứng đề nghị (VND) *</label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAdvancingPay(null)}
                    className="px-4 py-2 border border-white/10 text-white/80 rounded-xl cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F59E0B] hover:bg-amber-500 text-white rounded-xl font-bold cursor-pointer shadow-lg"
                  >
                    Duyệt chi tạm ứng
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payslip Digital View Detail Modal */}
      <AnimatePresence>
        {selectedPay && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1E232D] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative"
            >
              {/* Receipts Top Design Elements */}
              <div className="h-2 w-full ai-gradient" />
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-650 flex items-center justify-center text-white">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm font-sans">PHIẾU LƯƠNG ĐIỆN TỬ</h3>
                      <p className="text-[9px] font-mono text-white/40">NEXUS v2.1 // PAYROLL RECEPT</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPay(null)}
                    className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Payslip info cards */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/5">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase font-bold">Thành viên</p>
                      <p className="font-bold text-white text-sm mt-0.5">{selectedPay.employeeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[10px] uppercase font-bold">Kỳ chi trả</p>
                      <p className="font-mono text-violet-400 font-bold mt-0.5">
                        {viewMode === "yearly" ? "Ước tính Năm (12 tháng)" : selectedPay.month}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-white/80">
                    <div className="flex justify-between">
                      <span className="text-white/55">Lương thỏa thuận (Hợp đồng):</span>
                      <span className="text-white">{(selectedPay.basicSalary * factor).toLocaleString()}đ</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/55">Số ngày công thực tế:</span>
                      <span className="text-white">{viewMode === "yearly" ? `${selectedPay.workDays * 12} ngày` : `${selectedPay.workDays} / 22 ngày`}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/55">Phụ cấp chức vụ & phúc lợi:</span>
                      <span className="text-emerald-400">+{(selectedPay.allowance * factor).toLocaleString()}đ</span>
                    </div>

                    {selectedPay.overtimeHours > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/55">Lương tăng ca (+{viewMode === "yearly" ? selectedPay.overtimeHours * 12 : selectedPay.overtimeHours} giờ):</span>
                        <span className="text-emerald-400">+{((selectedPay.overtimeHours * 200000) * factor).toLocaleString()}đ</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-white/5 pt-2">
                      <span className="text-white/55">Khấu trừ quy định BHXH:</span>
                      <span className="text-rose-400">-{(1000000 * factor).toLocaleString()}đ</span>
                    </div>

                    {selectedPay.deductions > 1000000 && (
                      <div className="flex justify-between">
                        <span className="text-white/55">Khấu trừ đi muộn/việc riêng:</span>
                        <span className="text-rose-400">-{((selectedPay.deductions - 1000000) * factor).toLocaleString()}đ</span>
                      </div>
                    )}

                    {selectedPay.advance > 0 && (
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/55">Bốc trừ tạm ứng giải ngân:</span>
                        <span className="text-rose-500">-{(selectedPay.advance * factor).toLocaleString()}đ</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-bold text-white border-t border-dashed border-white/10 pt-3">
                      <span className="font-sans font-black">
                        {viewMode === "yearly" ? "ƯỚC TÍNH THỰC LĨNH NĂM:" : "THỰC NHẬN CHUYỂN KHOẢN:"}
                      </span>
                      <span className="text-violet-400 font-mono">{(selectedPay.netSalary * factor).toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/50">
                    <CheckCircle className={`w-3.5 h-3.5 ${selectedPay.status === "Đã thanh toán" ? "text-emerald-400" : "text-amber-400"}`} />
                    <span className="uppercase tracking-widest font-bold">Quyết định trạng thái: {selectedPay.status}</span>
                  </div>
                  <p className="text-[9px] text-white/30 italic">Lương chuyển thẳng vào số tài khoản liên hợp đăng ký trong hồ sơ cá nhân</p>
                </div>

                <div className="flex justify-end gap-2 text-xs">
                  <button
                    disabled={isExporting}
                    onClick={() => {
                      setIsExporting(true);
                      setExportSuccess(false);
                      setTimeout(() => {
                        setIsExporting(false);
                        setExportSuccess(true);
                        // Clear success state after some time
                        setTimeout(() => setExportSuccess(false), 3000);
                      }, 1200);
                    }}
                    className={`px-4 py-2 border rounded-xl cursor-pointer font-bold transition-all ${
                      exportSuccess 
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" 
                        : "border-white/10 hover:bg-white/5 text-white/80"
                    }`}
                  >
                    {isExporting ? "Đang tạo PDF..." : exportSuccess ? "✓ Đã kết xuất PDF" : "Kết xuất PDF"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPay(null);
                      setExportSuccess(false);
                    }}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl cursor-pointer font-bold"
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
