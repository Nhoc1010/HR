/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, KeyRound } from "lucide-react";
import { Employee } from "../types";
import hrmLogo from "../assets/images/hrm_logo_nodg_1779263978276.png";

interface LoginProps {
  employees: Employee[];
  onLoginSuccess: (adminId: string) => void;
}

export default function Login({ employees, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter key admins (e.g. HR, Lead, Manager) for the Fast Access panel
  const hrStaff = employees.filter(e => 
    e.position.toLowerCase().includes("trưởng") || 
    e.position.toLowerCase().includes("giám đốc") || 
    e.position.toLowerCase().includes("lead") ||
    e.id === "emp04"
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    setIsLoading(true);

    // Simulate elite secure pipeline
    setTimeout(() => {
      // Direct Master Account Bypass
      if (trimmedEmail === "admin@hrm.pro" && trimmedPass === "admin123") {
        setIsLoading(false);
        onLoginSuccess("emp04"); // Default to Pham Thi Lan Anh
        return;
      }

      // Check if matches an existing employee's email
      const match = employees.find(emp => emp.email?.toLowerCase() === trimmedEmail);
      if (match) {
        if (trimmedPass === "admin123" || trimmedPass === "password" || trimmedPass === match.code) {
          setIsLoading(false);
          onLoginSuccess(match.id);
          return;
        } else {
          setIsLoading(false);
          setError("Mật khẩu không chính xác cho vị trí này! (Gợi ý thử: admin123)");
        }
      } else {
        setIsLoading(false);
        setError("Tài khoản email này không tồn tại trong hệ thống nhân sự!");
      }
    }, 850);
  };

  const handleQuickLogin = (emp: Employee) => {
    setEmail(emp.email || `${emp.code.toLowerCase()}@hrm.pro`);
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#07080B] flex items-center justify-center p-4 relative overflow-hidden select-text">
      {/* Immersive glow background vectors */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl relative z-10"
      >
        {/* Left Side: Cybernetic Portal Intro Banner */}
        <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-indigo-950/30 via-slate-950 to-slate-950">
          <div className="absolute inset-0 bg-violet-500/5 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Branding Logo Pair */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 p-0.5 flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-500/15">
                <img 
                  src={hrmLogo} 
                  alt="HRM Pro" 
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-bold block">Enterprise Suite</span>
                <h1 className="text-xl font-display font-black text-white tracking-tight -mt-0.5">
                  HRM <span className="text-violet-400">Pro</span>
                </h1>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-bold text-slate-100 tracking-wide">
                Hệ Thống Quản Trị Nhân Sự Tổng Thể v3.0
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đăng nhập để vào bảng điều khiển nhân lực nâng cao. Quản lý hồ sơ, hợp đồng, bảng lương trực quan và theo dõi thông tin chấm công công việc thời gian thực.
              </p>
            </div>
          </div>

          <div className="mt-8 md:mt-0 pt-8 border-t border-white/5 relative z-10">
            {/* System Specs Footer widget */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Hệ thống an toàn (SSO v3.0)</span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono">Chạy phiên bản chính thức thiết kế bởi ANH.P</p>
          </div>
        </div>

        {/* Right Side: Ultimate Interactive Credential Entry Card */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-violet-400 text-xs font-mono uppercase tracking-wider font-bold mb-1">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>Cổng Xác Thực An Toàn</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Chào mừng quay trở lại</h2>
              <p className="text-xs text-slate-400 mt-1">Xin vui lòng điền email đăng nhập và mật khẩu liên quan.</p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">
                  Tài khoản Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ví dụ: admin@hrm.pro hoặc nhân viên"
                    className="w-full bg-slate-900/50 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white rounded-xl text-xs pl-10 pr-4 py-3 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">
                    Mật khẩu bảo mật
                  </label>
                  <span className="text-[9px] text-slate-500 pointer-events-none">Mặc định: admin123</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mã bí mật 8 ký tự..."
                    className="w-full bg-slate-900/50 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white rounded-xl text-xs pl-10 pr-10 py-3 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error messages if any */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Secure Login Trigger Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-505 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/45 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang mã hóa & xác thực...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Đăng nhập hệ thống</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick SSO Access Panel for Demonstration Testing */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] font-mono">
              Trải nghiệm nhanh (Danh tính Quản trị viên)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@hrm.pro");
                  setPassword("admin123");
                  setError(null);
                }}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 text-left transition text-slate-300"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white">Quản trị viên chính</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">admin@hrm.pro</div>
                </div>
                <div className="text-[10px] px-1.5 py-0.5 bg-violet-600/15 border border-violet-500/25 rounded text-violet-400 font-bold font-mono">Master</div>
              </button>

              {hrStaff.slice(0, 3).map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleQuickLogin(emp)}
                  className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 text-left transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-550/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                    {emp.name.split(" ").pop()?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-white truncate leading-snug">{emp.name}</div>
                    <div className="text-[9px] text-slate-500 truncate mt-0.5">{emp.position}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
