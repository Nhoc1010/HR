import { useRef, useEffect } from "react";

export function PlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Calibrate particle density for stable high framerate
    const particleCount = Math.min(65, Math.floor((width * height) / 25000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
      });
    }

    // Dynamic mouse vector tracking state
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      radius: 190,
    };

    // Lists for click-triggered interactive shockwaves and particle bursts
    interface SplashShockwave {
      x: number;
      y: number;
      maxRadius: number;
      radius: number;
      opacity: number;
      colorHex: string;
    }

    interface SparkPiece {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      colorHex: string;
    }

    const shockwavesList: SplashShockwave[] = [];
    const sparksList: SparkPiece[] = [];

    // Retrieve active accent colors dynamically
    const getActiveAccentColors = () => {
      const savedAccent = localStorage.getItem("hrm_accent_color") || "purple";
      let accentRGB = "168, 85, 247"; // purple default
      let accentHex = "#a855f7";

      if (savedAccent === "blue") {
        accentRGB = "59, 130, 246";
        accentHex = "#3b82f6";
      } else if (savedAccent === "green") {
        accentRGB = "16, 185, 129";
        accentHex = "#10b981";
      } else if (savedAccent === "teal") {
        accentRGB = "20, 184, 166";
        accentHex = "#14b8a6";
      } else if (savedAccent === "orange") {
        accentRGB = "249, 115, 22";
        accentHex = "#f97316";
      } else if (savedAccent === "rose") {
        accentRGB = "244, 63, 94";
        accentHex = "#f43f5e";
      }
      return { rgb: accentRGB, hex: accentHex };
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.active = true;
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const { hex } = getActiveAccentColors();

      // Add high fidelity circular shockwave expanding outwards
      shockwavesList.push({
        x: clickX,
        y: clickY,
        maxRadius: Math.random() * 50 + 65,
        radius: 0,
        opacity: 1.0,
        colorHex: hex,
      });

      // Add colorful energetic spark particles
      const sparkCount = Math.floor(Math.random() * 12 + 16); // 16 to 28 particles
      for (let i = 0; i < sparkCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2.8 + 1.2;
        sparksList.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(theta) * velocity,
          vy: Math.sin(theta) * velocity,
          size: Math.random() * 2.5 + 1.2,
          alpha: 1.0,
          colorHex: hex,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0c0d15";
      ctx.fillRect(0, 0, width, height);

      const { rgb: currentAccentRGB } = getActiveAccentColors();

      // Smoothly interpolate cursor position to prevent high-jank jumping
      if (mouse.active) {
        if (mouse.x === -1000) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.12;
          mouse.y += (mouse.targetY - mouse.y) * 0.12;
        }
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";

      // Draw standard particle plexus network
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gravitational mouse vortex pulling nodes around coordinates
        if (mouse.x !== -1000 && mouse.y !== -1000) {
          const distMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (distMouse < mouse.radius) {
            const pullForce = (1 - distMouse / mouse.radius) * 0.42;
            const pullAngle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
            // Elastic warp velocity adjustments
            p.x += Math.cos(pullAngle) * pullForce * 0.55;
            p.y += Math.sin(pullAngle) * pullForce * 0.55;

            // Connect cursor directly to nearby nodes with a glowing line
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(${currentAccentRGB}, ${0.28 * (1 - distMouse / mouse.radius)})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Keep inside viewport boundaries with bounce mechanics
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw node dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw standard local node-to-node proximity lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 170) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Combine with dynamic transparency fading
            ctx.strokeStyle = `rgba(${currentAccentRGB}, ${0.1 * (1 - dist / 170)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw and advance expanding shockwave rings
      for (let k = shockwavesList.length - 1; k >= 0; k--) {
        const wave = shockwavesList[k];
        wave.radius += (wave.maxRadius - wave.radius) * 0.08;
        wave.opacity -= 0.02;

        if (wave.opacity <= 0 || wave.maxRadius - wave.radius < 0.5) {
          shockwavesList.splice(k, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${wave.colorHex}${Math.floor(wave.opacity * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 2.0 * wave.opacity;
        ctx.stroke();

        // Inner glowing echo ring
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = `${wave.colorHex}${Math.floor(wave.opacity * 130).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1.0 * wave.opacity;
        ctx.stroke();
      }

      // Draw, update and advance spark fragments
      for (let s = sparksList.length - 1; s >= 0; s--) {
        const spark = sparksList[s];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.05; // gravity pulling sparks downwards
        spark.alpha -= 0.012; // slow fade

        if (spark.alpha <= 0) {
          sparksList.splice(s, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = `${spark.colorHex}${Math.floor(spark.alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();

        // Add small glowing trail lines
        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(spark.x - spark.vx * 1.5, spark.y - spark.vy * 1.5);
        ctx.strokeStyle = `${spark.colorHex}${Math.floor(spark.alpha * 120).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = spark.size * 0.65;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

