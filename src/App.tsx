/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Mail, Phone, Shield, Check } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees";
import TimeAttendance from "./components/TimeAttendance";
import LeaveManagement from "./components/LeaveManagement";
import Tasks from "./components/Tasks";
import Recruitment from "./components/Recruitment";
import Contracts from "./components/Contracts";
import Payroll from "./components/Payroll";
import Login from "./components/Login";
import { 
  initialEmployees, 
  initialAttendance, 
  initialLeaveRequests, 
  initialTasks, 
  initialCandidates,
  initialContracts,
  initialPayroll
} from "./mockData";
import { Employee, Attendance, LeaveRequest, HRMTask, Candidate, Contract, Payroll as PayrollType } from "./types";

const getInitials = (name: string): string => {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const prev = parts[parts.length - 2];
    if (prev && last) {
      return (prev[0] + last[0]).toUpperCase();
    }
  }
  return name.slice(0, 2).toUpperCase();
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("hrm_prefix_is_logged_in") === "true";
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  
  // App-level Shared State
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [tasks, setTasks] = useState<HRMTask[]>(initialTasks);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [payroll, setPayroll] = useState<PayrollType[]>(initialPayroll);

  // Active Admin Session State
  const [currentAdminId, setCurrentAdminId] = useState(() => {
    return sessionStorage.getItem("hrm_prefix_admin_id") || "emp04"; // Default: Phạm Thị Lan Anh
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLoginSuccess = (adminId: string) => {
    setCurrentAdminId(adminId);
    setIsLoggedIn(true);
    sessionStorage.setItem("hrm_prefix_is_logged_in", "true");
    sessionStorage.setItem("hrm_prefix_admin_id", adminId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("hrm_prefix_is_logged_in");
    sessionStorage.removeItem("hrm_prefix_admin_id");
  };

  const currentAdmin = employees.find(e => e.id === currentAdminId) || employees[0];

  const handleUpdateAdminProfile = (updatedFields: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === currentAdminId) {
        return { ...emp, ...updatedFields };
      }
      return emp;
    }));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            employees={employees} 
            attendance={attendance} 
            leaveRequests={leaveRequests} 
            candidates={candidates}
            setActiveTab={setActiveTab}
            currentAdmin={currentAdmin}
            onProfileClick={() => setIsProfileModalOpen(true)}
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
      default:
        return (
          <div className="text-center text-slate-400 py-20 font-medium">
            Tính năng đang phát triển...
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return <Login employees={employees} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0F1115] to-[#0A0B10] font-sans antialiased text-[#F8FAFC] overflow-hidden relative">
      {/* Absolute high-tech glowing backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6366F1]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A855F7]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        currentAdmin={currentAdmin}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Hub */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10 px-6 sm:px-8 py-6 select-text">
        <div className="max-w-7xl w-full mx-auto pb-12">
          {renderActiveTab()}
        </div>
      </main>

      {/* Dynamic Profile Admin Editor Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950/95 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-white tracking-tight">Hồ sơ quản trị viên (HRM)</h2>
                    <p className="text-[10px] text-white/50">Cập nhật thông tin nhận dạng & tài khoản quản lý</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Visual Avatar Card showing instant feedback */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/30 to-violet-950/30 border border-violet-500/10 flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-xl tracking-wider ring-4 ring-indigo-500/20 shrink-0">
                    {getInitials(currentAdmin.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">{currentAdmin.name || "Chưa nhập tên"}</h3>
                    <p className="text-xs text-violet-400 font-mono mt-0.5">{currentAdmin.position || "HR Manager"}</p>
                    <p className="text-[10px] text-white/30 lowercase truncate mt-0.5">{currentAdmin.email || ""}</p>
                  </div>
                  <div className="shrink-0 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-400 font-mono">ACTIVE STATUS</span>
                  </div>
                </div>

                {/* Direct Editing Fields */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-white/40">Chỉnh sửa thông tin</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Họ và Tên</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={currentAdmin.name}
                          onChange={(e) => handleUpdateAdminProfile({ name: e.target.value })}
                          placeholder="Nhập họ và tên..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500 focus:outline-none rounded-lg text-white text-xs pl-9 pr-3 py-2 animate-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Chức vụ / Vị trí</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={currentAdmin.position}
                          onChange={(e) => handleUpdateAdminProfile({ position: e.target.value })}
                          placeholder="Vị trí ví dụ: HRM Director..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500 focus:outline-none rounded-lg text-white text-xs pl-9 pr-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={currentAdmin.phone}
                          onChange={(e) => handleUpdateAdminProfile({ phone: e.target.value })}
                          placeholder="Số điện thoại liên lạc..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500 focus:outline-none rounded-lg text-white text-xs pl-9 pr-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={currentAdmin.email || ""}
                          onChange={(e) => handleUpdateAdminProfile({ email: e.target.value })}
                          placeholder="Địa chỉ email kết nối..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500 focus:outline-none rounded-lg text-white text-xs pl-9 pr-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Account Switch */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-white/40">Chuyển đổi vai trò quản trị (Impersonate)</h4>
                    <span className="text-[9px] font-mono text-slate-500">Đồng bộ toàn bộ thuộc tính nhân viên</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {employees.map((emp) => {
                      const isSelected = emp.id === currentAdminId;
                      return (
                        <button
                          key={emp.id}
                          onClick={() => {
                            setCurrentAdminId(emp.id);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-violet-600/10 border-violet-500 text-white shadow-md shadow-violet-950/20" 
                              : "bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-white/10"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold truncate leading-tight">{emp.name}</p>
                            <p className="text-[9px] truncate text-slate-400/50 font-mono mt-0.5">{emp.position} • {emp.department}</p>
                          </div>
                          {isSelected && (
                            <div className="p-0.5 bg-violet-500 rounded-full text-white shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-slate-950 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-lg"
                >
                  Hoàn tất và đồng bộ dữ liệu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
