/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Users, 
  Clock, 
  Calendar, 
  Network, 
  TrendingUp, 
  ArrowRight,
  TrendingDown,
  AlertCircle
} from "lucide-react";
import { Employee, Attendance, LeaveRequest, Candidate } from "../types";

interface DashboardProps {
  employees: Employee[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  candidates: Candidate[];
  setActiveTab: (tab: string) => void;
  currentAdmin?: Employee;
  onProfileClick?: () => void;
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
  const getAdminShortName = (): string => {
    if (!currentAdmin) return "Lan Anh";
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
    if (!currentAdmin) return "LA";
    const name = currentAdmin.name;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      return (prev[0] + last[0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  
  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Đang làm").length;
  const onLeaveEmployees = employees.filter(e => e.status === "Nghỉ phép").length;
  
  // Attendance today (2026-05-20)
  const todayDateStr = "2026-05-20";
  const todayAttendance = attendance.filter(a => a.date === todayDateStr);
  const presentTodayCount = todayAttendance.filter(a => a.checkIn !== null).length;
  const lateTodayCount = todayAttendance.filter(a => a.status === "Đi muộn").length;
  
  // Pending leaves
  const pendingLeavesCount = leaveRequests.filter(l => l.status === "Chờ duyệt").length;
  
  // Candidates in funnel
  const totalCandidatesCount = candidates.length;

  // Department counts for bar visualization
  const departments = ["Kỹ thuật", "Marketing", "Kinh doanh", "Nhân sự", "Tài chính", "Hành chính"];
  const deptCounts = departments.map(dept => ({
    name: dept,
    count: employees.filter(e => e.department === dept).length,
    percentage: Math.round((employees.filter(e => e.department === dept).length / totalEmployees) * 100)
  }));

  // Quick operational shortcuts
  const quickActions = [
    { text: "Xem và phê duyệt các yêu cầu nghỉ phép cần duyệt", tab: "leaves" },
    { text: "Rà soát điều khoản ký kết hợp đồng lao động", tab: "contracts" },
    { text: "Tính toán & quyết toán hạch toán bảng lương kì này", tab: "payroll" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Header - Immersive UI Layout */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
            <span className="hover:text-white transition-colors cursor-pointer">NEXUS HRM</span>
            <span className="opacity-30">/</span>
            <span className="text-white font-semibold">Operational Dashboard</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight mt-1">Hệ thống HRM Dashboard</h1>
          <p className="text-white/40 text-xs">
            Chào ngày làm việc mới, <span className="font-bold text-violet-300">{getAdminShortName()}</span>. Dưới đây là tóm tắt nhanh về nhân sự hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-2 rounded-lg border border-white/15 px-4 flex items-center gap-2">
            <span className="text-xs text-white/40">Hệ thống trực tuyến:</span>
            <span className="text-xs font-mono text-violet-400">20-05-2026</span>
          </div>
          <div 
            onClick={onProfileClick}
            className="w-8 h-8 rounded-full bg-violet-600/20 hover:bg-violet-650/40 active:scale-95 border border-violet-500/50 hover:border-violet-400 flex items-center justify-center font-bold text-xs cursor-pointer text-violet-300 transition-all shadow-md shadow-violet-950/20"
            title="Nhấp để thay đổi danh tính quản trị viên"
          >
            {getAdminInitials()}
          </div>
        </div>
      </header>

      {/* Operational Announcements Greeting Card */}
      <motion.div 
        whileHover={{ transform: "translateY(-4px)" }}
        className="bg-gradient-to-r from-violet-600/15 to-indigo-600/20 p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden group border border-violet-500/15"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2 text-violet-350 font-black text-xs tracking-wider uppercase bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full w-max">
              <AlertCircle className="w-4 h-4 text-violet-400" />
              <span>Báo Cáo Tiêu Điểm Vận Hành Hôm Nay</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">Chào <span className="text-amber-400 font-extrabold">{getAdminShortName()}</span>, hệ thống ghi nhận một số thông số quan trọng cần lưu tâm:</h2>
            <ul className="text-sm text-white/90 space-y-1.5 list-disc list-inside">
              <li>Đang tồn đọng <strong className="text-amber-400 font-bold">{pendingLeavesCount} yêu cầu nghỉ phép</strong> chưa duyệt. Hãy rà soát sớm để phòng ban chủ động điều phối công việc.</li>
              <li>Chỉ số đi muộn ngày hôm nay ghi nhận ở mức <strong className="text-amber-400 font-bold">12%</strong>. Đề xuất xem xét báo cáo chi tiết để có chính sách chấn chỉnh phù hợp.</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setActiveTab("leaves")}
              className="px-5 py-3 rounded-xl bg-violet-650 hover:bg-violet-600 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <span>Xử lý nghỉ phép</span>
            </button>
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((action, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveTab(action.tab)}
              className="p-3 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 text-left text-xs text-white/90 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
            >
              <span className="pr-2 leading-relaxed">{action.text}</span>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white shrink-0 transition-all group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grid Quick Stats Cards (4 Columns) with card-3d styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            title: "Nhân Sự Hệ Thống", 
            value: totalEmployees, 
            sub: `${activeEmployees} Đang làm • ${onLeaveEmployees} Nghỉ phép`, 
            icon: Users,
            iconColor: "text-blue-400"
          },
          { 
            title: "Chấm Công Hôm Nay", 
            value: `${presentTodayCount}/${totalEmployees}`, 
            sub: `${lateTodayCount} nhân viên đi muộn`, 
            icon: Clock,
            iconColor: "text-emerald-400"
          },
          { 
            title: "Yêu Cầu Nghỉ Phép", 
            value: pendingLeavesCount, 
            sub: "Đang chờ quản trị viên duyệt", 
            icon: Calendar,
            iconColor: "text-amber-400",
            tabLink: "leaves"
          },
          { 
            title: "Ứng Viên Tuyển Dụng", 
            value: totalCandidatesCount, 
            sub: "Trong quy trình lọc & phỏng vấn", 
            icon: Network,
            iconColor: "text-violet-400",
            tabLink: "recruitment"
          }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4, border: "1px solid rgba(255,255,255,0.12)" }}
              onClick={() => card.tabLink && setActiveTab(card.tabLink)}
              className="card-3d p-6 rounded-2xl relative overflow-hidden flex items-start justify-between cursor-pointer transition-all"
            >
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider font-mono">{card.title}</p>
                <p className="text-3xl font-display font-bold text-white tracking-tight">{card.value}</p>
                <p className="text-[11px] text-white/55">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-lg bg-white/5 border border-white/5 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts & Updates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department breakdown */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Phân bổ nhân sự</h3>
            <p className="text-xs text-white/45">Số lượng nhân sự phân bố theo phòng ban</p>
          </div>
          
          <div className="space-y-4 my-6">
            {deptCounts.map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/80">{dept.name}</span>
                  <span className="text-white/50 font-mono">{dept.count} nhân sự ({dept.percentage}%)</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-3 border-t border-white/5">
            <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer" onClick={() => setActiveTab("employees")}>
              Xem danh sách nhân viên chi tiết &rarr;
            </span>
          </div>
        </div>

        {/* Attendance details today */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Trực quan chấm công</h3>
            <p className="text-xs text-white/45">Trạng thái check-in toàn hệ thống hôm nay</p>
          </div>

          <div className="my-6 flex items-center justify-around gap-2">
            {/* Round chart */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* BackgroundCircle */}
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                {/* On Time Arc */}
                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" strokeDashoffset={`${251.2 * (1 - (presentTodayCount - lateTodayCount) / totalEmployees)}`} 
                  strokeLinecap="round" />
                {/* Late Arc */}
                <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" strokeDashoffset={`${251.2 * (1 - (presentTodayCount) / totalEmployees)}`} 
                  className="opacity-40" />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-bold text-white font-mono">{Math.round((presentTodayCount / totalEmployees) * 100)}%</span>
                <p className="text-[9px] text-white/45 uppercase tracking-wider">Có mặt</p>
              </div>
            </div>

            {/* Explanations */}
            <div className="space-y-2 shrink-0">
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-white/80">Đúng giờ: {presentTodayCount - lateTodayCount}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <span className="text-white/80">Đi muộn: {lateTodayCount}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-white/80">Nghỉ phép: {onLeaveEmployees}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-white/80">Vắng: {totalEmployees - presentTodayCount - onLeaveEmployees}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-center">
            <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer" onClick={() => setActiveTab("attendance")}>
              Quản lý chấm công kỹ lưỡng &rarr;
            </span>
          </div>
        </div>

        {/* Live System Log & Activity Feed */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Hoạt động thời gian thực</h3>
            <p className="text-xs text-white/45">Cập nhật thay đổi hồ sơ nhân sự tự động</p>
          </div>

          <div className="space-y-2.5 my-5 h-56 overflow-y-auto pr-1">
            {[
              { text: "Đã duyệt đơn xin nghỉ phép của Đặng Quốc Hùng", time: "Hôm qua", type: "leave", icon: Calendar, iconBg: "bg-emerald-500/10 text-emerald-400" },
              { text: "Ứng viên Bùi Vĩnh Cát (UI/UX) đạt 92 điểm phỏng vấn", time: "18-05-2026", type: "candidate", icon: Network, iconBg: "bg-violet-500/10 text-violet-400" },
              { text: "Hồ sơ mới Ngô Thị Bích Vân được thêm vào hệ thống", time: "10-05-2026", type: "employee", icon: Users, iconBg: "bg-blue-500/10 text-blue-400" },
              { text: "Trần Thị Thu Hà cập nhật thông tin Hợp đồng lao động", time: "05-05-2026", type: "contract", icon: AlertCircle, iconBg: "bg-amber-500/10 text-amber-400" }
            ].map((act, id) => {
              const ActIcon = act.icon;
              return (
                <div key={id} className="flex items-start space-x-3 p-2.5 rounded-xl bg-white/3 border border-white/5">
                  <div className={`p-1.5 rounded-lg shrink-0 ${act.iconBg}`}>
                    <ActIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-sans text-xs flex-1">
                    <p className="text-white/90 font-medium leading-relaxed">{act.text}</p>
                    <span className="text-[10px] text-white/40 font-mono mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1.5 text-center">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Dữ liệu đồng bộ lúc: 20-05-2026 10:41</div>
          </div>
        </div>

      </div>
    </div>
  );
}
