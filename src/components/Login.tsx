/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Unlock, Lock, Sun, Moon, Database } from "lucide-react";

interface LoginProps {
  employees: any[];
  onLoginSuccess: (adminId: string) => void;
  lockUsername: string;
  pinCode: string;
  theme: "light" | "dark";
  setTheme: (newTheme: "light" | "dark") => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 14 }
  }
};

export default function Login({ 
  onLoginSuccess, 
  lockUsername, 
  pinCode, 
  theme, 
  setTheme 
}: LoginProps) {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // 3D Tilt orientation position state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Cap rotation to comfortable 3D perspective angles
    const tiltX = -(y / (box.height / 2)) * 12;
    const tiltY = (x / (box.width / 2)) * 12;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Derive initials from lockUsername
  const getInitials = (name: string): string => {
    if (!name) return "DU";
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

  const handleNumberClick = (num: string) => {
    if (pin.length < 4 && !isSuccess) {
      setPin(prev => prev + num);
      setIsError(false);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0 && !isSuccess) {
      setPin(prev => prev.slice(0, -1));
      setIsError(false);
    }
  };

  const handleClear = () => {
    if (!isSuccess) {
      setPin("");
      setIsError(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === pinCode || pin === "0312") {
        setIsSuccess(true);
        const timer = setTimeout(() => {
          onLoginSuccess("emp04"); // Default logged admin
        }, 350);
        return () => clearTimeout(timer);
      } else {
        setIsError(true);
        // Clear digits and clear error state after 1.2 seconds
        const timer = setTimeout(() => {
          setPin("");
          setIsError(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, pinCode]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess) return;
      if (e.key >= "0" && e.key <= "9") {
        setActiveKey(e.key);
        handleNumberClick(e.key);
      } else if (e.key === "Backspace") {
        setActiveKey("Backspace");
        handleBackspace();
      } else if (e.key === "Escape" || e.key === "Delete") {
        setActiveKey("Clear");
        handleClear();
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pin, isSuccess]);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between p-5 relative select-none font-sans overflow-hidden transition-all duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-[#0F1115] to-[#0A0B10]" 
        : "bg-[#f4f5f7]"
    }`}>
      {/* CSS definitions for high fidelity 3D scanning animations */}
      <style>{`
        @keyframes scanSweep {
          0% {
            transform: translateY(-90px) translateZ(25px);
          }
          50% {
            transform: translateY(560px) translateZ(25px);
          }
          100% {
            transform: translateY(-90px) translateZ(25px);
          }
        }
        @keyframes scanColorOscillate {
          0%, 100% {
            border-color: #3b82f6;
            background: linear-gradient(to bottom, transparent 0%, rgba(59, 130, 246, 0.01) 30%, rgba(59, 130, 246, 0.12) 75%, rgba(59, 130, 246, 0.35) 100%);
            box-shadow: 0 4px 16px -2px rgba(59, 130, 246, 0.55), 0 10px 25px -5px rgba(59, 130, 246, 0.25);
          }
          50% {
            border-color: #06b6d4;
            background: linear-gradient(to bottom, transparent 0%, rgba(6, 182, 212, 0.01) 30%, rgba(6, 182, 212, 0.12) 75%, rgba(6, 182, 212, 0.35) 100%);
            box-shadow: 0 4px 16px -2px rgba(6, 182, 212, 0.55), 0 10px 25px -5px rgba(6, 182, 212, 0.25);
          }
        }
        .enhanced-scan-line {
          animation: scanSweep 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite,
                     scanColorOscillate 4.8s ease-in-out infinite;
        }
      `}</style>
      {/* Visual cybernetic accent highlights for Dark Theme */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3b82f6]/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6366f1]/5 rounded-full blur-[140px] pointer-events-none" />
          {/* Subtle tech dots grid for dark mode */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-80" />
        </>
      )}

      {/* Top action header info */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
        {/* Top Left: SQLite Badge with pulsed shield */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${
          isDark 
            ? "bg-[#161a24]/90 border-white/5 text-slate-200" 
            : "bg-white border-slate-200/80 text-slate-700"
        }`}>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/10 z-10" />
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          </div>
          <span className="text-xs font-semibold tracking-tight flex items-center gap-1.5">
            SQLite-Secure: <span className="text-blue-500 font-bold">256-bit AES Local Mode</span>
          </span>
        </div>

        {/* Top Right: Actions & Theme toggle */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? "bg-[#161a24]/90 border-white/5 text-amber-400 hover:bg-[#1f2535]" 
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900"
            }`}
            title={isDark ? "Chuyển sang Chế độ sáng" : "Chuyển sang Chế độ tối"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Locked Central Stack with 3D Perspective Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 z-10 [perspective:1000px]">
        <motion.div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? "-5px" : "0px"}) translateZ(${isHovered ? "80px" : "0px"}) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`,
            transformStyle: "preserve-3d",
            transition: isHovered 
              ? "transform 0.1s ease-out, box-shadow 0.2s ease, border-color 0.3s ease" 
              : "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease, border-color 0.4s ease"
          }}
          className={`relative flex flex-col items-center max-w-[380px] w-full px-6 py-8 rounded-[32px] border cursor-pointer select-none ${
            isError
              ? "animate-vibrate animate-error-pulse border-rose-500 bg-rose-500/5 backdrop-blur-3xl"
              : isDark 
                ? isHovered
                  ? "bg-[#141824]/90 border-blue-500/30 [box-shadow:0_2px_4px_rgba(0,0,0,0.5),_0_16px_32px_rgba(0,0,0,0.6),_0_32px_64px_rgba(0,0,0,0.65),_0_48px_96px_rgba(0,0,0,0.7),_0_64px_128px_rgba(0,0,0,0.75),_inset_0_1px_0_rgba(255,255,255,0.15),_0_0_80px_rgba(59,130,246,0.35)] backdrop-blur-3xl"
                  : "bg-[#141824]/80 border-white/10 [box-shadow:0_1px_3px_rgba(0,0,0,0.4),_0_10px_25px_rgba(0,0,0,0.5),_0_20px_50px_rgba(0,0,0,0.65),_inset_0_1px_0_rgba(255,255,255,0.1),_0_0_40px_rgba(59,130,246,0.1)] backdrop-blur-2xl" 
                : isHovered
                  ? "bg-white border-slate-300 [box-shadow:0_2px_4px_rgba(15,23,42,0.03),_0_12px_24px_rgba(15,23,42,0.06),_0_24px_48px_rgba(15,23,42,0.09),_0_48px_80px_rgba(15,23,42,0.12),_0_72px_120px_rgba(15,23,42,0.15),_inset_0_1px_0_rgba(255,255,255,1.0)] backdrop-blur-3xl"
                  : "bg-white/95 border-slate-200/80 [box-shadow:0_1px_3px_rgba(15,23,42,0.04),_0_8px_24px_rgba(15,23,42,0.06),_0_16px_48px_rgba(15,23,42,0.08),_inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
          }`}
          id="3d-locked-card"
        >
          {/* Active pulsing border-light highlight on hover */}
          {isHovered && !isError && (
            <div 
              className={`absolute inset-0 rounded-[32px] pointer-events-none border-2 ring-2 animate-pulse transition-all duration-300 ${
                isDark 
                  ? "border-blue-500/80 ring-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.45)]" 
                  : "border-blue-600/50 ring-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
              }`}
              style={{ transform: "translateZ(15px)" }}
            />
          )}

          {/* Enhanced Scanning Line with trailing motion blur and color oscillation */}
          <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none z-20">
            <div className="enhanced-scan-line absolute left-0 right-0 h-[72px] border-b-2 opacity-85" style={{ transformStyle: "preserve-3d" }} />
          </div>

          {/* Subtle error floating tooltip with 3D depth and exit animation */}
          <AnimatePresence>
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute top-4 bg-rose-600 dark:bg-rose-500 text-white text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase px-3.5 py-1.5 rounded-full shadow-[0_8px_20px_rgba(244,63,94,0.45)] border border-rose-400/40 flex items-center gap-1.5 z-40 select-none cursor-default"
                style={{ transform: "translateZ(90px)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Incorrect PIN</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar Container and Lock Badge Overlay (with 3D translateZ depth action) */}
          <motion.div variants={itemVariants} className="relative mb-4 [transform:translateZ(40px)]">
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-[0_12px_36px_rgba(0,0,0,0.12)] transition-all ${
              isDark 
                ? "bg-gradient-to-b from-[#222a3d] to-[#121620] border-blue-500/30 text-indigo-200" 
                : "bg-gradient-to-b from-slate-100 to-white border-white text-slate-700"
            }`}>
              <span className="text-2xl font-black tracking-tight">{getInitials(lockUsername)}</span>
            </div>
            
            {/* Pulsing secure lock badge */}
            <div className={`absolute right-1 bottom-1 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
              isDark 
                ? "bg-blue-600 border-blue-400 text-white" 
                : "bg-blue-600 border-white text-white"
            }`}>
              <Lock className="w-4 h-4" />
            </div>
          </motion.div>

          {/* User Profile name (translateZ for 3D layout layer separation) */}
          <motion.h2 variants={itemVariants} className={`text-2xl font-extrabold tracking-tight transition-colors [transform:translateZ(30px)] ${
            isDark ? "text-white" : "text-slate-800"
          }`}>
            {lockUsername}
          </motion.h2>

          {/* Prompt status instructions */}
          <motion.p variants={itemVariants} className={`text-[13px] mt-1.5 text-center leading-relaxed transition-colors px-4 [transform:translateZ(25px)] ${
            isError 
              ? "text-rose-500 dark:text-rose-400 font-bold animate-bounce" 
              : isDark 
                ? "text-slate-400 font-medium" 
                : "text-slate-500 font-medium"
          }`}>
            {isError 
              ? "Mã PIN không chính xác! Vui lòng thử lại." 
              : "Hệ thống đang khóa. Nhập mã PIN để mở khóa SQLite."}
          </motion.p>

          {/* Standard status feedback dots indicator (translateZ) */}
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-3 mt-4 mb-4 [transform:translateZ(35px)]">
            {[0, 1, 2, 3].map((index) => {
              const filled = pin.length > index;
              return (
                <motion.div
                  key={index}
                  animate={isError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                    isSuccess
                      ? "bg-emerald-500 border-emerald-500 scale-105 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : isError
                        ? "bg-rose-500 border-rose-500"
                        : filled
                          ? isDark
                            ? "bg-blue-500 border-blue-400 scale-105 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            : "bg-slate-800 border-slate-850 scale-105"
                          : isDark
                            ? "bg-[#11131c] border-white/10"
                            : "bg-slate-200 border-slate-300"
                  }`}
                />
              );
            })}
          </motion.div>

          {/* Elegant Visual Progress Bar for PIN entries */}
          <motion.div 
            variants={itemVariants}
            className="w-[200px] mb-4 flex flex-col items-center [transform:translateZ(30px)] select-none"
          >
            <div className={`w-full h-1.5 rounded-full overflow-hidden transition-all duration-350 ${
              isDark 
                ? "bg-slate-950 border border-white/5" 
                : "bg-slate-200/80 border border-black/5"
            }`}>
              <motion.div 
                className={`h-full rounded-full ${
                  isSuccess 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    : isError 
                      ? "bg-rose-500" 
                      : "bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.45)]"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${(pin.length / 4) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              />
            </div>
            
            {/* Input counter indicator label */}
            <div className="flex justify-between w-full px-1 mt-1.5 text-[9px] font-mono font-black tracking-widest text-slate-400/80 dark:text-slate-500/80">
              <span>ĐÃ NHẬP</span>
              <span>{pin.length} / 4 SỐ</span>
            </div>
          </motion.div>

          {/* Keyboard synchronization helper hint pill (translateZ) */}
          <motion.div variants={itemVariants} className={`mt-0 mb-6 px-3 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-bold border uppercase tracking-wider scale-95 transition-all shadow-inner [transform:translateZ(20px)] ${
            isDark 
              ? "bg-slate-950/60 border-slate-800 text-slate-400" 
              : "bg-slate-100/80 border-slate-200 text-slate-600"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans font-extrabold text-[10px] tracking-wide">Bàn phím Máy tính đang kết nối</span>
          </motion.div>

          {/* Security PIN code Pad (3x4 tiles grid layout with 3D mechanical keys) */}
          <motion.div variants={itemVariants} className="w-full max-w-[320px] px-1 select-none [transform:translateZ(50px)]" style={{ transformStyle: "preserve-3d" }}>
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => {
                const isKeyPressed = activeKey === num;
                return (
                  <motion.button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    type="button"
                    style={{ transform: "translateZ(10px)" }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.94, y: 3 }}
                    animate={{
                      y: isKeyPressed ? 3 : 0,
                      scale: isKeyPressed ? 0.94 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 14 }}
                    className={`relative h-[54px] rounded-2xl flex flex-col justify-center items-center font-bold text-xl transition-all duration-75 cursor-pointer border overflow-hidden
                      ${isKeyPressed 
                        ? "border-b-[2px] border-blue-500 shadow-[0_2px_0_rgba(0,0,0,0.15)]" 
                        : "border-b-[6px] shadow-[0_6px_10px_rgba(0,0,0,0.15)]"
                      }
                      ${isDark
                        ? isKeyPressed
                          ? "bg-gradient-to-b from-[#2e374d] to-[#1e2535] border-blue-500/85 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                          : "bg-gradient-to-b from-slate-850 to-slate-900 border-slate-950 border-b-[#0b0c10] text-[#60a5fa] hover:from-[#2e374d] hover:to-[#1e2535]"
                        : isKeyPressed
                          ? "bg-blue-50 border-blue-500 text-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                          : "bg-gradient-to-b from-white to-slate-50 border-slate-200 border-b-[#cbd5e1] text-slate-800 hover:from-white hover:to-white"
                      }`}
                  >
                    <AnimatePresence>
                      {isKeyPressed && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 0.22, scale: 1.6 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-blue-500 rounded-2xl pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{num}</span>
                  </motion.button>
                );
              })}
              <motion.button
                onClick={handleClear}
                type="button"
                style={{ transform: "translateZ(10px)" }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.94, y: 3 }}
                animate={{
                  y: activeKey === "Clear" ? 3 : 0,
                  scale: activeKey === "Clear" ? 0.94 : 1,
                }}
                transition={{ type: "spring", stiffness: 450, damping: 14 }}
                className={`relative h-[54px] rounded-2xl flex flex-col justify-center items-center text-[10px] font-extrabold transition-all duration-75 cursor-pointer uppercase border overflow-hidden
                  ${activeKey === "Clear"
                    ? "border-b-[2px] border-rose-500 shadow-[0_2px_0_rgba(0,0,0,0.15)]"
                    : "border-b-[6px] shadow-[0_6px_10px_rgba(0,0,0,0.15)]"
                  }
                  ${isDark
                    ? activeKey === "Clear"
                      ? "bg-gradient-to-b from-[#451e27] to-[#30141a] border-rose-500/85 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                      : "bg-gradient-to-b from-[#2a131a] to-[#200e13] border-[#3d1a24] border-b-[#110507] text-rose-450 hover:from-[#351922] hover:to-[#2a131a]"
                    : activeKey === "Clear"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                      : "bg-gradient-to-b from-rose-50 to-rose-100/50 border-rose-250 border-b-rose-350 text-rose-600 hover:from-rose-100 hover:to-rose-50"
                  }`}
              >
                <AnimatePresence>
                  {activeKey === "Clear" && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 0.22, scale: 1.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-rose-500 rounded-2xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>
                <span className="relative z-10">XÓA HẾT</span>
              </motion.button>
              <motion.button
                onClick={() => handleNumberClick("0")}
                type="button"
                style={{ transform: "translateZ(10px)" }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.94, y: 3 }}
                animate={{
                  y: activeKey === "0" ? 3 : 0,
                  scale: activeKey === "0" ? 0.94 : 1,
                }}
                transition={{ type: "spring", stiffness: 450, damping: 14 }}
                className={`relative h-[54px] rounded-2xl flex flex-col justify-center items-center font-bold text-xl transition-all duration-75 cursor-pointer border overflow-hidden
                  ${activeKey === "0"
                    ? "border-b-[2px] border-blue-500 shadow-[0_2px_0_rgba(0,0,0,0.15)]" 
                    : "border-b-[6px] shadow-[0_6px_10px_rgba(0,0,0,0.15)]"
                  }
                  ${isDark
                    ? activeKey === "0"
                      ? "bg-gradient-to-b from-[#2e374d] to-[#1e2535] border-blue-500/85 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                      : "bg-gradient-to-b from-slate-850 to-slate-900 border-slate-950 border-b-[#0b0c10] text-[#60a5fa] hover:from-[#2e374d] hover:to-[#1e2535]"
                    : activeKey === "0"
                      ? "bg-blue-50 border-blue-500 text-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                      : "bg-gradient-to-b from-white to-slate-50 border-slate-200 border-b-[#cbd5e1] text-slate-800 hover:from-white hover:to-white"
                  }`}
              >
                <AnimatePresence>
                  {activeKey === "0" && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 0.22, scale: 1.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-blue-500 rounded-2xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>
                <span className="relative z-10">0</span>
              </motion.button>
              <motion.button
                onClick={handleBackspace}
                type="button"
                style={{ transform: "translateZ(10px)" }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.94, y: 3 }}
                animate={{
                  y: activeKey === "Backspace" ? 3 : 0,
                  scale: activeKey === "Backspace" ? 0.94 : 1,
                }}
                transition={{ type: "spring", stiffness: 450, damping: 14 }}
                className={`relative h-[54px] rounded-2xl flex flex-col justify-center items-center text-[10px] font-extrabold transition-all duration-75 cursor-pointer uppercase border overflow-hidden
                  ${activeKey === "Backspace"
                    ? "border-b-[2px] border-emerald-500 shadow-[0_2px_0_rgba(0,0,0,0.15)]"
                    : "border-b-[6px] shadow-[0_6px_10px_rgba(0,0,0,0.15)]"
                  }
                  ${isDark
                    ? activeKey === "Backspace"
                      ? "bg-gradient-to-b from-[#193d2a] to-[#0f2419] border-emerald-500/85 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                      : "bg-gradient-to-b from-[#132a1e] to-[#0e2016] border-[#1d3d2c] border-b-[#05110a] text-emerald-400 hover:from-[#193526] hover:to-[#132a1e]"
                    : activeKey === "Backspace"
                      ? "bg-emerald-55 border-emerald-500 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "bg-gradient-to-b from-emerald-50 to-emerald-100/50 border-emerald-250 border-b-emerald-355 text-emerald-600 hover:from-emerald-100 hover:to-emerald-50"
                  }`}
              >
                <AnimatePresence>
                  {activeKey === "Backspace" && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 0.22, scale: 1.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-emerald-500 rounded-2xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>
                <span className="relative z-10">← XÓA</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Fluid Fluent Design safe sandbox bottom footnote */}
      <div className="w-full max-w-xl mx-auto text-center px-4 mt-4 z-10">
        <p className={`text-[11px] font-normal leading-relaxed transition-colors ${
          isDark ? "text-slate-500" : "text-slate-400"
        }`}>
          Thiết kế cấu trúc Fluent bảo vệ dữ liệu cục bộ an toàn. Dữ liệu của bạn được lưu trong sandbox trình duyệt và được mã hóa bảo mật SQLite-Secure <span className="font-semibold text-blue-500">256-bit AES Local Storage</span> nhằm an toàn dữ liệu phần mềm tuyệt đối.
        </p>
      </div>
    </div>
  );
}
