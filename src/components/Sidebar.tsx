/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Gauge, 
  Users, 
  Clock, 
  Calendar, 
  Briefcase, 
  Network, 
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard
} from "lucide-react";

import { Employee } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  currentAdmin?: Employee;
  onProfileClick?: () => void;
}

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

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, currentAdmin, onProfileClick }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Tổng quan HRM", icon: Gauge },
    { id: "employees", label: "Nhân viên", icon: Users },
    { id: "attendance", label: "Chấm công", icon: Clock },
    { id: "leaves", label: "Nghỉ phép", icon: Calendar },
    { id: "contracts", label: "Hợp đồng", icon: FileText },
    { id: "payroll", label: "Tính lương", icon: CreditCard },
    { id: "tasks", label: "Công việc", icon: Briefcase },
    { id: "recruitment", label: "Funnel Flow", icon: Network },
  ];

  return (
    <motion.div 
      animate={{ width: collapsed ? "80px" : "260px" }}
      className="h-screen glass-panel border-r border-white/5 flex flex-col justify-between py-6 transition-all duration-300 select-none relative z-20"
    >
      <div>
        {/* Header Branding */}
        <div className="px-5 mb-8 flex items-center justify-between">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-xl text-white">H</span>
              </div>
              <div>
                <h1 className="text-base font-display font-bold text-white tracking-tight flex items-baseline">
                  HRM <span className="text-violet-400 ml-1">Pro</span>
                </h1>
                <p className="text-[10px] text-white/40 font-mono">Quản lý nhân sự v2.1</p>
              </div>
            </motion.div>
          )}

          {collapsed && (
            <div className="mx-auto w-10 h-10 rounded-xl ai-gradient flex items-center justify-center">
              <span className="font-bold text-xl text-white">H</span>
            </div>
          )}

          {/* Toggle Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-14 -right-3 w-6 h-6 rounded-full bg-slate-900 border border-white/10 hover:border-violet-500/50 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer hover:scale-105 transition-all"
            id="sidebar-toggle-btn"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5 px-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`sidebar-menu-${item.id}`}
                className={`w-full flex items-center rounded-xl p-3.5 text-sm font-medium transition-all relative overflow-hidden group cursor-pointer sidebar-item ${
                  isActive 
                    ? "bg-white/5 border-r-3 border-violet-500 text-white" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Visual Glow */}
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-violet-600/5 pointer-events-none rounded-xl"
                  />
                )}

                <IconComponent className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${collapsed ? "mx-auto" : "mr-3"} ${
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                }`} />

                {!collapsed && (
                  <span className="relative z-10 flex-1 text-left tracking-wide">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status indicator and Profile Profile footer */}
      <div className="px-3 space-y-4">
        {!collapsed && (
          <div className="p-4 mx-1 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="status-dot bg-emerald-500 glow-blue animate-pulse" />
              <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Trạng thái Hệ thống</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-bold font-mono">ONLINE // UPDATE - V 2.1 A.P</p>
          </div>
        )}

        <div 
          onClick={onProfileClick}
          className={`p-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/5 hover:border-violet-500/20 flex items-center cursor-pointer transition-all ${collapsed ? "justify-center" : "space-x-3"}`}
          title="Nhấp để thay đổi danh tính quản trị viên"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-display font-medium text-white text-xs ring-2 ring-indigo-500/20 transition-all">
              {currentAdmin ? getInitials(currentAdmin.name) : "LA"}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-xs font-semibold text-white truncate">{currentAdmin?.name || "Phạm Thị Lan Anh"}</h2>
              <p className="text-[10px] text-white/40 truncate">{currentAdmin?.position || "Giám đốc nhân sự (HRM)"}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
