import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Eye, Cpu, RefreshCw, Smartphone } from "lucide-react";
import { Employee } from "../types";

interface ThreeDInteractiveImageProps {
  currentAdmin: Employee;
  accentColorHex: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface RingRipple {
  id: number;
  x: number;
  y: number;
}

export function ThreeDInteractiveImage({ currentAdmin, accentColorHex }: ThreeDInteractiveImageProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glint, setGlint] = useState({ x: 50, y: 50, opacity: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<RingRipple[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [telemetry, setTelemetry] = useState<string>("SYSTEM INTEGRITY: NORMAL");

  // Rotating 3D Sphere vertices generator
  const points = useMemo(() => {
    const pts: Point3D[] = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(1 - (2 * i) / count);
      const phi = Math.sqrt(count * Math.PI) * theta;
      pts.push({
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(theta),
      });
    }
    return pts;
  }, []);

  // 3D Canvas effect with mouse traction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angleX = 0.005;
    let angleY = 0.005;

    const size = 150;
    canvas.width = size;
    canvas.height = size;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.42;

      // Dynamic mouse interaction: alter rotation velocities based on current card tilt
      const targetVelX = angleX + (mousePos.y * 0.001);
      const targetVelY = angleY + (mousePos.x * 0.001);

      // Interpolation values
      angleX += (targetVelX - angleX) * 0.2;
      angleY += (targetVelY - angleY) * 0.2;

      // Base rotation increment
      const rotSpeedX = 0.007 + mousePos.y * 0.0005;
      const rotSpeedY = 0.007 + mousePos.x * 0.0005;

      const cosX = Math.cos(rotSpeedX);
      const sinX = Math.sin(rotSpeedX);
      const cosY = Math.cos(rotSpeedY);
      const sinY = Math.sin(rotSpeedY);

      // Rotate and project points
      const projected = points.map((p) => {
        // Rotate X
        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.z * cosX + p.y * sinX;

        // Rotate Y
        let x2 = p.x * cosY - z1 * sinY;
        let z2 = z1 * cosY + p.x * sinY;

        // Apply interactive mouse warp / perspective tilt toward hover focus
        const tiltIntensity = 0.15;
        const warpX = x2 + mousePos.x * tiltIntensity * (z2 + 1);
        const warpY = y1 + mousePos.y * tiltIntensity * (z2 + 1);

        // Project
        const scale = 2.5 / (2.5 - z2); // Perspective scaling
        return {
          px: cx + warpX * r * scale,
          py: cy + warpY * r * scale,
          z: z2,
        };
      });

      // Draw projected wireframe connections (constellations)
      ctx.strokeStyle = `${accentColorHex}12`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dist = Math.hypot(projected[i].px - projected[j].px, projected[i].py - projected[j].py);
          if (dist < size * 0.22) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            // Dynamic alpha based on distance and depth
            const alpha = (1 - dist / (size * 0.22)) * (projected[i].z + 1.2) * 0.25;
            ctx.strokeStyle = `${accentColorHex}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
            ctx.stroke();
          }
        }
      }

      // Draw projected nodes
      projected.forEach((p) => {
        const sizeNode = (p.z + 1) * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(p.px, p.py, sizeNode, 0, Math.PI * 2);
        // Deeper nodes are dimmer, closer nodes shine bright
        const brightness = Math.max(0.1, (p.z + 1.2) / 2);
        ctx.fillStyle = `${accentColorHex}${Math.floor(brightness * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();
        
        // Specular glow on foreground nodes
        if (p.z > 0.8) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, sizeNode * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${accentColorHex}1A`;
          ctx.fill();
        }
      });

      // Overlay abstract scanning line
      if (isScanning) {
        const scanY = (Math.sin(Date.now() / 400) + 1) * 0.5 * size;
        ctx.beginPath();
        ctx.moveTo(10, scanY);
        ctx.lineTo(size - 10, scanY);
        ctx.strokeStyle = `${accentColorHex}50`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = accentColorHex;
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [points, mousePos, accentColorHex, isScanning]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // rotation limits on angles (-12 to +12 degrees)
    const rotateX = -(y - centerY) / 8;
    const rotateY = (x - centerX) / 8;

    setRotate({ x: rotateX, y: rotateY });
    setMousePos({ x: (x - centerX) / centerX, y: (y - centerY) / centerY });

    // Glint shine overlay follow
    const glintX = (x / rect.width) * 100;
    const glintY = (y / rect.height) * 100;
    setGlint({ x: glintX, y: glintY, opacity: 0.35 });

    // Dynamic digital telemetry readout
    if (Math.random() < 0.15) {
      const codes = [
        `SCAN X:${Math.round(x)} Y:${Math.round(y)}`,
        `ROT X:${rotateX.toFixed(1)}° Y:${rotateY.toFixed(1)}°`,
        "BIOMETRIC VECTOR VERIFIED",
        `MASTER-LOCK v5.0 SECURED`,
        "RAM INJECT INTEGRITY: 100%",
        `ID: ${currentAdmin.id.toUpperCase()} CONNECTED`,
        "3D PARALLAX OVERLAY: ACTIVE"
      ];
      setTelemetry(codes[Math.floor(Math.random() * codes.length)]);
    }
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setMousePos({ x: 0, y: 0 });
    setGlint((g) => ({ ...g, opacity: 0 }));
    setTelemetry("SYSTEM INTEGRITY: NORMAL");
  };

  // Click handler to trigger localized click ripple bursts
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: RingRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);
    setTelemetry("BIOMETRIC RE-VALIDATION BURST...");

    // Flicker scanner line as a click reaction
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 250);
  };

  // Clean stale ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setRipples((prev) => prev.filter((r) => now - r.id < 950));
    }, 100);
    return () => clearInterval(timer);
  }, [ripples]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      style={{
        transform: `perspective(800px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out, border-color 0.3s",
      }}
      className="relative w-80 bg-slate-900/85 border border-white/10 hover:border-violet-500/30 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.65)] select-none flex flex-col gap-4 overflow-hidden cursor-crosshair group-3d-interact"
    >
      {/* Dynamic glint specular lighting gloss */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
        style={{
          background: `radial-gradient(circle 140px at ${glint.x}% ${glint.y}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%)`,
          opacity: glint.opacity,
          zIndex: 10,
        }}
      />

      {/* Futuristic Header with Biometrics Status */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5 select-none" style={{ transform: "translateZ(25px)" }}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: accentColorHex }} />
          <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">3D Tương tác Ảnh Động</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-extrabold text-emerald-400 font-mono tracking-wider">SECURE SHIELD</span>
        </div>
      </div>

      {/* Core Center Display Area hosting the 3D Canvas element & target reticle */}
      <div className="relative flex items-center justify-center py-4 bg-slate-950/45 rounded-xl border border-white/5 select-none overflow-hidden h-44" style={{ transform: "translateZ(35px)" }}>
        
        {/* Glowing holographic background halo */}
        <div 
          className="absolute w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-30 transition-colors duration-500"
          style={{ backgroundColor: accentColorHex }}
        />

        {/* Outer biometric scope crosshair brackets */}
        <div className="absolute inset-0 p-3 pointer-events-none flex items-center justify-center opacity-65">
          <div className="w-full h-full border border-dashed border-white/10 rounded-lg flex items-center justify-center relative">
            {/* Brackets */}
            <div className={`absolute top-1 left-1 w-2.5 h-2.5 border-t border-l rounded-tl`} style={{ borderColor: accentColorHex }} />
            <div className={`absolute top-1 right-1 w-2.5 h-2.5 border-t border-r rounded-tr`} style={{ borderColor: accentColorHex }} />
            <div className={`absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l rounded-bl`} style={{ borderColor: accentColorHex }} />
            <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r rounded-br`} style={{ borderColor: accentColorHex }} />
          </div>
        </div>

        {/* 3D Holographic Canvas with perspective projection */}
        <canvas 
          ref={canvasRef} 
          className="relative z-10 transition-transform duration-100"
          style={{ transform: "rotateZ(1deg)" }}
        />

        {/* Real-time telemetry readouts flanking the canvas */}
        <div className="absolute bottom-2.5 left-3 font-mono text-[8px] text-slate-500 tracking-tight flex flex-col gap-0.5 z-20">
          <span>COGNITIVE CORE INT: OK</span>
          <span>MESH NODES: 120 V</span>
        </div>
        <div className="absolute bottom-2.5 right-3 font-mono text-[8px] text-right text-slate-500 tracking-tight flex flex-col gap-0.5 z-20">
          <span>PARALLAX DEPTH: 1.5</span>
          <span>LATENCY: 0.42ms</span>
        </div>
      </div>

      {/* Target Info Bio panel */}
      <div className="flex flex-col gap-2 relative" style={{ transform: "translateZ(20px)" }}>
        <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col gap-1 text-[#f8fafc]">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Administrator Node</span>
            <span className="text-[8px] font-mono font-bold tracking-tight" style={{ color: accentColorHex }}>v5.0 LIVE</span>
          </div>
          <div className="min-w-0 pr-1 mt-0.5">
            <h4 className="text-xs font-black truncate text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColorHex }} />
              {currentAdmin.name}
            </h4>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[9px] text-slate-400 font-medium truncate shrink-0">{currentAdmin.position}</span>
              <span className="text-[8px] text-white/35 font-mono truncate">{currentAdmin.department}</span>
            </div>
          </div>
        </div>

        {/* Rolling interactive event readout */}
        <div className="px-2 font-mono text-[9px] text-[#86efac] flex justify-between items-center bg-[#10b981]/10 rounded border border-[#10b981]/20 py-1 select-none">
          <span className="text-[8px] uppercase tracking-wide font-black flex items-center gap-1.5 shrink-0">
            <Cpu className="w-3 h-3 text-[#10b981] animate-spin" style={{ animationDuration: "12s" }} />
            Telemetry:
          </span>
          <span className="truncate pl-3 font-semibold text-[8px] uppercase">{telemetry}</span>
        </div>
      </div>

      {/* Clicking interactive shocks inside the card (Internal coordinates) */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <React.Fragment key={ripple.id}>
              {/* Expanding primary holographic shockwave */}
              <motion.div
                initial={{ opacity: 0.9, scale: 0, x: ripple.x, y: ripple.y }}
                animate={{ opacity: 0, scale: 3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2"
                style={{ borderColor: accentColorHex, boxShadow: `0 0 12px ${accentColorHex}` }}
              />
              {/* Expanding secondary echo shockwave */}
              <motion.div
                initial={{ opacity: 0.6, scale: 0, x: ripple.x, y: ripple.y }}
                animate={{ opacity: 0, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.12 }}
                className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border border-dashed"
                style={{ borderColor: accentColorHex }}
              />
              {/* Quick bio grid lines flash */}
              <motion.div
                initial={{ opacity: 0.15 }}
                animate={{ opacity: [0.15, 0.45, 0] }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-slate-950/25 pointer-events-none flex items-center justify-center"
                style={{
                  gridTemplateColumns: "repeat(10, 1fr)",
                  gridTemplateRows: "repeat(10, 1fr)",
                }}
              />
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
