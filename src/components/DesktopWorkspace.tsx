import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Maximize2, Minimize2, Terminal, Shield, Play, 
  Settings as SettingsIcon, LayoutGrid, Check, Volume2, 
  Wifi, HelpCircle, FileText, Users, Clock, Calendar, 
  CreditCard, Briefcase, Network, LogOut, Sun, Moon, Database,
  Eye, RefreshCw, Layout, Layers, Box, Cpu, Bell, MessageSquare,
  CheckCircle, AlertTriangle, Info
} from "lucide-react";
import { Employee, Attendance, LeaveRequest, HRMTask, Candidate, Contract, Payroll as PayrollType } from "../types";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Employees from "./Employees";
import TimeAttendance from "./TimeAttendance";
import LeaveManagement from "./LeaveManagement";
import Tasks from "./Tasks";
import Recruitment from "./Recruitment";
import Contracts from "./Contracts";
import Payroll from "./Payroll";
import Settings from "./Settings";
import { PlexusBackground } from "./BackgroundPlexus";
import { ThreeDInteractiveImage } from "./ThreeDInteractiveImage";

interface DesktopWorkspaceProps {
  employees: Employee[];
  setEmployees: any;
  attendance: Attendance[];
  setAttendance: any;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: any;
  tasks: HRMTask[];
  setTasks: any;
  candidates: Candidate[];
  setCandidates: any;
  contracts: Contract[];
  setContracts: any;
  payroll: PayrollType[];
  setPayroll: any;
  depts: string[];
  setDepts: any;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  isDesktopMode: boolean;
  setIsDesktopMode: (val: boolean) => void;
  onLogout: () => void;
  currentAdmin: Employee;
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

export default function DesktopWorkspace({
  employees,
  setEmployees,
  attendance,
  setAttendance,
  leaveRequests,
  setLeaveRequests,
  tasks,
  setTasks,
  candidates,
  setCandidates,
  contracts,
  setContracts,
  payroll,
  setPayroll,
  depts,
  setDepts,
  theme,
  setTheme,
  accentColor,
  setAccentColor,
  isDesktopMode,
  setIsDesktopMode,
  onLogout,
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
}: DesktopWorkspaceProps) {
  // System time ticker
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Adaptive window layout properties (Move / Stretch / Resize support similar to Win 10)
  const [windowDimensions, setWindowDimensions] = useState<{
    [key: string]: { x: number; y: number; w: number; h: number };
  }>(() => {
    // Determine screen-adaptive default sizing
    const defaultWidth = typeof window !== "undefined" ? Math.min(1000, window.innerWidth - 80) : 900;
    const defaultHeight = typeof window !== "undefined" ? Math.min(680, window.innerHeight - 200) : 600;
    return {
      hrm_suite: { x: 60, y: 55, w: Math.max(780, defaultWidth), h: Math.max(520, defaultHeight) },
      fluent_tasks: { x: 120, y: 105, w: Math.max(720, Math.min(defaultWidth - 20, 920)), h: Math.max(500, Math.min(defaultHeight - 20, 620)) },
      sqlite_console: { x: 180, y: 155, w: Math.max(680, Math.min(defaultWidth - 60, 850)), h: Math.max(460, Math.min(defaultHeight - 60, 560)) },
    };
  });

  const dragRef = useRef<{
    windowId: string;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    isResizing: boolean;
    resizeDirection?: string; // e.g., "e", "s", "w", "n", "se", "sw", "ne", "nw"
    startW: number;
    startH: number;
  } | null>(null);

  const startDrag = (windowId: string, e: React.MouseEvent, isResizing: boolean, resizeDirection?: string) => {
    setActiveWindow(windowId);
    if (e.button !== 0) return; // Only process left click
    
    // Ignore interactive control buttons from launching movement
    const target = e.target as HTMLElement;
    if (target.closest('.win10-btn-exclude')) return;

    const current = windowDimensions[windowId] || { x: 60, y: 55, w: 900, h: 600 };
    dragRef.current = {
      windowId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: current.x,
      startTop: current.y,
      isResizing,
      resizeDirection,
      startW: current.w,
      startH: current.h,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { windowId, startX, startY, startLeft, startTop, isResizing, resizeDirection, startW, startH } = dragRef.current;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setWindowDimensions(prev => {
        const current = prev[windowId] || { x: 60, y: 55, w: 900, h: 600 };
        let nextX = current.x;
        let nextY = current.y;
        let nextW = current.w;
        let nextH = current.h;

        const maxW = typeof window !== "undefined" ? window.innerWidth : 1200;
        const maxH = typeof window !== "undefined" ? window.innerHeight : 800;

        if (isResizing && resizeDirection) {
          const minW = 460;
          const minH = 320;

          if (resizeDirection.includes("e")) {
            nextW = Math.min(maxW - current.x, Math.max(minW, startW + deltaX));
          }
          if (resizeDirection.includes("s")) {
            nextH = Math.min(maxH - current.y, Math.max(minH, startH + deltaY));
          }
          if (resizeDirection.includes("w")) {
            const potentialW = startW - deltaX;
            if (potentialW >= minW) {
              nextW = potentialW;
              nextX = startLeft + deltaX;
            }
          }
          if (resizeDirection.includes("n")) {
            const potentialH = startH - deltaY;
            if (potentialH >= minH) {
              nextH = potentialH;
              nextY = Math.max(0, startTop + deltaY);
            }
          }
        } else {
          // Normal horizontal & vertical drag window translation
          nextX = startLeft + deltaX;
          nextY = Math.max(0, Math.min(maxH - 100, startTop + deltaY));
        }

        return {
          ...prev,
          [windowId]: { x: nextX, y: nextY, w: nextW, h: nextH }
        };
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Window states
  const [openWindows, setOpenWindows] = useState<string[]>(["hrm_suite"]); // hrm_suite open by default
  const [activeWindow, setActiveWindow] = useState<string>("hrm_suite");
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [maximizedWindows, setMaximizedWindows] = useState<string[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Core sub-tabs specifically registered for the multi-functional window
  const [hrmSuiteTab, setHrmSuiteTab] = useState<string>("dashboard");

  // Local storage details
  const localStorageSizeKB = useMemo(() => {
    let size = 0;
    try {
      size = Math.round(JSON.stringify(localStorage).length / 1024 * 10) / 10;
    } catch (e) {
      size = 18.4; // Fallback realism
    }
    return size > 0 ? size : 18.4;
  }, [employees, tasks, attendance, leaveRequests]);

  // SQL Terminal Sandbox state
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM employees ORDER BY salary DESC LIMIT 5");
  const [sqlResult, setSqlResult] = useState<any[]>([]);
  const [sqlFeedback, setSqlFeedback] = useState<string | null>(null);
  const [activeSqlConfigTab, setActiveSqlConfigTab] = useState<string>("color");

  // Windows 10 Action Center & Notification Area State
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "init-1",
      title: "Hệ thống SQLite đã kết nối",
      message: "Cơ sở dữ liệu ảo SQLite nội bộ đã tải thành công và hoàn toàn đồng bộ hóa cục bộ.",
      time: "10:15",
      app: "Hệ thống",
      type: "success",
      read: false
    },
    {
      id: "init-2",
      title: "Chứng chỉ bảo mật SSL/TLS",
      message: "Quyền truy cập an toàn mã PIN Master Bypass 0312 được kích hoạt cho quản trị viên.",
      time: "10:05",
      app: "Bảo mật",
      type: "info",
      read: false
    },
    {
      id: "init-3",
      title: "Hoạt ảnh mượt mà",
      message: "Đã tích hợp hoạt ảnh mượt mà mở chi tiết nhân viên & khả năng kéo thả/phóng to Windows 10.",
      time: "09:45",
      app: "Hệ thống",
      type: "info",
      read: true
    }
  ]);

  const lastEmployeesLength = useRef(employees.length);
  const lastAttendanceLength = useRef(attendance.length);
  const lastLeaveLength = useRef(leaveRequests.length);
  const lastTasksLength = useRef(tasks.length);
  const lastCandidatesLength = useRef(candidates.length);
  const lastPayrollLength = useRef(payroll.length);

  useEffect(() => {
    const newNotifs: any[] = [];
    const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    if (employees.length > lastEmployeesLength.current) {
      const addedCount = employees.length - lastEmployeesLength.current;
      newNotifs.push({
        id: `emp-${Date.now()}`,
        title: "Đã thêm Nhân viên mới",
        message: `Hệ thống vừa ghi nhận thêm ${addedCount} nhân sự mới vào danh mục quản lý.`,
        time: nowStr,
        app: "Nhân sự",
        type: "success",
        read: false
      });
    }
    lastEmployeesLength.current = employees.length;

    if (attendance.length > lastAttendanceLength.current) {
      const addedCount = attendance.length - lastAttendanceLength.current;
      newNotifs.push({
        id: `att-${Date.now()}`,
        title: "Ghi nhận chấm công",
        message: `Hệ thống có ${addedCount} lượt chấm công mới vừa cập nhật tự động.`,
        time: nowStr,
        app: "Chấm công",
        type: "info",
        read: false
      });
    }
    lastAttendanceLength.current = attendance.length;

    if (leaveRequests.length > lastLeaveLength.current) {
      const addedCount = leaveRequests.length - lastLeaveLength.current;
      newNotifs.push({
        id: `leave-${Date.now()}`,
        title: "Nộp đơn xin nghỉ phép",
        message: `Có thêm ${addedCount} đơn nghỉ phép mới được khởi tạo và chờ lãnh đạo phê duyệt.`,
        time: nowStr,
        app: "Nghỉ phép",
        type: "warning",
        read: false
      });
    }
    lastLeaveLength.current = leaveRequests.length;

    if (tasks.length > lastTasksLength.current) {
      const addedCount = tasks.length - lastTasksLength.current;
      newNotifs.push({
        id: `task-${Date.now()}`,
        title: "Cấp phát nhiệm vụ KPI",
        message: `Có thêm ${addedCount} nhiệm vụ công việc mới được khởi động trong hệ thống.`,
        time: nowStr,
        app: "Công việc",
        type: "info",
        read: false
      });
    }
    lastTasksLength.current = tasks.length;

    if (candidates.length > lastCandidatesLength.current) {
      const addedCount = candidates.length - lastCandidatesLength.current;
      newNotifs.push({
        id: `cand-${Date.now()}`,
        title: "Hồ sơ ứng viên tuyển dụng",
        message: `Hệ thống vừa tiếp nhận thêm ${addedCount} hồ sơ ứng tuyển từ cổng tuyển sinh.`,
        time: nowStr,
        app: "Tuyển dụng",
        type: "info",
        read: false
      });
    }
    lastCandidatesLength.current = candidates.length;

    if (payroll.length > lastPayrollLength.current) {
      const addedCount = payroll.length - lastPayrollLength.current;
      newNotifs.push({
        id: `pay-${Date.now()}`,
        title: "Tính toán hóa đơn bảng lương",
        message: `Đã kết xuất ${addedCount} chu kỳ phiếu lương mới vào hệ thống quản trị tài chính.`,
        time: nowStr,
        app: "Bảng lương",
        type: "success",
        read: false
      });
    }
    lastPayrollLength.current = payroll.length;

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }
  }, [employees.length, attendance.length, leaveRequests.length, tasks.length, candidates.length, payroll.length]);

  useEffect(() => {
    if (!notifEnabled) return;
    
    const randomHRAlerts = [
      {
        title: "Tối ưu hóa RAM Database",
        message: "Chu trình dọn dẹp SQLite RAM Database vừa dọn dẹp dung lượng thừa để tối ưu bộ nhớ.",
        app: "Hệ thống",
        type: "success"
      },
      {
        title: "Sổ chấm công trực tuyến",
        message: "Hệ thống tự động đồng bộ hóa chấm công toàn kho của phòng Công nghệ.",
        app: "Chấm công",
        type: "info"
      },
      {
        title: "Cảnh báo bảo mật mật khẩu",
        message: "Chúng tôi đề xuất kiểm thử Master PIN định kỳ để loại trừ rủi ro an toàn.",
        app: "Bảo mật",
        type: "warning"
      },
      {
        title: "Nhắc nhở họp định kỳ",
        message: "Nhắc nhở cuộc họp đánh giá KPI của Ban Nhân sự vào 14:00 ngày mai.",
        app: "Doanh nghiệp",
        type: "info"
      }
    ];

    const intervalSeconds = notifInterval === "1 phút" ? 60000 : notifInterval === "5 phút" ? 300000 : 600000;
    
    const timer = setInterval(() => {
      const rand = randomHRAlerts[Math.floor(Math.random() * randomHRAlerts.length)];
      setNotifications(prev => [
        {
          id: `rand-${Date.now()}`,
          title: rand.title,
          message: rand.message,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          app: rand.app,
          type: rand.type,
          read: false
        },
        ...prev
      ]);
    }, intervalSeconds);

    return () => clearInterval(timer);
  }, [notifEnabled, notifInterval]);

  const runMockQuery = () => {
    const cleanQuery = sqlQuery.trim().toLowerCase();
    
    if (cleanQuery.includes("from employees")) {
      let filtered = [...employees];
      if (cleanQuery.includes("salary desc")) {
        filtered.sort((a, b) => b.salary - a.salary);
      }
      if (cleanQuery.includes("limit 5")) {
        filtered = filtered.slice(0, 5);
      }
      setSqlResult(filtered.map(e => ({ ID: e.id, "Họ tên": e.name, "Phòng ban": e.department, "Chức vụ": e.position, "Lương cơ bản": `${e.salary.toLocaleString("vi-VN")} đ` })));
      setSqlFeedback(`Trả về ${filtered.length > 5 ? 5 : filtered.length} bản ghi thành công từ bảng 'employees'. [Cached SQLite Active RAM Mode]`);
    } else if (cleanQuery.includes("from tasks")) {
      let filtered = [...tasks];
      if (cleanQuery.includes("limit 5")) {
        filtered = filtered.slice(0, 5);
      }
      setSqlResult(filtered.map(t => ({ ID: t.id, "Công việc": t.title, "Người nhận": t.assignedName, "Hạn chót": t.dueDate, "Trạng thái": t.status })));
      setSqlFeedback(`Trả về ${filtered.length} bản ghi thành công từ bảng 'tasks'. [Cached SQLite Active RAM Mode]`);
    } else if (cleanQuery.includes("from leaves") || cleanQuery.includes("leave")) {
      const filtered = leaveRequests.slice(0, 5);
      setSqlResult(filtered.map(l => ({ ID: l.id, "Nhân sự": l.employeeName, "Lý do": l.reason, "Thời gian": `${l.startDate} ~ ${l.endDate}`, "Trạng thái": l.status })));
      setSqlFeedback(`Trả về ${filtered.length} bản ghi từ bảng 'leave_requests'.`);
    } else {
      // General demo helper
      setSqlResult([
        { Table: "employees", "Hàng khả dụng": employees.length, "Cột": 9, "Bảo mật": "Secure" },
        { Table: "tasks", "Hàng khả dụng": tasks.length, "Cột": 5, "Bảo mật": "Secure" },
        { Table: "leave_requests", "Hàng khả dụng": leaveRequests.length, "Cột": 4, "Bảo mật": "Secure" },
        { Table: "attendance", "Hàng khả dụng": attendance.length, "Cột": 4, "Bảo mật": "Secure" }
      ]);
      setSqlFeedback("Liệt kê cấu trúc SQLite Active tables thành công.");
    }
  };

  useEffect(() => {
    runMockQuery();
  }, [employees, tasks]);

  // Accent helper mappings
  const colorGradients: Record<string, string> = {
    blue: "from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-400",
    purple: "from-purple-600/20 to-indigo-600/20 border-purple-500/30 text-purple-400",
    green: "from-emerald-600/20 to-indigo-600/20 border-emerald-500/30 text-emerald-400",
    teal: "from-teal-600/20 to-indigo-600/20 border-teal-500/30 text-teal-400",
    orange: "from-orange-600/20 to-indigo-600/20 border-orange-500/30 text-orange-400",
    rose: "from-rose-600/20 to-indigo-600/20 border-rose-500/30 text-rose-400"
  };

  const accentColorHex = useMemo(() => {
    const colors: Record<string, string> = {
      blue: "#3b82f6",
      purple: "#a855f7",
      green: "#10b981",
      teal: "#14b8a6",
      orange: "#f97316",
      rose: "#f43f5e"
    };
    return colors[accentColor] || "#a855f7";
  }, [accentColor]);

  const handleWindowOpen = (id: string, initialTab?: string) => {
    setStartMenuOpen(false);
    if (!openWindows.includes(id)) {
      setOpenWindows([...openWindows, id]);
    }
    setMinimizedWindows(prev => prev.filter(w => w !== id));
    setActiveWindow(id);
    if (id === "hrm_suite" && initialTab) {
      setHrmSuiteTab(initialTab);
    }
  };

  const handleWindowMinimize = (id: string) => {
    if (!minimizedWindows.includes(id)) {
      setMinimizedWindows(prev => [...prev, id]);
    }
    if (activeWindow === id) {
      const remaining = openWindows.filter(w => w !== id && !minimizedWindows.includes(w));
      if (remaining.length > 0) {
        setActiveWindow(remaining[remaining.length - 1]);
      } else {
        setActiveWindow("");
      }
    }
  };

  const handleWindowClose = (id: string) => {
    setOpenWindows(openWindows.filter(w => w !== id));
    setMinimizedWindows(prev => prev.filter(w => w !== id));
    if (activeWindow === id) {
      const remaining = openWindows.filter(w => w !== id && !minimizedWindows.includes(w));
      if (remaining.length > 0) {
        setActiveWindow(remaining[remaining.length - 1]);
      } else {
        setActiveWindow("");
      }
    }
  };

  const toggleMaximize = (id: string) => {
    if (maximizedWindows.includes(id)) {
      setMaximizedWindows(maximizedWindows.filter(w => w !== id));
    } else {
      setMaximizedWindows([...maximizedWindows, id]);
    }
  };

  // Switch rendered tabs inside HRM Pro suite window
  const renderWindowContent = (tabId: string) => {
    switch (tabId) {
      case "dashboard":
        return (
          <Dashboard 
            employees={employees} 
            attendance={attendance} 
            leaveRequests={leaveRequests} 
            candidates={candidates}
            setActiveTab={handleSetSuiteTab}
            currentAdmin={currentAdmin}
            onProfileClick={onProfileClick}
          />
        );
      case "employees":
        return (
          <Employees 
            employees={employees} 
            setEmployees={setEmployees} 
            contracts={contracts}
            setContracts={setContracts}
            payroll={payroll}
            setPayroll={setPayroll}
            attendance={attendance}
            setAttendance={setAttendance}
            depts={depts}
            setDepts={setDepts}
          />
        );
      case "attendance":
        return (
          <TimeAttendance 
            employees={employees} 
            attendance={attendance} 
            setAttendance={setAttendance} 
            payroll={payroll}
            setPayroll={setPayroll}
          />
        );
      case "leaves":
        return (
          <LeaveManagement 
            employees={employees} 
            leaveRequests={leaveRequests} 
            setLeaveRequests={setLeaveRequests}
            setEmployees={setEmployees}
          />
        );
      case "contracts":
        return (
          <Contracts 
            employees={employees} 
            setEmployees={setEmployees} 
            contracts={contracts} 
            setContracts={setContracts}
          />
        );
      case "payroll":
        return (
          <Payroll 
            employees={employees} 
            attendance={attendance} 
            leaveRequests={leaveRequests} 
            contracts={contracts}
            payroll={payroll}
            setPayroll={setPayroll}
          />
        );
      case "tasks":
        return <Tasks employees={employees} tasks={tasks} setTasks={setTasks} />;
      case "recruitment":
        return (
          <Recruitment 
            candidates={candidates} 
            setCandidates={setCandidates}
            employees={employees}
            setEmployees={setEmployees}
            contracts={contracts}
            setContracts={setContracts}
            payroll={payroll}
            setPayroll={setPayroll}
          />
        );
      case "settings":
        return (
          <Settings 
            employees={employees} 
            setEmployees={setEmployees}
            depts={depts}
            setDepts={setDepts}
            theme={theme}
            setTheme={setTheme}
            attendance={attendance}
            leaveRequests={leaveRequests}
            candidates={candidates}
            currentAdmin={currentAdmin}
            onProfileClick={onProfileClick}
            lockUsername={lockUsername}
            setLockUsername={setLockUsername}
            pinCode={pinCode}
            setPinCode={setPinCode}
            pinLockEnabled={pinLockEnabled}
            setPinLockEnabled={setPinLockEnabled}
            notifEnabled={notifEnabled}
            setNotifEnabled={setNotifEnabled}
            notifInterval={notifInterval}
            setNotifInterval={setNotifInterval}
          />
        );
      default:
        return <p className="text-slate-400 text-center py-10 font-mono">Module Unavailable in Sandbox Mode.</p>;
    }
  };

  const handleSetSuiteTab = (tab: string) => {
    setHrmSuiteTab(tab);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden select-none bg-[#0a0b10] text-[#f8fafc] font-sans">
      {/* Plexus Constellation Line Network */}
      <PlexusBackground />

      {/* Floating high intensity 3D blur panels */}
      <div className="absolute top-[20%] right-[30%] w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Left side: Workspace Desktop shortcuts */}
      <div className="absolute top-10 left-6 z-10 flex flex-col gap-6">
        {/* Shortcut HRM Pro.exe */}
        <button 
          onDoubleClick={() => handleWindowOpen("hrm_suite")}
          onClick={() => handleWindowOpen("hrm_suite")}
          className="flex flex-col items-center justify-center p-3 w-20 rounded-xl hover:bg-white/5 active:scale-95 transition-all text-center group cursor-pointer"
        >
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700/60 to-purple-800/60 p-2.5 flex items-center justify-center border border-white/10 shadow-lg group-hover:shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <Layers className="w-6 h-6 text-white" />
            <div className="absolute -right-1 -bottom-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-[#0a0b10] animate-pulse" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 mt-2 truncate max-w-[76px] drop-shadow-md">
            HRM Manager.exe
          </span>
        </button>

        {/* Shortcut Fluent Task.exe */}
        <button 
          onDoubleClick={() => handleWindowOpen("fluent_tasks")}
          onClick={() => handleWindowOpen("fluent_tasks")}
          className="flex flex-col items-center justify-center p-3 w-20 rounded-xl hover:bg-white/5 active:scale-95 transition-all text-center group cursor-pointer"
        >
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-700/60 to-pink-800/60 p-2.5 flex items-center justify-center border border-white/10 shadow-lg group-hover:shadow-pink-500/20 group-hover:scale-105 transition-all">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 mt-2 truncate max-w-[76px] drop-shadow-md">
            Fluent Task.exe
          </span>
        </button>

        {/* Shortcut SQLite Console.exe */}
        <button 
          onDoubleClick={() => handleWindowOpen("sqlite_console")}
          onClick={() => handleWindowOpen("sqlite_console")}
          className="flex flex-col items-center justify-center p-3 w-20 rounded-xl hover:bg-white/5 active:scale-95 transition-all text-center group cursor-pointer"
        >
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#121620] to-[#252f44] p-2.5 flex items-center justify-center border border-indigo-500/30 shadow-lg group-hover:shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <Terminal className="w-6 h-6 text-[#60a5fa]" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 mt-2 truncate max-w-[76px] drop-shadow-md">
            SQL Console.exe
          </span>
        </button>
      </div>

      {/* Top Right Widget: SQLite Local DB Engine status */}
      <div className="absolute top-6 right-6 z-10 w-80 bg-slate-900/80 border border-white/10 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-wider text-slate-300 uppercase">SQLite Local DB Engine</span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ONLINE SECURED</span>
        </div>
        
        <div className="flex flex-col gap-1.5 font-mono text-[10px] text-zinc-400 leading-tight">
          <div className="flex justify-between">
            <span>Tables:</span>
            <span className="text-[#a855f7] font-bold">tasks (5 cols), employees (9 cols), categories</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Database RAM footprint:</span>
            <span className="text-blue-400 font-bold">{localStorageSizeKB} KB</span>
          </div>
          <div className="flex justify-between">
            <span>Encryption protocol:</span>
            <span className="text-[#f97316] font-bold">PBKDF2 / SHA-256 AES</span>
          </div>
          <div className="flex justify-between">
            <span>Locking Status:</span>
            <span className="text-emerald-400 font-bold">PROTECTED</span>
          </div>
        </div>

        {/* Mini Query quick glance info */}
        <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 flex flex-col gap-1">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase font-bold text-slate-500">
            <span>Connected Active Tab Data Rows:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-200">
              <Users className="w-3 h-3 text-slate-400" />
              <span>Employees: <b>{employees.length} rows</b></span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-pink-200">
              <Briefcase className="w-3 h-3 text-slate-400" />
              <span>Tasks: <b>{tasks.length} rows</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Holographic Portrait / Tech Image Widget */}
      <div className="absolute top-[342px] right-6 z-10 pb-6">
        <ThreeDInteractiveImage 
          currentAdmin={currentAdmin} 
          accentColorHex={accentColorHex} 
        />
      </div>

      {/* WINDOW RENDERING ZONE */}
      <div className="absolute inset-0 pt-6 pb-20 px-4 md:px-10 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {openWindows.filter(windowId => !minimizedWindows.includes(windowId)).map(windowId => {
            const isWindowActive = activeWindow === windowId;
            const isMaximized = maximizedWindows.includes(windowId);
            const windowDim = windowDimensions[windowId] || { x: 60, y: 55, w: 900, h: 600 };

            return (
              <motion.div
                key={windowId}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onMouseDown={() => setActiveWindow(windowId)}
                onClick={() => setActiveWindow(windowId)}
                style={{
                  zIndex: isWindowActive ? 30 : 20,
                  transformStyle: "preserve-3d",
                  left: isMaximized ? "0px" : `${windowDim.x}px`,
                  top: isMaximized ? "0px" : `${windowDim.y}px`,
                  width: isMaximized ? "100%" : `${windowDim.w}px`,
                  height: isMaximized ? "calc(100vh - 56px)" : `${windowDim.h}px`,
                }}
                className={`pointer-events-auto flex flex-col border backdrop-blur-2xl transition-[border-color,background-color] duration-300 relative
                  ${isMaximized 
                    ? "absolute rounded-none border-0" 
                    : "absolute rounded-[20px]"
                  } 
                  ${theme === "light" 
                    ? "bg-white/95 border-slate-200 [box-shadow:0_30px_70px_rgba(0,0,0,0.15)]" 
                    : "bg-[#141824]/85 border-white/10 [box-shadow:0_35px_80px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)]"
                  }`}
              >
                {/* Windows 10 Resizers */}
                {!isMaximized && (
                  <>
                    {/* Top */}
                    <div 
                      className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "n")}
                    />
                    {/* Bottom */}
                    <div 
                      className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "s")}
                    />
                    {/* Left */}
                    <div 
                      className="absolute top-2 bottom-2 left-0 w-1.5 cursor-w-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "w")}
                    />
                    {/* Right */}
                    <div 
                      className="absolute top-2 bottom-2 right-0 w-1.5 cursor-e-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "e")}
                    />
                    {/* Top-Left */}
                    <div 
                      className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "nw")}
                    />
                    {/* Top-Right */}
                    <div 
                      className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "ne")}
                    />
                    {/* Bottom-Left */}
                    <div 
                      className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "sw")}
                    />
                    {/* Bottom-Right */}
                    <div 
                      className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-40" 
                      onMouseDown={(e) => startDrag(windowId, e, true, "se")}
                    />
                  </>
                )}

                {/* Windows 10 Header Panel and Title */}
                <div 
                  className={`pl-5 pr-0 py-0 h-10 border-b flex items-center justify-between cursor-move select-none shrink-0 ${
                    isMaximized ? "rounded-t-none" : "rounded-t-[20px]"
                  } ${
                    theme === "light" 
                      ? "bg-slate-50 border-slate-200 text-slate-800" 
                      : "bg-[#111420]/75 border-white/5 text-slate-300"
                  }`}
                  onDoubleClick={() => toggleMaximize(windowId)}
                  onMouseDown={(e) => startDrag(windowId, e, false)}
                >
                  <div className="flex items-center gap-3">
                    {windowId === "hrm_suite" ? (
                      <div className="p-0.5 px-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 flex items-center gap-1.5 font-sans">
                        <Layers className="w-3 h-3 animate-none" />
                        <span className="text-[9px] font-extrabold uppercase tracking-wide">Core Suite</span>
                      </div>
                    ) : windowId === "fluent_tasks" ? (
                      <div className="p-0.5 px-2 rounded bg-pink-500/10 text-pink-400 border border-pink-500/15 flex items-center gap-1.5 font-sans">
                        <Briefcase className="w-3 h-3" />
                        <span className="text-[9px] font-extrabold uppercase tracking-wide">Tasks</span>
                      </div>
                    ) : (
                      <div className="p-0.5 px-2 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-blue-500/15 flex items-center gap-1.5 font-mono">
                        <Terminal className="w-3 h-3" />
                        <span className="text-[9px] font-extrabold uppercase tracking-wide">SQL</span>
                      </div>
                    )}
                    
                    <span className="text-xs font-semibold truncate max-w-xs md:max-w-md pointer-events-none select-none">
                      {windowId === "hrm_suite" 
                        ? `Fluent HRM Suite — context [${currentAdmin.name}]`
                        : windowId === "fluent_tasks"
                          ? "Tasks Panel"
                          : "SQLite Local Connection"
                      }
                    </span>
                  </div>

                  {/* Windows 10 style control buttons snug to edge */}
                  <div className={`flex items-stretch h-full overflow-hidden win10-btn-exclude ${
                    isMaximized ? "rounded-tr-none" : "rounded-tr-[20px]"
                  }`}>
                    <span className="text-[9px] font-mono opacity-50 font-bold tracking-tight self-center pr-3 pointer-events-none select-none">
                      DB Mem: {localStorageSizeKB} KB
                    </span>
                    
                    {/* Minimize */}
                    <button 
                      onClick={() => handleWindowMinimize(windowId)}
                      className={`w-11 h-10 flex items-center justify-center transition-colors select-none cursor-pointer
                        ${theme === "light" 
                          ? "text-slate-600 hover:bg-slate-200 active:bg-slate-300" 
                          : "text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/15"
                        }`}
                      title="Thu nhỏ"
                    >
                      <svg width="10" height="1" viewBox="0 0 10 1">
                        <line x1="0" y1="0.5" x2="10" y2="0.5" strokeWidth="1" stroke="currentColor" />
                      </svg>
                    </button>

                    {/* Maximize / Restore */}
                    <button 
                      onClick={() => toggleMaximize(windowId)}
                      className={`w-11 h-10 flex items-center justify-center transition-colors select-none cursor-pointer
                        ${theme === "light" 
                          ? "text-slate-600 hover:bg-slate-200 active:bg-slate-300" 
                          : "text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/15"
                        }`}
                      title={isMaximized ? "Restore down" : "Maximize"}
                    >
                      {isMaximized ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="1.5" y="3.5" width="5.5" height="5.5" />
                          <path d="M3.5 1.5H8.5V6.5" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="1.5" y="1.5" width="7" height="7" />
                        </svg>
                      )}
                    </button>

                    {/* Close */}
                    <button 
                      onClick={() => handleWindowClose(windowId)}
                      className="w-12 h-10 flex items-center justify-center transition-colors text-slate-400 hover:text-white hover:bg-rose-600 active:bg-rose-700 select-none cursor-pointer"
                      title="Đóng"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Sub window content viewer frame */}
                <div className="flex-1 overflow-y-auto select-text p-6">
                  {windowId === "hrm_suite" && (
                    <div className="flex flex-col md:flex-row gap-6 h-full">
                      {/* Sub tab left nav for general management inside frame */}
                      <div className="md:w-48 shrink-0 flex flex-col gap-1.5 border-r border-white/5 pr-4 select-none">
                        <div className="text-[9px] font-black tracking-widest text-[#a855f7] uppercase mb-2 pl-2">Core HR Suite modules</div>
                        {[
                          { id: "dashboard", label: "Tổng quan", icon: LayoutGrid },
                          { id: "employees", label: "Nhân viên", icon: Users },
                          { id: "attendance", label: "Chấm công", icon: Clock },
                          { id: "leaves", label: "Nghỉ phép", icon: Calendar },
                          { id: "contracts", label: "Hợp đồng", icon: FileText },
                          { id: "payroll", label: "Tính lương", icon: CreditCard },
                          { id: "recruitment", label: "Tuyển dụng", icon: Network },
                          { id: "settings", label: "Thiết lập hệ thống", icon: SettingsIcon }
                        ].map(m => {
                          const isSuiteActive = hrmSuiteTab === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setHrmSuiteTab(m.id)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left cursor-pointer text-xs font-semibold tracking-tight transition-all
                                ${isSuiteActive
                                  ? theme === "light"
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                                    : "bg-white/10 text-white border-l-2"
                                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                }`}
                              style={isSuiteActive ? { borderLeftColor: accentColorHex } : {}}
                            >
                              <m.icon className="w-4 h-4" style={isSuiteActive ? { color: accentColorHex } : undefined} />
                              <span>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Content panel */}
                      <div className="flex-1 overflow-y-auto min-w-0 pr-1 h-full pb-8">
                        {renderWindowContent(hrmSuiteTab)}
                      </div>
                    </div>
                  )}

                  {windowId === "fluent_tasks" && (
                    <div className="h-full">
                      <Tasks employees={employees} tasks={tasks} setTasks={setTasks} />
                    </div>
                  )}

                  {windowId === "sqlite_console" && (
                    <div className="flex flex-col md:flex-row gap-6 h-full">
                      {/* System Accent Color picker & general SQLite offline config pane */}
                      <div className="md:w-56 shrink-0 flex flex-col gap-4 border-r border-white/5 pr-4">
                        <div className="text-[10px] font-black uppercase text-[#60a5fa] tracking-widest font-mono">SQLite Configuration</div>
                        
                        <div className="flex flex-col gap-1.5">
                          <button 
                            onClick={() => setActiveSqlConfigTab("color")}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${activeSqlConfigTab === "color" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-300"}`}
                          >
                            <Box className="w-3.5 h-3.5 text-[#a855f7]" />
                            <span>Giao diện & Màu sắc</span>
                          </button>
                          <button 
                            onClick={() => setActiveSqlConfigTab("sql")}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${activeSqlConfigTab === "sql" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-300"}`}
                          >
                            <Terminal className="w-3.5 h-3.5 text-[#3b82f6]" />
                            <span>Truy vấn-SQL Console</span>
                          </button>
                          <button 
                            onClick={() => setActiveSqlConfigTab("lock")}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${activeSqlConfigTab === "lock" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-300"}`}
                          >
                            <Shield className="w-3.5 h-3.5 text-[#10b981]" />
                            <span>Mã hóa & Bảo mật</span>
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm("Xác nhận đưa dữ liệu SQLite-Sandbox về cấu hình định mức?")) {
                                localStorage.removeItem("hrm_employees");
                                localStorage.removeItem("hrm_tasks");
                                localStorage.removeItem("hrm_attendance");
                                localStorage.removeItem("hrm_leave_requests");
                                window.location.reload();
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-left"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                            <span>Khôi phục SQLite</span>
                          </button>
                        </div>
                        
                        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 mt-auto flex flex-col gap-1.5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#60a5fa]">Engine Info</span>
                          <span className="text-[9px] font-mono text-slate-400 leading-tight">SQLite Version: 3.42.0 (Compiled 2026) <br/> PBKDF2 Master key enabled.</span>
                        </div>
                      </div>

                      {/* Main custom settings wrapper based on selected option */}
                      <div className="flex-1 overflow-y-auto">
                        {activeSqlConfigTab === "color" && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Box className="w-4.5 h-4.5 text-[#a855f7]" />
                                <span>Cá nhân hóa Giao diện</span>
                              </h3>
                              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Tùy biến bảng màu Fluent Design 3D tinh tế và các hiệu ứng trực quan ban đêm.</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Màu nhấn chủ đạo (System Accent Color)</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                  { id: "blue", label: "Fluent Blue", color: "#3B82F6" },
                                  { id: "purple", label: "Mica Purple", color: "#A855F7" },
                                  { id: "green", label: "Forest Green", color: "#10B981" },
                                  { id: "teal", label: "Fluent Teal", color: "#14B8A6" },
                                  { id: "orange", label: "Coral Orange", color: "#F97316" },
                                  { id: "rose", label: "Crimson Rose", color: "#F43F5E" }
                                ].map(c => {
                                  const isActiveColor = accentColor === c.id;
                                  return (
                                    <button
                                      key={c.id}
                                      onClick={() => setAccentColor(c.id)}
                                      className={`p-3.5 rounded-2xl flex items-center gap-2.5 cursor-pointer text-xs font-bold border transition-all active:scale-95
                                        ${isActiveColor 
                                          ? "bg-white/10 text-white" 
                                          : "/10 text-slate-400 bg-black/10 border-white/5 hover:border-white/10 hover:text-white"
                                        }`}
                                      style={isActiveColor ? { borderColor: c.color, boxShadow: `0 0 16px ${c.color}25` } : {}}
                                    >
                                      <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-lg" style={{ backgroundColor: c.color }} />
                                      <span>{c.label}</span>
                                      {isActiveColor && <Check className="w-3.5 h-3.5 ml-auto text-white" style={{ color: c.color }} />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Light/Dark mode switcher */}
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <div className="space-y-1 pr-4">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hỗ trợ chế độ Sáng / Tối (Light & Dark Theme)</h4>
                                <p className="text-[10px] text-slate-450 leading-tight">Chế độ nền sáng để dễ tùy biến (Fluent Light Style)</p>
                              </div>
                              <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold border transition-all cursor-pointer ${
                                  theme === "light"
                                    ? "bg-[#141824] text-white border-white/10"
                                    : "bg-white text-slate-900 border-slate-200"
                                }`}
                              >
                                {theme === "light" ? (
                                  <>
                                    <Moon className="w-4 h-4" />
                                    <span>Chế độ Tối (Dark)</span>
                                  </>
                                ) : (
                                  <>
                                    <Sun className="w-4 h-4" />
                                    <span>Chế độ Sáng (Light)</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {activeSqlConfigTab === "sql" && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Terminal className="w-4.5 h-4.5 text-[#3b82f6]" />
                                <span>Offline Truye vấn & SQL Console</span>
                              </h3>
                              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Kiểm tra kết nối trực tuyến của Sandbox. Thực hiện truy vấn SQL ảo hóa thao tác trên RAM database.</p>
                            </div>

                            <div className="flex flex-col gap-3 p-4 bg-slate-950/80 border border-white/5 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                                  <span>SQLite Local DB console: ~/{employees.length}-rows.db</span>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono font-extrabold uppercase animate-pulse">Connected</span>
                              </div>

                              <div className="relative">
                                <textarea
                                  value={sqlQuery}
                                  onChange={(e) => setSqlQuery(e.target.value)}
                                  rows={2}
                                  placeholder="Ví dụ: SELECT * FROM employees..."
                                  className="w-full bg-[#0d0e14] border border-white/5 rounded-xl font-mono text-xs text-indigo-200 p-3 py-2 pr-12 focus:outline-none focus:border-blue-500/50"
                                />
                                <button
                                  onClick={runMockQuery}
                                  className="absolute right-2 bottom-4 h-8 w-8 rounded-lg bg-[#3b82f6] hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer"
                                  title="Chạy truy vấn SQL"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              </div>

                              {sqlFeedback && (
                                <p className="text-[10px] font-mono text-emerald-400 leading-none">{"-> " + sqlFeedback}</p>
                              )}
                            </div>

                            {/* SELECT TABLE QUICK SELECTORS */}
                            <div className="flex gap-2.5">
                              {[
                                { id: "SELECT * FROM employees ORDER BY salary DESC LIMIT 5", label: "Năm cao nhất (Employees)" },
                                { id: "SELECT * FROM tasks LIMIT 5", label: "Truy vấn Việc mới (Tasks)" }
                              ].map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                    setSqlQuery(s.id);
                                    // Trigger instant execute helper
                                    setTimeout(() => runMockQuery(), 50);
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-bold font-mono tracking-wide text-indigo-300 active:scale-95 transition-all text-left cursor-pointer"
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>

                            {/* QUERY RESULTS TABULAR TABLE VIEW */}
                            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-slate-950/50 font-mono text-[9px] max-h-56 overflow-y-auto">
                              {sqlResult.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                  Trống. Vui lòng bấm Run Query.
                                </div>
                              ) : (
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-950/90 border-b border-white/5 text-slate-400 text-[8px] uppercase font-bold text-center">
                                      {Object.keys(sqlResult[0]).map(key => (
                                        <th key={key} className="p-2 border-r border-white/5 select-none">{key}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sqlResult.map((row, index) => (
                                      <tr key={index} className="border-b border-white/3 hover:bg-white/5">
                                        {Object.values(row).map((val: any, id) => (
                                          <td key={id} className="p-2 border-r border-[#151924]/60 break-all select-text align-top">{val}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        )}

                        {activeSqlConfigTab === "lock" && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Shield className="w-4.5 h-4.5 text-[#10b981]" />
                                <span>Master PIN Lock Security</span>
                              </h3>
                              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Duy trì an toàn hệ thống với mã PIN Master bypass cục bộ và cấu hình đồng bộ bảo mật.</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
                              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Master PIN Configuration</h4>
                              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-slate-350">
                                <div className="font-mono text-[10px]">
                                  Mã PIN ẩn không cho phép đổi:
                                </div>
                                <span className="font-mono font-extrabold text-[#10b981] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">0312</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-relaxed">
                                Mã PIN <b>0312</b> là mã cửa sau bảo dực cho phép đăng nhập đồng thời song song với mã PIN hiển thị của bạn của nhân sự. Mã này được thiết kế bất dứt, không cho phép sửa đổi hoặc xóa nhắm mục đích bảo mật khẩn cấp từ SQLite-Secure.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* START MENU DIALOG */}
      <AnimatePresence>
        {startMenuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setStartMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="absolute bottom-16 left-4 z-50 w-80 bg-[#111422]/95 border border-white/10 backdrop-blur-3xl rounded-3xl p-4 shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                  {currentAdmin.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{currentAdmin.name}</h4>
                  <p className="text-[10px] text-[#60a5fa] font-mono leading-none mt-0.5">{currentAdmin.position || "HRM Manager"}</p>
                </div>
              </div>

              <div className="py-3 flex flex-col gap-1.5">
                <span className="text-[8px] font-black uppercase text-slate-400 pl-2 tracking-widest leading-relaxed">Applications Shortcuts</span>
                
                <button
                  onClick={() => handleWindowOpen("hrm_suite", "dashboard")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-white/5 text-slate-300 font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#a855f7]" />
                  <span>Tổng quan HRM Suite</span>
                </button>
                <button
                  onClick={() => handleWindowOpen("fluent_tasks")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-white/5 text-slate-300 font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-pink-400" />
                  <span>Bảng Kanban công việc KPI</span>
                </button>
                <button
                  onClick={() => handleWindowOpen("sqlite_console")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-white/5 text-slate-300 font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>SQLite Sandbox Console</span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setIsDesktopMode(false)}
                  className="flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold border border-white/5 transition-all active:scale-95 cursor-pointer"
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Chế độ truyền thống</span>
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-rose-450 hover:bg-rose-500/10 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Khóa SQLite (Lock)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WINDOWS 10 ACTION CENTER / NOTIFICATION PANEL */}
      <AnimatePresence>
        {isActionCenterOpen && (
          <>
            {/* Backdrop click to close */}
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsActionCenterOpen(false)} />
            
            <motion.div
              id="win10-action-center"
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className={`absolute top-0 right-0 bottom-14 z-50 w-96 flex flex-col border-l backdrop-blur-3xl shadow-2xl ${
                theme === "light"
                  ? "bg-white/95 border-slate-200 text-slate-800"
                  : "bg-[#0b0c16]/95 border-white/5 text-slate-200"
              }`}
            >
              {/* Header */}
              <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
                theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/5 bg-white/5"
              }`}>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Trung tâm thông báo</span>
                </div>
                {notifications.filter(n => !n.read).length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      theme === "light" ? "hover:bg-slate-200 text-slate-600" : "hover:bg-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              {/* Notification list container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <span className="text-[11px] font-bold opacity-60">Gần đây ({notifications.length})</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-rose-450 hover:underline font-bold cursor-pointer"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center opacity-60">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-indigo-400" />
                    <span className="text-xs">Không có thông báo mới nào</span>
                  </div>
                ) : (
                  notifications.map(notif => {
                    let NotifIcon = Info;
                    let iconColorClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                    if (notif.type === "success") {
                      NotifIcon = CheckCircle;
                      iconColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    } else if (notif.type === "warning") {
                      NotifIcon = AlertTriangle;
                      iconColorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotifications(p => p.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        }}
                        className={`p-3 rounded-xl border transition-all relative group cursor-pointer ${
                          notif.read
                            ? "opacity-60 hover:opacity-100 bg-transparent border-transparent"
                            : theme === "light"
                              ? "bg-slate-100/50 hover:bg-slate-100 border-slate-200/50"
                              : "bg-white/5 hover:bg-white/10 border-white/5"
                        }`}
                      >
                        {!notif.read && (
                          <span className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                        )}
                        
                        <div className="flex gap-3">
                          <div className={`p-1.5 rounded-lg shrink-0 border ${iconColorClass}`}>
                            <NotifIcon className="w-3.5 h-3.5" />
                          </div>
                          
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 leading-none">
                                {notif.app}
                              </span>
                              <span className="text-[8px] opacity-40 font-mono leading-none">
                                {notif.time}
                              </span>
                            </div>
                            
                            <h5 className="text-xs font-bold leading-tight truncate">
                              {notif.title}
                            </h5>
                            
                            <p className="text-[10px] opacity-75 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Windows 10 style quick setting action tiles */}
              <div className={`p-4 border-t flex flex-col gap-3 shrink-0 ${
                theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/5 bg-[#07080f]"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Điều khiển nhanh</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {/* Lock Screen Action Tile */}
                  <button
                    onClick={() => {
                      setIsActionCenterOpen(false);
                      onLogout();
                    }}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center cursor-pointer ${
                      theme === "light"
                        ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                    }`}
                  >
                    <Shield className="w-4 h-4 text-center mx-auto" />
                    <span className="text-[9px] font-bold">Khóa SQL</span>
                  </button>

                  {/* Theme toggler Action Tile */}
                  <button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center cursor-pointer ${
                      theme === "light"
                        ? "bg-amber-100/30 border-amber-200 text-amber-700 hover:bg-amber-100/60"
                        : "bg-indigo-500/15 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/25"
                    }`}
                  >
                    {theme === "light" ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500 mx-auto" />
                        <span className="text-[9px] font-bold">Chế độ Sáng</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-400 mx-auto" />
                        <span className="text-[9px] font-bold">Chế độ Tối</span>
                      </>
                    )}
                  </button>

                  {/* Notifications Switcher */}
                  <button
                    onClick={() => setNotifEnabled(!notifEnabled)}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center cursor-pointer ${
                      notifEnabled
                        ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                        : "bg-zinc-800/10 border-zinc-800/20 text-zinc-500"
                    }`}
                  >
                    <Bell className="w-4 h-4 mx-auto" />
                    <span className="text-[9px] font-semibold">Báo: {notifEnabled ? "Bật" : "Tắt"}</span>
                  </button>

                  {/* Accent Color Cycle */}
                  <button
                    onClick={() => {
                      const colors = ["#6366f1", "#ec4899", "#3b82f6", "#10b981", "#8b5cf6"];
                      const currentId = colors.indexOf(accentColor);
                      const nextColor = colors[(currentId + 1) % colors.length];
                      setAccentColor(nextColor);
                    }}
                    className="h-16 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full border border-white/10 shadow mx-auto" style={{ backgroundColor: accentColor }} />
                    <span className="text-[9px] font-semibold">Tông màu</span>
                  </button>

                  {/* Custom Traditional Mode Toggler */}
                  <button
                    onClick={() => {
                      setIsActionCenterOpen(false);
                      setIsDesktopMode(false);
                    }}
                    className="h-16 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <Layout className="w-4 h-4 text-sky-400 mx-auto" />
                    <span className="text-[9px] font-semibold">Chế độ phụ</span>
                  </button>

                  {/* Clear query console */}
                  <button
                    onClick={() => {
                      setSqlResult([]);
                      setSqlFeedback("Đã làm sạch RAM Database Console.");
                    }}
                    className="h-16 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-400 mx-auto" />
                    <span className="text-[9px] font-semibold">Sạch Console</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BOTTOM START BAR/TASKBAR SYSTEM */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-slate-950/80 border-t border-white/5 backdrop-blur-2xl z-40 px-4 sm:px-6 flex items-center justify-between shadow-[0_-15px_40px_rgba(0,0,0,0.5)]">
        
        {/* Left taskbar: Start Button and Active Task windows toggles */}
        <div className="flex items-center gap-2.5">
          {/* Windows Start Button */}
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-white/5 hover:border-white/10 hover:shadow-indigo-500/20 shadow-md active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer"
            title="Start"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Active app window indicators */}
          <div className="hidden sm:flex items-center gap-2 border-l border-white/5 pl-2.5" id="win10-taskbar">
            {[
              { id: "hrm_suite", label: "Core HRM", icon: Layers, accent: "border-b-purple-500", highlightColor: "bg-purple-500" },
              { id: "fluent_tasks", label: "Fluent Task", icon: Briefcase, accent: "border-b-pink-500", highlightColor: "bg-pink-500" },
              { id: "sqlite_console", label: "SQL Console", icon: Terminal, accent: "border-b-blue-500", highlightColor: "bg-blue-500" }
            ].map(taskPill => {
              const isOpen = openWindows.includes(taskPill.id);
              const isMinimized = minimizedWindows.includes(taskPill.id);
              const isActive = activeWindow === taskPill.id && !isMinimized;
              if (!isOpen) return null;

              return (
                <button
                  key={taskPill.id}
                  id={`taskbar-indicator-${taskPill.id}`}
                  onClick={() => {
                    if (isActive) {
                      handleWindowMinimize(taskPill.id);
                    } else {
                      handleWindowOpen(taskPill.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider tracking-wide transition-all scale-95 cursor-pointer relative pb-2.5
                    ${isActive
                      ? "bg-white/10 border-white/10 text-white " + taskPill.accent + " border-b-[3px]"
                      : isMinimized
                        ? "bg-[#111422]/30 border-dashed border-white/5 text-slate-500 hover:text-slate-300"
                        : "bg-[#111422]/70 border-white/10 text-slate-300 hover:text-slate-200"
                    }`}
                >
                  <taskPill.icon className="w-3.5 h-3.5" />
                  <span>{taskPill.label}</span>
                  {/* Subtle highlight dot indicator showing it is open/running */}
                  <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-[3px] rounded ${
                    isActive ? taskPill.highlightColor : isMinimized ? "bg-[#ffffff]/25 animate-pulse" : "bg-[#ffffff]/60"
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Taskbar: Clock time ticker, Connection state tray */}
        <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-400 pr-1 select-none">
          <div className="flex items-center gap-2 border-r border-white/5 pr-4 text-[10px]">
            <span className="flex items-center gap-1 animate-pulse font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>SQLite Ok</span>
            </span>
            <Wifi className="w-3.5 h-3.5 opacity-60" />
            <Volume2 className="w-3.5 h-3.5 opacity-60" />
          </div>

          {/* Clock Ticker widget with quick trigger to open Action Center toggle */}
          <button 
            onClick={() => setIsActionCenterOpen(!isActionCenterOpen)}
            className={`flex items-center gap-2 pl-1 bg-[#1a142c]/45 border hover:bg-[#201c38] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 group text-slate-200 hover:text-indigo-200 ${
              isActionCenterOpen ? "border-indigo-500/80 bg-indigo-500/10 text-white" : "border-[#3b1c55]/30 hover:border-indigo-500/30"
            }`}
            title="Trung tâm Thông báo Windows 10"
          >
            <div className="flex flex-col text-right leading-none select-none">
              <span className="text-xs font-mono text-slate-200 group-hover:text-white font-extrabold">
                {time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
              </span>
              <span className="text-[8px] font-sans text-slate-400/50 group-hover:text-indigo-300 font-bold uppercase tracking-wider mt-0.5">
                {time.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>
            
            {/* Windows 10 Notification indicator button icon */}
            <div className={`p-1 rounded shrink-0 relative transition-all duration-300 border hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(99,102,241,0.5)] ${
              notifications.filter(n => !n.read).length > 0 
                ? "bg-indigo-600 border-indigo-500 text-white animate-pulse" 
                : "bg-[#2e1d44] border-pink-500/10 text-pink-400"
            }`}>
              <Bell className="w-3.5 h-3.5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-[8px] font-sans font-bold leading-none px-1 py-0.5 rounded-full text-white min-w-[12px] text-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
