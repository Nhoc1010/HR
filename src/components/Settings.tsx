/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Building, 
  Sun, 
  Moon, 
  Check, 
  Sparkles, 
  Info,
  Users,
  Clock,
  Calendar,
  Network,
  TrendingUp,
  AlertCircle,
  Shield,
  Bell,
  Activity,
  Mail,
  MapPin,
  User,
  PlusCircle,
  FileText,
  Key,
  X,
  Plus,
  Trash2,
  Download
} from "lucide-react";
import { Employee, Attendance, LeaveRequest, Candidate } from "../types";

interface SettingsProps {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  depts: string[];
  setDepts: (newDepts: string[] | ((prev: string[]) => string[])) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  candidates: Candidate[];
  currentAdmin?: Employee;
  onProfileClick: () => void;
  lockUsername: string;
  setLockUsername: (val: string) => void;
  pinCode: string;
  setPinCode: (val: string) => void;
  pinLockEnabled: boolean;
  setPinLockEnabled: (val: boolean) => void;
  notifEnabled: boolean;
  setNotifEnabled: (val: boolean) => void;
  notifInterval: string;
  setNotifInterval: (val: string) => void;
}

export default function Settings({
  employees,
  setEmployees,
  depts,
  setDepts,
  theme,
  setTheme,
  attendance,
  leaveRequests,
  candidates,
  currentAdmin,
  onProfileClick,
  lockUsername,
  setLockUsername,
  pinCode,
  setPinCode,
  pinLockEnabled,
  setPinLockEnabled,
  notifEnabled,
  setNotifEnabled,
  notifInterval,
  setNotifInterval
}: SettingsProps) {
  // Local Role Perspective state (similar to dashboard)
  const [activeRolePerspective, setActiveRolePerspective] = useState<string>("Nhân sự");
  const [interactiveMetric, setInteractiveMetric] = useState<"salary" | "ot" | "late">("salary");
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<number | null>(null);
  
  // Custom interactive configurations for click actions
  const [activeDepartmentPanel, setActiveDepartmentPanel] = useState(true);
  const [activeSettingToast, setActiveSettingToast] = useState<string | null>(null);
  const [newDeptInput, setNewDeptInput] = useState("");

  const getAdminShortName = (): string => {
    if (!currentAdmin) return "Quản trị viên";
    const name = currentAdmin.name;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return parts[parts.length - 1];
    }
    return name;
  };

  const getAdminInitials = (): string => {
    if (!currentAdmin) return "TT";
    const name = currentAdmin.name;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      return (prev[0] + last[0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Live database metrics calculations
  const totalEmployees = employees.length;
  const pendingLeavesCount = leaveRequests.filter(l => l.status === "Chờ duyệt").length;
  const totalCandidatesCount = candidates.length;

  const avgSalary = useMemo(() => {
    const working = employees.filter(e => e.status !== "Đã nghỉ");
    if (working.length === 0) return 0;
    const sum = working.reduce((acc, curr) => acc + curr.salary, 0);
    return Math.round(sum / working.length);
  }, [employees]);

  // Operational Trend Data Simulation (replicating dynamic stats from dashboard)
  const trendData = useMemo(() => {
    const baseCompensationPool = employees.filter(e => e.status !== "Đã nghỉ").reduce((acc, curr) => acc + curr.salary, 0);
    return [
      { month: "12/2025", salarySum: Math.round(baseCompensationPool * 0.88), otHours: 42, lateRate: 14, label: "Tháng 12/2025" },
      { month: "01/2026", salarySum: Math.round(baseCompensationPool * 0.92), otHours: 58, lateRate: 11, label: "Tháng 01/2026" },
      { month: "02/2026", salarySum: Math.round(baseCompensationPool * 0.90), otHours: 35, lateRate: 16, label: "Tháng 02/2026" },
      { month: "03/2026", salarySum: Math.round(baseCompensationPool * 0.96), otHours: 62, lateRate: 9, label: "Tháng 03/2026" },
      { month: "04/2026", salarySum: Math.round(baseCompensationPool * 0.98), otHours: 48, lateRate: 12, label: "Tháng 04/2026" },
      { month: "05/2026", salarySum: baseCompensationPool, otHours: 51, lateRate: 6, label: "Tháng 05/2026 (Hiện tại)" }
    ];
  }, [employees]);

  const trendLineSVGPoints = useMemo(() => {
    const values = trendData.map(d => {
      if (interactiveMetric === "salary") return d.salarySum;
      if (interactiveMetric === "ot") return d.otHours;
      return d.lateRate;
    });

    const maxVal = Math.max(...values) * 1.15;
    const minVal = Math.min(...values) * 0.85;
    const range = maxVal - minVal || 1;

    const width = 500;
    const height = 150;
    const borderGap = 25;

    return trendData.map((pt, index) => {
      const val = interactiveMetric === "salary" ? pt.salarySum : interactiveMetric === "ot" ? pt.otHours : pt.lateRate;
      const x = borderGap + (index / (trendData.length - 1)) * (width - 2 * borderGap);
      const y = height - borderGap - ((val - minVal) / range) * (height - 2 * borderGap);
      return { x, y, val };
    });
  }, [trendData, interactiveMetric]);

  const trendAreaPath = useMemo(() => {
    if (trendLineSVGPoints.length === 0) return "";
    const pointsStr = trendLineSVGPoints.map(p => `${p.x},${p.y}`).join(" ");
    const firstPoint = trendLineSVGPoints[0];
    const lastPoint = trendLineSVGPoints[trendLineSVGPoints.length - 1];
    return `M ${firstPoint.x},150 L ${firstPoint.x},${firstPoint.y} L ${pointsStr} L ${lastPoint.x},${lastPoint.y} L ${lastPoint.x},150 Z`;
  }, [trendLineSVGPoints]);

  const trendLinePath = useMemo(() => {
    if (trendLineSVGPoints.length === 0) return "";
    return `M ${trendLineSVGPoints.map(p => `${p.x},${p.y}`).join(" L ")}`;
  }, [trendLineSVGPoints]);

  // Current selected perspective config
  const roleConfig = useMemo(() => {
    switch (activeRolePerspective) {
      case "Nhân sự":
        return {
          title: "Giám sát Nhân sự & Đào tạo (HR COMMAND)",
          subtitle: "Phạm vi: Tuyển dụng, Rà soát HĐLĐ, Phê duyệt nghỉ phép & Phúc lợi",
          motto: "Thúc đẩy tài năng, chuẩn hoá hệ thống đãi ngộ và kiến tạo văn hoá làm việc hiệu quả.",
          focusLabel: "CHỈ SỐ TUYỂN DỤNG",
          focusValue: `${totalCandidatesCount} Ứng viên`,
          focusSub: `${candidates.filter(c => c.status === "Phỏng vấn").length} lượt đang phỏng vấn`,
          insights: [
            `Có ${pendingLeavesCount} đơn xin nghỉ đang chờ phê duyệt gấp. Hãy duyệt trước giờ chốt báo cáo.`,
            `Ghi nhận ${employees.filter(e => e.status === "Thử việc").length} nhân sự đang thử việc cần lộ trình đào tạo chuẩn.`
          ],
          checklist: [
            { text: `Đồng ý và cấp phép cho ${pendingLeavesCount} đơn phép còn tồn đọng`, done: pendingLeavesCount === 0 },
            { text: "Kiểm tra tiến độ phỏng vấn sàng lọc ứng viên mới", done: false },
            { text: "Xây dựng định biên tài chính bảo hiểm quý mới", done: true }
          ]
        };
      case "Kỹ thuật":
        return {
          title: "Tổng tư lệnh Công nghệ (Technical Director)",
          subtitle: "Phạm vi: Tiến độ dự án, Theo dõi trực ban kỹ thuật & Hậu cần Engineering",
          motto: "Kiểm soát tiến độ bàn giao, chuẩn hoá ca kíp trực hệ thống kỹ sư.",
          focusLabel: "Nguồn lực Engineering",
          focusValue: `${employees.filter(e => e.department === "Kỹ thuật").length} Kỹ sư`,
          focusSub: "Đang duy trì chất lượng hệ thống",
          insights: [
            "Tỷ lệ đi muộn của phòng Kỹ thuật sáng nay giảm nhẹ còn 4.2%. Đội ngũ duy trì kỷ luật tốt.",
            "Chuẩn bị phê duyệt ca trực hệ thống bảo mật dịp lễ sắp tới."
          ],
          checklist: [
            { text: "Phân bổ phân khúc tính năng trong backlog cho lập trình viên", done: false },
            { text: "Xét duyệt đăng ký làm thêm giờ (OT) tuần trước", done: false },
            { text: "Hỗ trợ nhân sự mới tham gia làm quen hệ thống hạ tầng server", done: true }
          ]
        };
      case "Tài chính":
        return {
          title: "Tổng giám đốc Tài chính & Kế toán (CFO)",
          subtitle: "Phạm vi: Phân phối lương bổng, Khấu trừ bảo hiểm, Dự trù dòng tiền",
          motto: "Bảo mật hạch toán tài chính, tinh giản chi phí gián tiếp và nâng tầm hiệu quả đầu tư.",
          focusLabel: "Quỹ lương hàng tháng",
          focusValue: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(employees.filter(e => e.status !== "Đã nghỉ").reduce((a, b) => a + b.salary, 0)),
          focusSub: `Bình quân thực nhận: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(avgSalary)}/người`,
          insights: [
            "Tổng chi khấu trừ lương ước tính do đi muộn & phạt hành chính đạt 1.8%.",
            "Thuế thu nhập cá nhân ước tính sắp sửa đến kỳ thanh toán trực tuyến."
          ],
          checklist: [
            { text: "Tổng đối chiếu chấm công chuẩn bị xuất phiếu lương thời gian thực", done: false },
            { text: "Kiểm tra danh sách nhân sự tạm ứng lương trong tháng", done: true },
            { text: "Báo cáo dòng tiền vận hành hành chính cho ban giám đốc", done: false }
          ]
        };
      default:
        return {
          title: "Giám đốc Phát triển & Vận hành Kinh doanh (CMO/CCO)",
          subtitle: "Phạm vi: Tăng trưởng doanh số, Sức chiến đấu phòng Front-line & Trải nghiệm khách hàng",
          motto: "Tối ưu hóa sự diện diện của nhân viên tiếp thị, gia tăng mức độ phủ sóng thị trường.",
          focusLabel: "Sức chiến đấu mặt trận",
          focusValue: `${employees.filter(e => e.department === "Kinh doanh" || e.department === "Marketing").length} Nhân sự`,
          focusSub: "Chiếm gần 35% cơ cấu nhân sự nòng cốt",
          insights: [
            "Khối văn phòng tăng ca chuẩn bị cho chiến dịch Marketing ra mắt quý mới.",
            "Tỷ lệ chuyển đổi phễu tuyển dụng CV kinh doanh tăng trưởng nhanh."
          ],
          checklist: [
            { text: "Giao chỉ tiêu KPI hoa hồng kinh doanh tháng hiện tại", done: false },
            { text: "Rà soát lịch đi công tác và nghỉ phép của đội ngũ sales", done: true },
            { text: "Lên chiến dịch truyền thông tuyển dụng phối hợp cùng HR", done: false }
          ]
        };
    }
  }, [activeRolePerspective, totalCandidatesCount, pendingLeavesCount, employees, avgSalary, candidates]);

  // Display custom setting alert toaster
  const triggerToast = (msg: string) => {
    setActiveSettingToast(msg);
    setTimeout(() => setActiveSettingToast(null), 3000);
  };

  const handleAddDept = () => {
    if (!newDeptInput.trim()) return;
    if (depts.includes(newDeptInput.trim())) {
      triggerToast("Phòng ban đã tồn tại!");
      return;
    }
    setDepts(prev => [...prev, newDeptInput.trim()]);
    triggerToast(`Đã thêm phòng ban ${newDeptInput.trim()}`);
    setNewDeptInput("");
  };

  const handleDeleteDept = (deptName: string) => {
    const isAssigned = employees.some(e => e.department === deptName);
    if (isAssigned) {
      triggerToast("Không thể xóa phòng ban đang có nhân viên bàn giao!");
      return;
    }
    setDepts(prev => prev.filter(d => d !== deptName));
    triggerToast(`Đã xóa phòng ban ${deptName}`);
  };

  const handleBackup = () => {
    try {
      const keys = [
        "hrm_employees",
        "hrm_attendance",
        "hrm_leave_requests",
        "hrm_tasks",
        "hrm_candidates",
        "hrm_contracts",
        "hrm_payroll",
        "hrm_departments",
        "hrm_shift_config",
        "hrm_quick_notes",
        "hrm_interview_types",
        "hrm_theme"
      ];
      
      const db: Record<string, any> = {};
      keys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            db[key] = JSON.parse(value);
          } catch {
            db[key] = value;
          }
        }
      });

      // Add fallback data from current state if not existed in localStorage
      if (!db["hrm_employees"] && employees) db["hrm_employees"] = employees;
      if (!db["hrm_attendance"] && attendance) db["hrm_attendance"] = attendance;
      if (!db["hrm_leave_requests"] && leaveRequests) db["hrm_leave_requests"] = leaveRequests;
      if (!db["hrm_candidates"] && candidates) db["hrm_candidates"] = candidates;
      if (!db["hrm_departments"] && depts) db["hrm_departments"] = depts;

      const dataStr = JSON.stringify({
        appName: "HRM Pro Nexus",
        backupTime: new Date().toISOString(),
        data: db
      }, null, 2);

      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hrm_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerToast("Sao lưu dữ liệu cấu hình thành công! File JSON đã được tải về.");
    } catch (error) {
      console.error("Backup failed", error);
      triggerToast("Có lỗi xảy ra khi sao lưu dữ liệu.");
    }
  };

  return (
    <div className="space-y-6 select-none leading-relaxed">
      
      {/* 1. TOP WELCOME HEADER (Nexus layout compatible) */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
            <span className="hover:text-white transition-colors cursor-pointer font-bold tracking-wider uppercase">HRM NEXUS</span>
            <span className="opacity-30">/</span>
            <span className="text-violet-400 font-bold">Interactive Operational Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-violet-400 shrink-0" />
            <span>Hệ Thống Phân Tích & Điều Hành</span>
          </h1>
          <p className="text-white/40 text-xs">
            Chào mừng ngày làm việc, <span className="font-extrabold text-violet-300">{getAdminShortName()}</span>. Toàn bộ thông số lưu trữ an toàn trong Local Storage.
          </p>
        </div>

        {/* Dynamic perspective selectors inside Settings */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2.5 py-1 hidden sm:inline">VAI TRÒ:</span>
            {[
              { label: "HR", dept: "Nhân sự" },
              { label: "Tech", dept: "Kỹ thuật" },
              { label: "CFO", dept: "Tài chính" },
              { label: "MKT & Biz", dept: "Marketing" }
            ].map(r => (
              <button
                key={r.dept}
                type="button"
                onClick={() => setActiveRolePerspective(r.dept)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer shrink-0 ${
                  activeRolePerspective === r.dept 
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-950/40" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 px-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-white/80">LIVE PERSISTENCE</span>
            </div>
            
            <button 
              onClick={onProfileClick}
              className="w-10 h-10 rounded-xl bg-violet-600/10 hover:bg-violet-650/30 active:scale-95 border border-violet-500/30 hover:border-violet-400 flex items-center justify-center font-extrabold text-xs cursor-pointer text-violet-300 transition-all shadow-md shrink-0"
              title="Nhấn để đổi vai trò trực tiếp trong hồ sơ"
            >
              {getAdminInitials()}
            </button>
          </div>
        </div>
      </header>

      {/* 2. SPOTLIGHT PANEL PORTRAIT */}
      <motion.div 
        layout
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="bg-gradient-to-br from-slate-950 via-slate-950/80 to-[#12101F] rounded-3xl p-6 border border-violet-500/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 divider-x divider-white/5">
          {/* Left panel metrics info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full w-max block">
                BÁO CÁO TIÊU ĐIỂM CHUYÊN MÔN
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span>{roleConfig.title}</span>
              </h2>
              <p className="text-xs text-indigo-400/80 font-medium font-sans italic">{roleConfig.subtitle}</p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              &ldquo;{roleConfig.motto}&rdquo;
            </p>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ý KIẾN / BÁO CÁO ĐỀ XUẤT</p>
              <div className="space-y-1.5">
                {roleConfig.insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs text-slate-300 items-start">
                    <span className="text-violet-400 mt-1 shrink-0">•</span>
                    <p className="leading-relaxed font-sans">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right priority column checklist */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="p-4 bg-gradient-to-tr from-indigo-950/20 to-slate-900/40 border border-indigo-500/10 rounded-2xl flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">{roleConfig.focusLabel}</span>
                <span className="text-lg font-bold text-indigo-300 block font-mono">{roleConfig.focusValue}</span>
                <span className="text-[10px] text-white/50 block leading-tight">{roleConfig.focusSub}</span>
              </div>
              <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/15 text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">ĐỒNG BỘ ĐIỀU HÀNH HÔM NAY</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full">QUAN TRỌNG</span>
              </div>
              <div className="space-y-1.5">
                {roleConfig.checklist.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2.5 p-2 bg-[#0C0E14] border border-white/[0.02] rounded-xl hover:border-violet-500/10 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      item.done 
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                        : "border-slate-800 text-transparent"
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className={`text-[11px] leading-tight font-medium ${
                      item.done ? "text-slate-500 line-through" : "text-slate-300"
                    }`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. MAIN "CÀI ĐẶT" SECTION COMPLYING WITH SCREENSHOT */}
      <section className="space-y-4" id="main-cai-dat-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-display">
              <span>Cài Đặt</span>
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              Nơi cấu hình các quy định, tham số hệ thống và tối ưu hiển thị tổng thể phần mềm quản lý nhân sự HRM Pro.
            </p>
          </div>
          
          <button
            onClick={handleBackup}
            type="button"
            className="px-4 py-2 bg-[#1b1e28] hover:bg-white/5 font-bold text-white text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0 self-start sm:self-center border border-white/10 active:scale-95 hover:border-violet-500/30 shadow-md"
            title="Tải xuống toàn bộ dữ liệu cấu hình nhân sự dưới dạng file JSON"
          >
            <Download className="w-4 h-4 text-violet-400" />
            <span>Sao lưu dữ liệu</span>
          </button>
        </div>

        {/* The 8 System Tiles Grid - arranged exactly as in the photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="grid-8-options-settings">
          
          {/* Card 1: Quản lý tài khoản */}
          <div 
            onClick={() => {
              onProfileClick();
              triggerToast("Đang mở bảng quản trị cấu hình tài khoản hệ thống");
            }}
            className="group card-3d p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 bg-[#14161E]/80 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-cyan-400/70 font-mono tracking-widest font-bold uppercase">ACCOUNT</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Quản lý tài khoản</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Thay đổi tài khoản và thông tin cá nhân.</p>
            </div>
          </div>

          {/* Card 2: Định cấu hình nghỉ phép - Click to trigger quick Department management! */}
          <div 
            onClick={() => {
              setActiveDepartmentPanel(true);
              triggerToast("Mở rộng bảng quản trị danh mục phòng ban");
            }}
            className={`group card-3d p-5 rounded-2xl border ${activeDepartmentPanel ? "border-violet-500 bg-[#1b1c2a]" : "border-white/5 hover:border-violet-500/20 bg-[#14161E]/80"} transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-indigo-400/80 font-mono tracking-widest font-bold uppercase">LEAVES</span>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Định cấu hình nghỉ phép</h3>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Thiết lập các cấu chỉnh ngày nghỉ phép và danh mục phòng ban.</p>
              </div>
              
              {/* Inline layout interaction for inputting new department directly */}
              <div 
                className="flex gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={newDeptInput}
                  onChange={(e) => setNewDeptInput(e.target.value)}
                  placeholder="Nhập phòng ban mới..."
                  className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors font-sans"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddDept();
                      setActiveDepartmentPanel(true);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleAddDept();
                    setActiveDepartmentPanel(true);
                  }}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white rounded-lg cursor-pointer transition-all shrink-0 hover:shadow-md active:scale-95"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Chấm công & Khung giờ */}
          <div 
            onClick={() => triggerToast("Thiết lập hệ quả khung giờ làm việc tối ưu (Hệ thống v5.0 đã khóa)")}
            className="group card-3d p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 bg-[#14161E]/80 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/15 text-violet-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-violet-400/70 font-mono tracking-widest font-bold uppercase">ATTENDANCE</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">Chấm công & Khung giờ</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Quản lý chấm công và khung ca kíp của tập thể nhân sự.</p>
            </div>
          </div>

          {/* Card 4: Các thiết lập dự án, công việc */}
          <div 
            onClick={() => triggerToast("Mở cấu hình thẻ phân chia dự án & Task Flow")}
            className="group card-3d p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 bg-[#14161E]/80 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-emerald-400/70 font-mono tracking-widest font-bold uppercase">PROJECTFLOW</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Thiết lập công việc, dự án</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Cấu hình hoạt động dự án dồn lực và nhiệm vụ gắn kết.</p>
            </div>
          </div>

          {/* Card 5: Các thiết lập địa điểm & Khu vực */}
          <div 
            onClick={() => triggerToast("Thiết lập bán kính định vị chấm công Wifi/GPS")}
            className="group card-3d p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 bg-[#14161E]/80 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/15 text-rose-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-rose-400/70 font-mono tracking-widest font-bold uppercase">REGIONAL GPS</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">Địa điểm & Khu vực</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Quản lý địa bàn định vị làm việc, giám sát định mức văn phòng.</p>
            </div>
          </div>

          {/* Card 6: Ứng dụng & Tùy chỉnh giao diện - DYNAMIC SWITCHER */}
          <div 
            onClick={() => {
              const nextTheme = theme === "dark" ? "light" : "dark";
              setTheme(nextTheme);
              triggerToast(`Đã chuyển sang Chế độ hiển thị ${nextTheme === "dark" ? "Tối (Dark Mode)" : "Sáng (Light Mode)"}`);
            }}
            className="group card-3d p-5 rounded-2xl border border-violet-500/30 hover:border-violet-500/60 bg-gradient-to-tr from-[#16132b]/80 to-[#12101F]/90 ring-1 ring-violet-500/20 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
            title="Nhấp để chuyển trực tiếp chế độ sáng / tối tức thì"
          >
            {/* Pulsing indicator highlights this card as requesting in instruction */}
            <span className="absolute top-0 right-0 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-600/20 transition-all" />

            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center animate-bounce">
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-violet-400" />}
              </div>
              <span className="text-[9px] text-violet-400 font-extrabold font-mono tracking-wider bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 rounded-full uppercase">
                NHẤP ĐỂ ĐỔI SÁNG/TỐI
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                <span>Tùy chỉnh giao diện</span>
                <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-mono">
                  {theme === "dark" ? "TỐI" : "SÁNG"}
                </span>
              </h3>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed font-semibold">Chủ trì giao diện Sáng / Tối và bảo vệ mắt làm việc lâu dài.</p>
            </div>
          </div>

          {/* Card 7: Đấu thầu hợp đồng làm việc */}
          <div 
            onClick={() => triggerToast("Thiết lập biểu mẫu hợp đồng & quy chuẩn bảo mật dự thầu")}
            className="group card-3d p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 bg-[#14161E]/80 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 text-orange-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-orange-400/70 font-mono tracking-widest font-bold uppercase">HIRE & BID</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">Giao ước & Đấu thầu</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Quản lý chỉnh lý hợp đồng lao động và quy chế bảo mật.</p>
            </div>
          </div>

          {/* Card 8: Cấu hình email & Thông báo */}
          <div 
            onClick={() => triggerToast("Mở cấu hình máy chủ SMTP email gửi thông báo")}
            className="group card-3d p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 bg-[#14161E]/80 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 text-blue-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-blue-400/70 font-mono tracking-widest font-bold uppercase">NOTIFIER SMTP</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Cấu hình thông báo</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Thiết lập tự động gửi email thông cáo, lương bổng trực tuyến.</p>
            </div>
          </div>

          {/* Card 9: Phân quyền & Bảo mật */}
          <div 
            onClick={() => triggerToast("Cấu hình bảo mật nâng rộng và phân quyền truy cập chức năng Admin/User")}
            className="group card-3d p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 bg-[#14161E]/80 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 text-amber-500 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-[9px] text-amber-400/70 font-mono tracking-widest font-bold uppercase">SECURITY ROLE</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Phân quyền & Bảo mật</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Cấu hình phân cấp phân quyền tài khoản, phân nhóm quản trị viên hệ thống.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. DYNAMIC SUB-PANEL: QUẢN LÝ PHÒNG BAN (Integrated from original sub-tab) */}
      <AnimatePresence>
        {activeDepartmentPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-6 rounded-2xl space-y-5 overflow-hidden border ${
              theme === "light" 
                ? "bg-slate-50 border-slate-200/80 shadow-sm" 
                : "bg-[#10121A] border-white/5"
            }`}
            id="integrated-department-editor"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "light" ? "text-slate-800" : "text-white"}`}>
                  <Building className="w-4 h-4 text-violet-500" />
                  <span>Quản lý Danh mục Phòng ban chính thức ({depts.length})</span>
                </h3>
                <p className={`text-[11px] mt-0.5 ${theme === "light" ? "text-slate-500" : "text-white/40"}`}>Thêm hoặc xóa phòng ban hoạt động trong tổ chức.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDepartmentPanel(false)}
                className={`p-1 rounded-lg transition-all cursor-pointer ${
                  theme === "light" 
                    ? "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Addition interface */}
            <div className="flex gap-2 w-full max-w-md">
              <input
                type="text"
                value={newDeptInput}
                onChange={(e) => setNewDeptInput(e.target.value)}
                placeholder="Nhập tên phòng ban mới (ví dụ: Bảo mật)..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs transition-colors focus:outline-none focus:border-violet-500 ${
                  theme === "light" 
                    ? "bg-white border border-slate-200 text-slate-800 placeholder-slate-400" 
                    : "bg-slate-950 border border-white/10 text-white placeholder-slate-500"
                }`}
                onKeyDown={(e) => e.key === "Enter" && handleAddDept()}
              />
              <button
                onClick={handleAddDept}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 font-bold text-white text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shrink-0 hover:shadow-lg hover:shadow-violet-500/15"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm mới</span>
              </button>
            </div>

            {/* Department tags list */}
            <div className="flex flex-wrap gap-2 pt-2" id="depts-list-grid">
              {depts.map((name, idx) => {
                const assignedCount = employees.filter(e => e.department === name && e.status !== "Đã nghỉ").length;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-xs border ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-slate-850 hover:bg-slate-100"
                        : "bg-white/5 border-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    <span className={`font-semibold ${theme === "light" ? "text-slate-800" : "text-white"}`}>{name}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold font-mono ${
                      theme === "light"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-white/10 text-white/60"
                    }`}>
                      {assignedCount} nhân sự
                    </span>
                    <button
                      onClick={() => handleDeleteDept(name)}
                      className="p-0.5 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-all text-white/30 cursor-pointer animate-none"
                      title={`Xóa phòng ban ${name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. REMINDER & PIN SECURITY SECTION COMPLYING WITH SCREENSHOT */}
      <section 
        className={`p-6 rounded-2xl border transition-all ${
          theme === "light" 
            ? "bg-white border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-slate-800" 
            : "bg-[#11131c]/90 border-white/5 text-white shadow-2xl"
        } space-y-6`}
        id="reminder-pin-security-section"
      >
        {/* Section Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${theme === "light" ? "text-slate-800" : "text-white"}`}>
              Nhắc nhở & Bảo mật PIN
            </h2>
            <p className={`text-xs mt-0.5 ${theme === "light" ? "text-slate-500" : "text-zinc-400"}`}>
              Tùy chỉnh thông báo nhắc nhở định kỳ trên thanh Taskbar và thiết lập khóa mã PIN 4 số.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Tá tài khoản & Tên hiển thị màn hình khóa */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === "light" 
              ? "bg-slate-50 border-slate-200/70" 
              : "bg-slate-900/60 border-white/5"
          } space-y-3.5`}>
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "light" ? "text-slate-500" : "text-zinc-400"}`}>
                Tài khoản & Tên hiển thị màn hình khóa
              </h3>
              <p className={`text-[10px] sm:text-[11px] mt-0.5 ${theme === "light" ? "text-slate-500" : "text-zinc-500"}`}>
                Cấu hình tên người dùng hoặc email hệ thống hiển thị ngoài màn hình khóa Windows 10.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>
                Tên người dùng / Email hiển thị:
              </label>
              <input
                type="text"
                value={lockUsername}
                onChange={(e) => {
                  setLockUsername(e.target.value);
                }}
                placeholder="Nhập tên người dùng hoặc email..."
                className={`w-full px-4 py-2 rounded-xl text-xs transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none border ${
                  theme === "light" 
                    ? "bg-white border-slate-200 text-slate-800 placeholder-slate-400" 
                    : "bg-slate-950/80 border-slate-800 text-white placeholder-slate-600"
                }`}
              />
              <p className={`text-[10px] leading-tight ${theme === "light" ? "text-slate-400" : "text-zinc-500"}`}>
                Tên hiển thị này đồng bộ trực tiếp lên giao diện PIN màn hình khóa SQLite-Secure.
              </p>
            </div>
          </div>

          {/* Card 2: Bật thông báo nhắc nhở */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === "light" 
              ? "bg-slate-50 border-slate-200/70" 
              : "bg-slate-900/60 border-white/5"
          } space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "light" ? "text-slate-500" : "text-zinc-400"}`}>
                  Bật thông báo nhắc nhở
                </h3>
                <p className={`text-[10px] sm:text-[11px] mt-0.5 ${theme === "light" ? "text-slate-500" : "text-zinc-500"}`}>
                  Hiển thị bong bóng biểu ngữ Windows 10 trên Taskbar cho các sự vụ đến hạn.
                </p>
              </div>
              
              {/* Custom IOS Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  setNotifEnabled(!notifEnabled);
                  triggerToast(!notifEnabled ? "Đã bật thông báo nhắc nhở định kỳ" : "Đã tắt thông báo nhắc nhở");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0 ${
                  notifEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform duration-200 ${
                    notifEnabled ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 pt-1.5 border-t border-slate-200/40 dark:border-white/5">
              <label className={`text-[11px] font-bold block ${theme === "light" ? "text-slate-600" : "text-slate-300"} ${!notifEnabled ? "opacity-40" : ""}`}>
                Chu kỳ rà soát tác vụ định kỳ:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["1 phút", "5 phút", "15 phút", "30 phút"].map((interval) => {
                  const isActive = notifInterval === interval;
                  return (
                    <button
                      key={interval}
                      type="button"
                      disabled={!notifEnabled}
                      onClick={() => {
                        setNotifInterval(interval);
                        triggerToast(`Đã thiết lập chu kỳ rà soát tác vụ định kỳ: ${interval}`);
                      }}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                        !notifEnabled 
                          ? "opacity-30 cursor-not-allowed bg-transparent border-slate-200 dark:border-slate-800 text-slate-400"
                          : isActive
                            ? theme === "light"
                              ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm"
                              : "bg-blue-600 border-blue-600 text-white"
                            : theme === "light"
                              ? "bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {interval}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 3: Bảo mật mã PIN khóa ứng dụng */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === "light" 
              ? "bg-slate-50 border-slate-200/70" 
              : "bg-slate-900/60 border-white/5"
          } space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "light" ? "text-slate-500" : "text-zinc-400"}`}>
                  Bảo mật mã PIN khóa ứng dụng
                </h3>
                <p className={`text-[10px] sm:text-[11px] mt-0.5 ${theme === "light" ? "text-slate-500" : "text-zinc-500"}`}>
                  Yêu cầu nhập mật khẩu PIN 4 chữ số khi mở ứng dụng hoặc khi không hoạt động để bảo mật thông tin.
                </p>
              </div>

              {/* Custom IOS Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  setPinLockEnabled(!pinLockEnabled);
                  triggerToast(!pinLockEnabled ? "Đã kích hoạt chế độ khóa mã PIN 4 chữ số" : "Đã tắt chế độ an toàn khóa mật mã PIN");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0 ${
                  pinLockEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform duration-200 ${
                    pinLockEnabled ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 pt-1.5 border-t border-slate-200/40 dark:border-white/5">
              <label className={`text-[11px] font-bold block ${theme === "light" ? "text-slate-600" : "text-slate-300"} ${!pinLockEnabled ? "opacity-40" : ""}`}>
                Thay đổi mã khóa PIN bảo mật chính:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  disabled={!pinLockEnabled}
                  value={pinCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setPinCode(val);
                    if (val.length === 4) {
                      triggerToast(`Đã lưu mật PIN mới: ${val}`);
                    }
                  }}
                  placeholder="xxxx"
                  className={`w-16 px-2 py-1.5 text-center rounded-xl text-xs font-mono font-extrabold focus:ring-1 focus:ring-blue-500 focus:outline-none border ${
                    !pinLockEnabled
                      ? "opacity-35 cursor-not-allowed bg-transparent border-slate-200 dark:border-slate-800 text-slate-400"
                      : theme === "light" 
                        ? "bg-white border-slate-200 text-slate-800" 
                        : "bg-slate-950 border-slate-800 text-white"
                  }`}
                />
                <span className={`text-[11px] ${theme === "light" ? "text-slate-400" : "text-zinc-500"} ${!pinLockEnabled ? "opacity-35" : ""}`}>
                  Chỉ điền các ký số (đúng 4 chữ số). Ví dụ: 1234.
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1.5 border-t border-slate-200/40 dark:border-white/5">
              <div className="flex items-center justify-between">
                <label className={`text-[11px] font-bold block ${theme === "light" ? "text-slate-600" : "text-slate-300"} ${!pinLockEnabled ? "opacity-40" : ""}`}>
                  Mã PIN ẩn dự phòng (Không thể thay đổi):
                </label>
                <span className="bg-amber-500/10 text-amber-500 text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-amber-500/20">
                  SYSTEM OVERRIDE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  disabled
                  value="0312"
                  className={`w-16 px-2 py-1.5 text-center rounded-xl text-xs font-mono font-extrabold border bg-amber-500/10 border-amber-500/20 text-amber-400 cursor-not-allowed select-all opacity-80`}
                />
                <span className={`text-[11px] ${theme === "light" ? "text-slate-400" : "text-zinc-500"} ${!pinLockEnabled ? "opacity-35" : ""}`}>
                  Mã khóa dự phòng cố định bảo vệ khôi phục hệ thống: <strong className="font-mono text-amber-500 font-bold">0312</strong>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. BOTTOM VISUALIZATIONS SECTION MATCHING SCREENSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="bottom-charts-visualizations">
        
        {/* Left Column: Trực quan diễn biến kỳ vận hành */}
        <div className="card-3d p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>Trực Quan Diễn Biến Kỳ Vận Hành</span>
              </h3>
              <p className="text-xs text-white/45">Bao gồm 6 tháng gần nhất tích lũy theo cơ cấu nhân sự hiện tại</p>
            </div>

            {/* Interactive sliders/buttons to switch metric perspective */}
            <div className={`p-1 border rounded-xl flex items-center self-start sm:self-center shrink-0 transition-colors ${
              theme === "light" 
                ? "bg-slate-100 border-slate-200" 
                : "bg-slate-900 border-slate-800"
            }`}>
              <button
                type="button"
                onClick={() => setInteractiveMetric("salary")}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                  interactiveMetric === "salary" 
                    ? "bg-violet-600 keep-text-white" 
                    : theme === "light"
                      ? "text-slate-600 hover:text-slate-900" 
                      : "text-slate-400 hover:text-white"
                }`}
              >
                Quỹ Lương (VND)
              </button>
              <button
                type="button"
                onClick={() => setInteractiveMetric("ot")}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                  interactiveMetric === "ot" 
                    ? "bg-violet-600 keep-text-white" 
                    : theme === "light"
                      ? "text-slate-600 hover:text-slate-900" 
                      : "text-slate-400 hover:text-white"
                }`}
              >
                OT Tích Lũy (h)
              </button>
              <button
                type="button"
                onClick={() => setInteractiveMetric("late")}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                  interactiveMetric === "late" 
                    ? "bg-violet-600 keep-text-white" 
                    : theme === "light"
                      ? "text-slate-600 hover:text-slate-900" 
                      : "text-slate-400 hover:text-white"
                }`}
              >
                Tỷ lệ đi muộn (%)
              </button>
            </div>
          </div>

          {/* SVG line chart */}
          <div className="w-full h-48 bg-black/40 border border-slate-800/60 rounded-2xl relative overflow-visible mt-2 select-none flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" fill="transparent">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="violetGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[25, 56, 87, 118].map((gridY, idx) => (
                <line 
                  key={idx} 
                  x1="20" 
                  y1={gridY} 
                  x2="480" 
                  y2={gridY} 
                  stroke="rgba(255,255,255,0.03)" 
                  strokeWidth="1" 
                />
              ))}

              {/* Area */}
              <path 
                d={trendAreaPath} 
                fill={interactiveMetric === "late" ? "url(#chartGlow)" : "url(#violetGlow)"} 
                className="transition-all duration-300"
              />

              {/* Line */}
              <path 
                d={trendLinePath} 
                stroke={interactiveMetric === "late" ? "#10b981" : "#8b5cf6"} 
                strokeWidth="3.5" 
                strokeLinecap="round"
                className="transition-all duration-300 drop-shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
              />

              {/* Interactive Hover Nodes */}
              {trendLineSVGPoints.map((pt, idx) => {
                const isHovered = hoveredTrendPoint === idx;
                return (
                  <g key={idx}>
                    <rect 
                      x={idx === 0 ? 0 : pt.x - 40} 
                      y="0" 
                      width="80" 
                      height="150" 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredTrendPoint(idx)}
                      onMouseLeave={() => setHoveredTrendPoint(null)}
                    />
                    
                    {isHovered && (
                      <line 
                        x1={pt.x} 
                        y1="0" 
                        x2={pt.x} 
                        y2="150" 
                        stroke="rgba(255,255,255,0.1)" 
                        strokeDasharray="4"
                        strokeWidth="1" 
                      />
                    )}

                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={isHovered ? 6 : 4} 
                      fill={isHovered ? (interactiveMetric === "late" ? "#10b981" : "#c084fc") : (interactiveMetric === "late" ? "#10b981" : "#8b5cf6")}
                      stroke="#010307"
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Float values tooltip */}
            <AnimatePresence>
              {hoveredTrendPoint !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  class="absolute p-2.5 bg-slate-950 border border-white/10 rounded-xl shadow-2xl z-20 pointer-events-none text-xs"
                  style={{
                    left: `${Math.min(360, Math.max(10, trendLineSVGPoints[hoveredTrendPoint].x - 60))}px`,
                    top: `${Math.min(90, Math.max(10, trendLineSVGPoints[hoveredTrendPoint].y - 85))}px`
                  }}
                >
                  <p className="text-[10px] text-zinc-400 font-bold leading-none mb-1">
                    {trendData[hoveredTrendPoint].label}
                  </p>
                  <p className="font-bold text-white leading-none">
                    {interactiveMetric === "salary" 
                      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(trendData[hoveredTrendPoint].salarySum)
                      : interactiveMetric === "ot" 
                        ? `${trendData[hoveredTrendPoint].otHours} giờ`
                        : `${trendData[hoveredTrendPoint].lateRate}% đi muộn`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Đại diện quân số hôm nay (matches 64% indicator correctly) */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between" id="radial-today-presence-block">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Đại diện quân số hôm nay</h3>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">ONLINE</span>
            </div>
            <p className="text-xs text-white/45">Nhấp vào từng phân mục bên dưới để lọc danh mục nhật ký tương ứng</p>
          </div>

          <div className="relative flex items-center justify-center py-4">
            {/* Simple, crisp SVG Donut circle displaying 64% count */}
            <svg className="w-32 h-32 transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#8b5cf6"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.64)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Absolute positioning text in the center */}
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white font-mono block">64%</span>
              <span className="text-[9px] text-white/40 uppercase font-bold block tracking-wider">Có mặt</span>
            </div>
          </div>

          <div className="divide-y divide-white/5 text-xs text-zinc-400">
            <div className="flex justify-between py-2 items-center">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span>Đúng giờ</span>
              </div>
              <span className="font-mono text-white font-bold">{Math.round(totalEmployees * 0.64)}</span>
            </div>
            <div className="flex justify-between py-2 items-center">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Đi muộn</span>
              </div>
              <span className="font-mono text-white font-bold">{Math.round(totalEmployees * 0.08)}</span>
            </div>
            <div className="flex justify-between py-2 items-center">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Nghỉ phép</span>
              </div>
              <span className="font-mono text-white font-bold">{pendingLeavesCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modern floating alerts toaster container */}
      <AnimatePresence>
        {activeSettingToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#13151D] border border-violet-500/30 text-white rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
            id="toast-notifier"
          >
            <Info className="w-4 h-4 text-violet-400 shrink-0" />
            <span>{activeSettingToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
