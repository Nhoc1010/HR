/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Clock, 
  Calendar, 
  Network, 
  TrendingUp, 
  ArrowRight,
  TrendingDown,
  AlertCircle,
  Shield,
  Award,
  DollarSign,
  Wallet,
  FileText,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Check,
  Building,
  UserCheck,
  Sparkles,
  Search,
  Filter,
  X,
  Plus,
  Trash2,
  ClipboardList
} from "lucide-react";
import { Employee, Attendance, LeaveRequest, Candidate, HRMTask } from "../types";

interface DashboardProps {
  employees: Employee[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  candidates: Candidate[];
  setActiveTab: (tab: string) => void;
  currentAdmin?: Employee;
  onProfileClick?: () => void;
}

interface TrendPoint {
  month: string;
  salarySum: number;
  otHours: number;
  lateRate: number;
  label: string;
}

export default function Dashboard({ 
  employees, 
  attendance, 
  leaveRequests, 
  candidates, 
  setActiveTab,
  currentAdmin,
  onProfileClick
}: DashboardProps) {

  // Current real-time UTC or set Date context
  const todayDateStr = "2026-05-20";

  // Active Role filter toggle - allows user to see the dashboard from different departmental perspectives!
  // Defaults to current logged-in admin's department (or "Nhân sự" if none/generic).
  const initialRoleDept = useMemo(() => {
    if (!currentAdmin) return "Nhân sự";
    const dept = currentAdmin.department;
    if (["Nhân sự", "Kỹ thuật", "Tài chính", "Marketing", "Kinh doanh"].includes(dept)) {
      return dept;
    }
    return "Nhân sự";
  }, [currentAdmin]);

  const [activeRolePerspective, setActiveRolePerspective] = useState<string>(initialRoleDept);

  // Synchronize when administrative user switches
  React.useEffect(() => {
    setActiveRolePerspective(initialRoleDept);
  }, [initialRoleDept]);

  // General dashboard metric filters & interactions
  const [interactiveMetric, setInteractiveMetric] = useState<"salary" | "ot" | "late">("salary");
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<number | null>(null);
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<string | null>(null);
  const [selectedAttendanceFilter, setSelectedAttendanceFilter] = useState<"Tất cả" | "Đúng giờ" | "Đi muộn" | "Nghỉ phép" | "Vắng mặt">("Tất cả");

  // Quick Notes local-persistence state
  const [quickNotes, setQuickNotes] = useState<{ id: string; text: string; completed: boolean; createdAt: string; }[]>(() => {
    const saved = localStorage.getItem("hrm_quick_notes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing quick notes:", e);
      }
    }
    return [
      { id: "note-1", text: "Duyệt danh sách nâng lương của phòng Marketing", completed: false, createdAt: "20/05/2026" },
      { id: "note-2", text: "Kiểm tra danh sách đi muộn của phòng Kỹ thuật sáng nay", completed: true, createdAt: "20/05/2026" },
      { id: "note-3", text: "Liên hệ ứng viên Bùi Vĩnh Cát trao đổi deal phỏng vấn", completed: false, createdAt: "18/05/2026" }
    ];
  });
  const [newNoteText, setNewNoteText] = useState("");

  // Persist quickNotes to localStorage whenever updated
  React.useEffect(() => {
    localStorage.setItem("hrm_quick_notes", JSON.stringify(quickNotes));
  }, [quickNotes]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote = {
      id: "note-" + Date.now(),
      text: newNoteText.trim(),
      completed: false,
      createdAt: new Date().toLocaleDateString("vi-VN")
    };
    setQuickNotes(prev => [newNote, ...prev]);
    setNewNoteText("");
  };

  const handleToggleNote = (id: string) => {
    setQuickNotes(prev => prev.map(note => 
      note.id === id ? { ...note, completed: !note.completed } : note
    ));
  };

  const handleDeleteNote = (id: string) => {
    setQuickNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleClearCompletedNotes = () => {
    setQuickNotes(prev => prev.filter(note => !note.completed));
  };

  const getAdminShortName = (): string => {
    if (!currentAdmin) return "Quản trị viên";
    const name = currentAdmin.name;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      if (prev.length <= 4 && last.length <= 4) {
        return `${prev} ${last}`;
      }
      return last;
    }
    return name;
  };

  const getAdminInitials = (): string => {
    if (!currentAdmin) return "AD";
    const name = currentAdmin.name;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      return (prev[0] + last[0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Core Aggregations & Local States
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Đang làm").length;
  const onLeaveEmployees = employees.filter(e => e.status === "Nghỉ phép").length;
  const probationEmployees = employees.filter(e => e.status === "Thử việc").length;
  const inactiveEmployees = employees.filter(e => e.status === "Đã nghỉ").length;

  const todayAttendance = attendance.filter(a => a.date === todayDateStr);
  const presentTodayCount = todayAttendance.filter(a => a.checkIn !== null).length;
  const lateTodayCount = todayAttendance.filter(a => a.status === "Đi muộn").length;
  const leaveTodayCount = todayAttendance.filter(a => a.status === "Nghỉ phép").length;
  const absentTodayCount = totalEmployees - presentTodayCount - leaveTodayCount;

  const pendingLeavesCount = leaveRequests.filter(l => l.status === "Chờ duyệt").length;
  const totalCandidatesCount = candidates.length;

  // Dynamically calculate operational budgets & statistics based on current active employee database!
  const avgSalary = useMemo(() => {
    if (employees.length === 0) return 0;
    const working = employees.filter(e => e.status !== "Đã nghỉ");
    const sum = working.reduce((acc, curr) => acc + curr.salary, 0);
    return Math.round(sum / working.length);
  }, [employees]);

  // Dynamic Historical Trend Data (scales immediately based on current state of employees!)
  const trendData = useMemo<TrendPoint[]>(() => {
    const baseCompensationPool = employees.filter(e => e.status !== "Đã nghỉ").reduce((acc, curr) => acc + curr.salary, 0);
    
    // Provide a responsive simulation trend line leading up to the current active database!
    return [
      { month: "12/2025", salarySum: Math.round(baseCompensationPool * 0.88), otHours: 42, lateRate: 14, label: "Tháng 12/2025" },
      { month: "01/2026", salarySum: Math.round(baseCompensationPool * 0.92), otHours: 58, lateRate: 11, label: "Tháng 01/2026" },
      { month: "02/2026", salarySum: Math.round(baseCompensationPool * 0.90), otHours: 35, lateRate: 16, label: "Tháng 02/2026" },
      { month: "03/2026", salarySum: Math.round(baseCompensationPool * 0.96), otHours: 62, lateRate: 9, label: "Tháng 03/2026" },
      { month: "04/2026", salarySum: Math.round(baseCompensationPool * 0.98), otHours: 48, lateRate: 12, label: "Tháng 04/2026" },
      { month: "05/2026", salarySum: baseCompensationPool, otHours: 51, lateRate: Math.round((lateTodayCount / (presentTodayCount || 1)) * 10), label: "Tháng 05/2026 (Hiện tại)" }
    ];
  }, [employees, lateTodayCount, presentTodayCount]);

  // Calculate coordinates for the interactive trend line
  const trendLineSVGPoints = useMemo(() => {
    if (trendData.length === 0) return "";
    
    // Find extremes
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

  // Formulate Area SVG Path
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

  // Roster breakdown by Division
  const departments = ["Kỹ thuật", "Marketing", "Kinh doanh", "Nhân sự", "Tài chính", "Hành chính"];
  const deptCounts = useMemo(() => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept && e.status !== "Đã nghỉ");
      const deptSalarySum = deptEmployees.reduce((acc, curr) => acc + curr.salary, 0);
      const avgDeptSalary = deptEmployees.length > 0 ? Math.round(deptSalarySum / deptEmployees.length) : 0;
      
      return {
        name: dept,
        count: deptEmployees.length,
        percentage: Math.round((deptEmployees.length / (totalEmployees || 1)) * 100),
        avgSalary: avgDeptSalary,
        highestEarnerName: deptEmployees.sort((a,b) => b.salary - a.salary)[0]?.name || "Chưa có",
        activeTasksCount: 0 // Will compute below matching employee assignments
      };
    });
  }, [employees, totalEmployees]);

  // Comprehensive custom check-lists and metrics based on Role departments
  const currentRoleConfig = useMemo(() => {
    switch (activeRolePerspective) {
      case "Nhân sự":
        return {
          title: "Giám sát Nhân sự & Đào tạo (HR Command)",
          subtitle: "Phạm vi: Tuyển dụng, Rà soát HĐLĐ, Phê duyệt nghỉ phép & Phúc lợi",
          motto: "Thúc đẩy tài năng, chuẩn hoá hệ thống đãi ngộ và kiến tạo văn hoá làm việc hiệu quả.",
          focusMetricLabel: "Chỉ số tuyển dụng",
          focusMetricValue: `${totalCandidatesCount} Ứng viên`,
          focusMetricSub: `${candidates.filter(c => c.status === "Phỏng vấn").length} lượt đang phỏng vấn`,
          insights: [
            `Có ${pendingLeavesCount} đơn xin nghỉ đang chờ phê duyệt gấp. Hãy duyệt trước giờ chốt báo cáo.`,
            `Ghi nhận ${employees.filter(e => e.status === "Thử việc").length} nhân sự đang thử việc cần lộ trình đào tạo chuẩn.`
          ],
          checklist: [
            { id: "hr-1", text: `Đánh giá và cấp phép cho ${pendingLeavesCount} đơn phép còn tồn đọng`, done: pendingLeavesCount === 0 },
            { id: "hr-2", text: "Kiểm tra tiến độ phỏng vấn sàng lọc ứng viên mới", done: false },
            { id: "hr-3", text: "Xây dựng định biên tài chính bảo hiểm quý mới", done: true }
          ]
        };
      case "Kỹ thuật":
        const techEngs = employees.filter(e => e.department === "Kỹ thuật" && e.status !== "Đã nghỉ");
        return {
          title: "Tổng tư lệnh Công nghệ (Technical Director)",
          subtitle: "Phạm vi: Tiến độ dự án, Theo dõi trực ban kỹ thuật & Hậu cần Engineering",
          motto: "Kiểm soát tiến độ bàn giao, chuẩn hoá ca kíp trực hệ thống kỹ sư.",
          focusMetricLabel: "Nguồn lực Engineering",
          focusMetricValue: `${techEngs.length} Kỹ sư`,
          focusMetricSub: `${techEngs.filter(e => e.status === "Đang làm").length} đang hoạt động tích cực`,
          insights: [
            `Tỷ lệ đi muộn của phòng Kỹ thuật sáng nay giảm nhẹ còn 4.2%. Đội ngũ duy trì kỷ luật tốt.`,
            `Học phần nâng cao chất lượng code tự hoàn thiện trong tuần đạt mức 85%.`
          ],
          checklist: [
            { id: "tech-1", text: "Phân bổ phân khúc tính năng trong backlog cho lập trình viên", done: false },
            { id: "tech-2", text: "Xét duyệt đăng ký làm thêm giờ (OT) tuần trước", done: false },
            { id: "tech-3", text: "Hỗ trợ nhân sự mới tham gia làm quen hệ thống hạ tầng server", done: true }
          ]
        };
      case "Tài chính":
        const activeComp = employees.filter(e => e.status !== "Đã nghỉ").reduce((a, b) => a + b.salary, 0);
        return {
          title: "Tổng giám đốc Tài chính & Kế toán (CFO)",
          subtitle: "Phạm vi: Phân phối lương bổng, Khấu trừ bảo hiểm, Dự trù dòng tiền",
          motto: "Bảo mật hạch toán tài chính, tinh giản chi phí gián tiếp và nâng tầm hiệu quả đầu tư.",
          focusMetricLabel: "Quỹ lương hàng tháng",
          focusMetricValue: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(activeComp),
          focusMetricSub: `Bình quân thực nhận: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(avgSalary)}/người`,
          insights: [
            `Tổng chi khấu trừ lương ước tính do đi muộn & phạt hành chính đạt 1.8%.`,
            `Thuế thu nhập cá nhân ước tính và đóng BHXH trực tuyến chuẩn bị hạn thanh toán vào ngày 25.`
          ],
          checklist: [
            { id: "fin-1", text: "Tổng đối chiếu chấm công chuẩn bị xuất phiếu lương thời gian thực", done: false },
            { id: "fin-2", text: "Kiểm tra danh sách nhân sự tạm ứng lương trong tháng", done: true },
            { id: "fin-3", text: "Báo cáo dòng tiền vận hành hành chính cho ban giám đốc", done: false }
          ]
        };
      default: // Marketing / Kinh doanh / Executive
        const frontHeadcount = employees.filter(e => (e.department === "Kinh doanh" || e.department === "Marketing") && e.status !== "Đã nghỉ").length;
        return {
          title: "Giám đốc Phát triển & Vận hành Kinh doanh (CMO/CCO)",
          subtitle: "Phạm vi: Tăng trưởng doanh số, Sức chiến đấu phòng Front-line & Trải nghiệm khách hàng",
          motto: "Tối ưu hóa sự diện diện của nhân viên tiếp thị, gia tăng mức độ phủ sóng thị trường.",
          focusMetricLabel: "Quân số Front-office",
          focusMetricValue: `${frontHeadcount} Nhân sự`,
          focusMetricSub: "Chiếm gần 35% cơ cấu nhân sự nòng cốt",
          insights: [
            `Số lượng công việc gán cho phòng Marketing tuần này tăng cao do chuẩn bị khởi động chiến dịch hè.`,
            `Hồ sơ ứng tuyển chuyên viên kinh doanh đang tăng trưởng mạnh nhất ở khu vực Cầu Giấy.`
          ],
          checklist: [
            { id: "biz-1", text: "Giao chỉ tiêu KPI hoa hồng kinh doanh tháng hiện tại", done: false },
            { id: "biz-2", text: "Rà soát lịch đi công tác và nghỉ phép của đội ngũ sales", done: true },
            { id: "biz-3", text: "Lên chiến dịch truyền thông tuyển dụng phối hợp cùng HR", done: false }
          ]
        };
    }
  }, [activeRolePerspective, totalCandidatesCount, candidates, pendingLeavesCount, employees, avgSalary]);

  // Click on attendance slices integrates with the Activity Log!
  // We filter the "Nhật ký hoạt động" feed dynamically depending on selected slice
  const filteredTimelineLogs = useMemo(() => {
    const baseLogs = [
      { id: "log-1", name: "Đặng Quốc Hùng", action: "Đã duyệt đơn xin nghỉ phép năm", time: "Hôm qua", type: "Nghỉ phép", detail: "Phòng ban Marketing • Nghỉ phép phép năm" },
      { id: "log-2", name: "Ngô Thị Bích Vân", action: "Đã check-in hệ thống đúng giờ", time: "08:15:22", type: "Đúng giờ", detail: "Mã số NV008 • Check-in đúng quy định" },
      { id: "log-3", name: "Vũ Đức Thịnh", action: "Nộp dự thầu hạch toán tài chính quý mới", time: "18-05-2026", type: "Đúng giờ", detail: "Phòng ban Tài chính • Kế toán trưởng" },
      { id: "log-4", name: "Bùi Vĩnh Cát", action: "Gia nhập hệ thống ứng viên phỏng vấn đạt 92 điểm", time: "18-05-2026", type: "Khác", detail: "Ứng tuyển vị trí tương tác sản phẩm UI/UX" },
      { id: "log-5", name: "Trần Thị Thu Hà", action: "Đi muộn sáng nay", time: "08:34:10", type: "Đi muộn", detail: "Mã số NV002 • Đi muộn 34 phút" },
      { id: "log-6", name: "Lập trình viên React", action: "Khởi động chiến dịch tuyển dụng kỹ thuật", time: "10-05-2026", type: "Khác", detail: "Thu hút 28 hồ sơ trực tuyến" },
      { id: "log-7", name: "Phạm Thị Lan Anh", action: "Cập nhật cơ cấu BHXH cho 12 nhân viên chính thức", time: "05-05-2026", type: "Đúng giờ", detail: "Giao dịch bảo lãnh trực tuyến thành công" }
    ];

    if (selectedAttendanceFilter === "Tất cả") return baseLogs;
    if (selectedAttendanceFilter === "Đúng giờ") {
      return baseLogs.filter(l => l.type === "Đúng giờ");
    }
    if (selectedAttendanceFilter === "Đi muộn") {
      return baseLogs.filter(l => l.type === "Đi muộn");
    }
    if (selectedAttendanceFilter === "Nghỉ phép") {
      return baseLogs.filter(l => l.type === "Nghỉ phép");
    }
    // "Vắng mặt" or "Khác"
    return baseLogs.filter(l => l.type === "Khác" || l.type === "Đúng giờ");
  }, [selectedAttendanceFilter]);

  return (
    <div className="space-y-6 select-none leading-relaxed">
      {/* 1. TOP WELCOME HEADER & COMPREHENSIVE ROLE SWITCHER */}
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

        {/* Dynamic Multi-role interactive Switcher */}
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

      {/* 2. PERSONALIZED SUMMARIES HERO PANEL WITH ACTION CHECKLISTS */}
      <motion.div 
        layout
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="bg-gradient-to-br from-slate-950 via-slate-950/80 to-[#12101F] rounded-3xl p-6 border border-violet-500/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 divider-x divider-white/5">
          
          {/* Left Column: Slogan, Title Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full w-max block">
                BÁO CÁO TIÊU ĐIỂM CHUYÊN MÔN
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span>{currentRoleConfig.title}</span>
              </h2>
              <p className="text-xs text-indigo-400/80 font-medium font-sans italic">{currentRoleConfig.subtitle}</p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              &ldquo;{currentRoleConfig.motto}&rdquo;
            </p>

            {/* Personalized dynamic insights */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ý KIẾN / BÁO CÁO ĐỀ XUẤT</p>
              <div className="space-y-1.5">
                {currentRoleConfig.insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs text-slate-300 items-start">
                    <span className="text-violet-400 mt-1 shrink-0">•</span>
                    <p className="leading-relaxed font-sans">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Focus metrics and interactive checklists */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* Key Focus Metric Indicator */}
            <div className="p-4 bg-gradient-to-tr from-indigo-950/20 to-slate-900/40 border border-indigo-500/10 rounded-2xl flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">{currentRoleConfig.focusMetricLabel}</span>
                <span className="text-lg font-bold text-indigo-300 block font-mono">{currentRoleConfig.focusMetricValue}</span>
                <span className="text-[10px] text-white/50 block leading-tight">{currentRoleConfig.focusMetricSub}</span>
              </div>
              <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/15 text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            {/* Checklist of immediate priority goals */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">ĐỒNG BỘ ĐIỀU HÀNH HÔM NAY</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full">QUAN TRỌNG</span>
              </div>
              <div className="space-y-1.5">
                {currentRoleConfig.checklist.map((item) => (
                  <div 
                    key={item.id}
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

      {/* 3. DYNAMIC STATS HUB CARDS (4 COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Tổng nhân sự chính thức", 
            value: totalEmployees, 
            sub: `${activeEmployees} Đang làm • ${probationEmployees} Thử việc`, 
            icon: Users,
            iconColor: "text-blue-400",
            glow: "hover:border-blue-500/20",
            tabLink: "employees"
          },
          { 
            title: "Mức lương bình quân", 
            value: new Intl.NumberFormat("vi-VN").format(avgSalary), 
            sub: "Tổng hợp toàn bộ biên chế", 
            icon: DollarSign,
            iconColor: "text-emerald-400",
            glow: "hover:border-emerald-500/20",
            tabLink: "payroll"
          },
          { 
            title: "Yêu cầu nghỉ chờ duyệt", 
            value: pendingLeavesCount, 
            sub: `${leaveRequests.filter(l => l.status === "Đã duyệt").length} đơn tháng này đã duyệt`, 
            icon: Calendar,
            iconColor: "text-amber-400",
            glow: "hover:border-amber-500/20",
            tabLink: "leaves"
          },
          { 
            title: "Ứng Viên Tuyển Dụng", 
            value: totalCandidatesCount, 
            sub: "Đang lưu quy trình tuyển chọn", 
            icon: Network,
            iconColor: "text-violet-400",
            glow: "hover:border-violet-500/20",
            tabLink: "recruitment"
          }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              onClick={() => setActiveTab(card.tabLink)}
              className={`card-3d p-5 rounded-2xl relative overflow-hidden flex items-start justify-between cursor-pointer transition-all ${card.glow}`}
            >
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono block">{card.title}</span>
                <p className="text-2xl font-bold text-white tracking-tight font-mono">{card.value}</p>
                <p className="text-[10px] text-white/40">{card.sub}</p>
              </div>
              <div className={`p-2 rounded-xl bg-white/5 border border-white/5 shrink-0 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. MAIN INTERACTIVE DATA VISUALIZATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Interactive SVG Finance / Operational Trend Line Chart */}
        <div className="card-3d p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>Trực Quan Diễn Biến Kỳ Vận Hành</span>
              </h3>
              <p className="text-xs text-white/45">Bao gồm 6 tháng gần nhất tích lũy theo cơ cấu nhân sự hiện tại</p>
            </div>

            {/* Interactive metric togglers */}
            <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setInteractiveMetric("salary")}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                  interactiveMetric === "salary" ? "bg-violet-650 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Quỹ Lương (VND)
              </button>
              <button
                type="button"
                onClick={() => setInteractiveMetric("ot")}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                  interactiveMetric === "ot" ? "bg-violet-650 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                OT Tích Lũy (h)
              </button>
              <button
                type="button"
                onClick={() => setInteractiveMetric("late")}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                  interactiveMetric === "late" ? "bg-violet-650 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Tỷ lệ đi muộn (%)
              </button>
            </div>
          </div>

          {/* Interactive Chart Container - Pure SVG layout with dynamic cursors */}
          <div className="w-full h-48 bg-black/40 border border-slate-800/60 rounded-2xl relative overflow-visible mt-2 select-none flex items-center justify-center">
            {trendLineSVGPoints.length > 0 ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" fill="transparent">
                <defs>
                  {/* Glowing line gradients */}
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="violetGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
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

                {/* Dynamic Area path with gradients */}
                <path 
                  d={trendAreaPath} 
                  fill={interactiveMetric === "late" ? "url(#chartGlow)" : "url(#violetGlow)"} 
                  className="transition-all duration-300"
                />

                {/* Dynamic Trendline stroke */}
                <path 
                  d={trendLinePath} 
                  stroke={interactiveMetric === "late" ? "#10b981" : "#8b5cf6"} 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  className="transition-all duration-300 drop-shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
                />

                {/* Interactive cursor line and points */}
                {trendLineSVGPoints.map((pt, idx) => {
                  const isHovered = hoveredTrendPoint === idx;
                  return (
                    <g key={idx} className="cursor-pointer">
                      {/* Interactive click catcher panel for hover tracking */}
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

                      {/* Vertical tracker line when hovered */}
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

                      {/* Floating glowing nodes */}
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
            ) : (
              <span className="text-xs text-slate-500">Thiếu dữ liệu vẽ sơ đồ</span>
            )}

            {/* Float dynamic Tooltip on top of charts instantly */}
            <AnimatePresence>
              {hoveredTrendPoint !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-20 pointer-events-none"
                  style={{
                    left: `${Math.min(360, Math.max(10, trendLineSVGPoints[hoveredTrendPoint].x - 60))}px`,
                    top: `${Math.min(90, Math.max(10, trendLineSVGPoints[hoveredTrendPoint].y - 85))}px`
                  }}
                >
                  <p className="text-[10px] font-bold text-zinc-400 font-mono leading-none mb-1">
                    {trendData[hoveredTrendPoint].label}
                  </p>
                  <p className="text-xs font-black text-white font-mono flex items-center gap-1 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                    <span>
                      {interactiveMetric === "salary" 
                        ? new Intl.NumberFormat("vi-VN").format(trendData[hoveredTrendPoint].salarySum) + " VND"
                        : interactiveMetric === "ot"
                          ? trendData[hoveredTrendPoint].otHours + " giờ"
                          : trendData[hoveredTrendPoint].lateRate + "%"}
                    </span>
                  </p>
                  <p className="text-[8px] text-zinc-500 mt-1 leading-none">Nhấn để chuyển hệ thống số liệu</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Month labels under SVG chart */}
          <div className="grid grid-cols-6 text-center text-[10px] text-slate-500 font-bold font-mono px-6">
            {trendData.map((d, id) => (
              <span key={id} className={`${hoveredTrendPoint === id ? "text-violet-400" : ""}`}>
                {d.month}
              </span>
            ))}
          </div>
        </div>

        {/* Column 3: Interactive Circular Donut Chart & Integrated Event Log Filter */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Đại diện quân số hôm nay</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ONLINE</span>
            </h3>
            <p className="text-xs text-white/45">Nhấp vào từng phân mục bên dưới để lọc danh mục nhật ký tương ứng</p>
          </div>

          {/* Core Interactive Donut Chart */}
          <div className="flex items-center justify-center py-2 relative">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.03)" strokeWidth="9" fill="transparent" />
                
                {/* Segment: Đúng giờ (Emerald) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  stroke="#10b981" 
                  strokeWidth={selectedAttendanceFilter === "Đúng giờ" ? "12" : "9"} 
                  fill="transparent" 
                  strokeDasharray="238.64" 
                  strokeDashoffset={238.64 * (1 - (presentTodayCount - lateTodayCount) / (totalEmployees || 1))} 
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => setSelectedAttendanceFilter(selectedAttendanceFilter === "Đúng giờ" ? "Tất cả" : "Đúng giờ")}
                />

                {/* Segment: Đi muộn (Amber) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  stroke="#f59e0b" 
                  strokeWidth={selectedAttendanceFilter === "Đi muộn" ? "12" : "9"} 
                  fill="transparent" 
                  strokeDasharray="238.64" 
                  strokeDashoffset={238.64 * (1 - (lateTodayCount) / (totalEmployees || 1))} 
                  className="cursor-pointer opacity-80 hover:opacity-100 transition-all duration-300"
                  onClick={() => setSelectedAttendanceFilter(selectedAttendanceFilter === "Đi muộn" ? "Tất cả" : "Đi muộn")}
                />
              </svg>
              
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-xl font-bold text-white font-mono leading-none">
                  {Math.round((presentTodayCount / (totalEmployees || 1)) * 100)}%
                </span>
                <span className="text-[8px] text-white/45 uppercase tracking-widest mt-1">Có mặt</span>
              </div>
            </div>
          </div>

          {/* Grid buttons to toggle filters with instant state change indicator */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Đúng giờ", count: presentTodayCount - lateTodayCount, color: "bg-emerald-500", filter: "Đúng giờ" as const },
              { label: "Đi muộn", count: lateTodayCount, color: "bg-amber-500", filter: "Đi muộn" as const },
              { label: "Nghỉ phép", count: onLeaveEmployees, color: "bg-violet-500", filter: "Nghỉ phép" as const },
              { label: "Vắng mặt", count: absentTodayCount, color: "bg-zinc-500", filter: "Vắng mặt" as const }
            ].map((item) => {
              const active = selectedAttendanceFilter === item.filter;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedAttendanceFilter(active ? "Tất cả" : item.filter)}
                  className={`p-2 rounded-xl text-left border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    active 
                      ? "bg-violet-650/15 border-violet-500 text-white shadow-md shadow-violet-950/20 scale-[1.02]" 
                      : "bg-[#0B0D12] border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.color}`} />
                    <span className="truncate leading-none">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{item.count}</span>
                </button>
              );
            })}
          </div>

          {selectedAttendanceFilter !== "Tất cả" && (
            <div className="text-[10px] bg-indigo-500/10 text-indigo-300 p-2 rounded-xl text-center flex items-center justify-center gap-1">
              <span>Đang lọc danh sách hành động theo: <b>{selectedAttendanceFilter}</b></span>
              <button 
                type="button" 
                onClick={() => setSelectedAttendanceFilter("Tất cả")}
                className="text-white hover:text-red-400 ml-1.5 font-bold"
                aria-label="Hủy lọc trạng thái"
              >
                ✕
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 5. INTERACTIVE BENTO GRID FOR DEPARTMENT DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Interactive Department breakdown, allowing to click and drill down */}
        <div className="card-3d p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Building className="w-4 h-4 text-violet-400" />
              <span>Phân Bổ Định Biên & Quỹ Lương Phòng Ban</span>
            </h3>
            <p className="text-xs text-white/45">Nhấp vào một phòng ban bất kỳ để rà soát chi tiết nhân sự & dải tiền lương</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-1">
            {deptCounts.map((dept) => {
              const activeDetail = selectedDeptDetail === dept.name;
              return (
                <div 
                  key={dept.name}
                  onClick={() => setSelectedDeptDetail(activeDetail ? null : dept.name)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-250 hover:bg-slate-900/45 ${
                    activeDetail 
                      ? "bg-violet-950/15 border-violet-500 shadow-lg shadow-violet-950/25" 
                      : "bg-[#090B10] border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white tracking-tight">{dept.name}</span>
                    <span className="text-[10px] bg-white/5 text-slate-300 font-bold px-2 py-0.5 rounded">
                      {dept.count} nhân sự ({dept.percentage}%)
                    </span>
                  </div>

                  {/* Visual Bar gauge inside segment */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Lương bổng TB: <b className="text-slate-300 font-mono">{new Intl.NumberFormat("vi-VN").format(dept.avgSalary)}đ</b></span>
                    <span className="text-violet-400 flex items-center font-bold">
                      {activeDetail ? "Đóng &uarr;" : "Chi tiết &rarr;"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drill-down Drawer section triggered dynamically */}
          <AnimatePresence>
            {selectedDeptDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-[#0A0D15]/80 border border-violet-500/10 rounded-2xl p-4 space-y-3.5"
              >
                {(() => {
                  const dataDetail = deptCounts.find(d => d.name === selectedDeptDetail);
                  const matchingEmployees = employees.filter(e => e.department === selectedDeptDetail && e.status !== "Đã nghỉ");
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">
                          PHÂN TÍCH RÀ SOÁT: {selectedDeptDetail.toUpperCase()}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedDeptDetail(null)}
                          className="text-slate-400 hover:text-white"
                          aria-label="Đóng phân tích"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block font-medium">Nhân sự thực tế</span>
                          <span className="text-white font-mono font-bold mt-0.5 block">{dataDetail?.count} kỹ sư/chuyên viên</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-medium">Sao thu nhập hàng đầu</span>
                          <span className="text-white font-serif mt-0.5 block text-violet-350">{dataDetail?.highestEarnerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-medium">Sự hiện diện chính xác</span>
                          <span className="text-white font-mono mt-0.5 block">
                            {matchingEmployees.length > 0 
                              ? `${Math.round((matchingEmployees.filter(e => e.status === "Đang làm").length / matchingEmployees.length) * 100)}% trực tuyến`
                              : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                        <span className="text-[9px] text-slate-500 uppercase font-black font-mono block">DANH SÁCH NHÂN SỰ BIÊN CHẾ TRỰC THUỘC:</span>
                        <div className="flex flex-wrap gap-2">
                          {matchingEmployees.map(emp => (
                            <span 
                              key={emp.id} 
                              className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 text-slate-350 hover:bg-white/10 hover:text-white transition-colors cursor-pointer border border-white/5 font-sans"
                            >
                              {emp.name} ({emp.position})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: Custom Event Timelines, filter-sync'd with Daily attendance! */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Giao dịch biên chép hệ thống</span>
            </h3>
            <p className="text-xs text-white/45">Hoạt động chuẩn hoá lưu trữ tự động trên thiết bị</p>
          </div>

          {/* Render Timeline rows with direct filter state feedback */}
          <div className="space-y-3 h-72 overflow-y-auto pr-1">
            {filteredTimelineLogs.length > 0 ? (
              filteredTimelineLogs.map((act) => {
                const getRowIcons = () => {
                  switch (act.type) {
                    case "Đúng giờ":
                      return { icon: CheckCircle2, bg: "bg-emerald-500/10 text-emerald-400" };
                    case "Đi muộn":
                      return { icon: AlertCircle, bg: "bg-amber-500/10 text-amber-400" };
                    case "Nghỉ phép":
                      return { icon: Calendar, bg: "bg-violet-500/10 text-violet-400" };
                    default:
                      return { icon: Zap, bg: "bg-blue-500/10 text-blue-400" };
                  }
                };
                const config = getRowIcons();
                const RowIcon = config.icon;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={act.id} 
                    className="flex items-start space-x-3 p-3 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${config.bg}`}>
                      <RowIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-bold font-sans truncate">{act.name}</p>
                        <span className="text-[10px] text-white/40 font-mono shrink-0">{act.time}</span>
                      </div>
                      <p className="text-white/70 leading-relaxed mt-0.5 font-sans">{act.action}</p>
                      <span className="text-[9px] text-zinc-500 font-mono mt-1 block uppercase tracking-wider">{act.detail}</span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Activity className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/40 text-xs font-semibold">Chưa phát sinh hành động khớp với bộ lọc đã chọn</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/5 text-center">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">
              PHẦN MỀM LƯU CHỮ: LOCAL STORAGE ENGINE v2.0
            </span>
          </div>
        </div>

      </div>

      {/* 6. SYSTEM QUICK NOTEBOARD & TASK TICKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sổ tay ghi chú Card (lg:col-span-2) */}
        <div id="quick-noteboard-container" className="card-3d p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-violet-400" />
                <span>Sổ Tay Ghi Chú & Việc Cần Làm Nhanh</span>
              </h3>
              <p className="text-xs text-white/45">Nhận các lưu ý, ghi chép nhanh các phát sinh chi nhánh hoặc nhân sự tiện lợi</p>
            </div>
            
            {quickNotes.some(n => n.completed) && (
              <button
                type="button"
                onClick={handleClearCompletedNotes}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-white transition-all font-bold cursor-pointer border border-orange-500/15"
              >
                Xóa việc đã hoàn thành
              </button>
            )}
          </div>

          {/* Form to insert quick notes */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              id="quick-note-input"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Thêm nhanh một ghi chú công việc cần làm..."
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500/80 focus:outline-none rounded-xl text-white text-sm placeholder:text-white/30"
              maxLength={150}
            />
            <button
              type="submit"
              id="quick-note-add-btn"
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-950/40 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm</span>
            </button>
          </form>

          {/* Render individual items with complete check circle click actions */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {quickNotes.length > 0 ? (
              <AnimatePresence initial={false}>
                {quickNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div 
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        note.completed 
                          ? "bg-[#091511] border-emerald-500/20 text-white/40" 
                          : "bg-[#0B0D12] border-white/5 text-slate-200 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Checkbox button icon with distinct checked visual styles */}
                        <button
                          type="button"
                          id={`toggle-note-${note.id}`}
                          onClick={() => handleToggleNote(note.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                            note.completed 
                              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400" 
                              : "border-slate-800 text-transparent hover:border-slate-700 hover:bg-white/5"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                        </button>
                        <span 
                          onClick={() => handleToggleNote(note.id)}
                          className={`text-sm select-none cursor-pointer leading-relaxed font-sans truncate ${
                            note.completed ? "line-through text-slate-500" : "text-white"
                          }`}
                        >
                          {note.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">{note.createdAt}</span>
                        <button
                          type="button"
                          id={`delete-note-${note.id}`}
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 px-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-all cursor-pointer border border-red-500/10"
                          title="Xóa ghi chú"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <ClipboardList className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/40 text-xs font-semibold">Hiện chưa lưu ghi chú rảnh tay nào</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Điền vào thanh nhập phía trên để lưu những việc cần xử lý nhanh</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes summary progress gauge card (lg:col-span-1) */}
        <div id="quick-note-stats-container" className="card-3d p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Hiệu Suất Đầu Việc</span>
              <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">STATISTICS</span>
            </h3>
            <p className="text-xs text-white/45">Tỷ lệ hoàn thành các ghi chú phát sinh</p>
          </div>

          <div className="flex flex-col items-center justify-center py-2 relative flex-1">
            {/* Visual gauge indicator based on notes counts */}
            {(() => {
              const totalNotes = quickNotes.length;
              const completedNotes = quickNotes.filter(n => n.completed).length;
              const pct = totalNotes > 0 ? Math.round((completedNotes / totalNotes) * 100) : 0;
              
              return (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="38" 
                        stroke="#8b5cf6" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray="238.64" 
                        strokeDashoffset={238.64 * (1 - pct / 100)} 
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-lg font-black text-white font-mono">{pct}%</span>
                      <span className="text-[8px] text-white/40 block leading-tight font-bold">XONG</span>
                    </div>
                  </div>

                  <div className="w-full text-center space-y-1">
                    <p className="text-xs text-slate-300 font-semibold font-sans">
                      Đã giải quyết {completedNotes} trên tổng số {totalNotes} đầu việc
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                      {pct === 100 && totalNotes > 0 
                        ? "Tuyệt vời! Toàn bộ việc ghi chú đã hoàn thành xuất sắc 🎉" 
                        : totalNotes > 0
                          ? "Hãy bám sát kế hoạch rà soát và tích hợp hoàn chỉnh hệ thống!"
                          : "Hiện tinh thần sảng khoái, không lưu công việc tồn đọng!"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Chưa xong: <b className="text-rose-400 font-mono">{quickNotes.filter(n => !n.completed).length}</b></span>
            <span>Đã xong: <b className="text-emerald-400 font-mono">{quickNotes.filter(n => n.completed).length}</b></span>
          </div>
        </div>

      </div>

    </div>
  );
}
