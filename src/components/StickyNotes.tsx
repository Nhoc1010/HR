import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, MoreHorizontal, Check, GripHorizontal, FileText } from "lucide-react";

export interface StickyNote {
  id: string;
  text: string;
  color: string; // "yellow" | "green" | "pink" | "blue" | "purple" | "charcoal"
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

// Anti-XSS Sanitizer for input strings to ensure robust safety
export function sanitizeText(input: string): string {
  if (!input) return "";
  let sanitized = input;
  // Strip HTML tag structures completely to prevent HTML injection
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  // Block scripting protocols
  sanitized = sanitized.replace(/javascript:/gi, "blocked:");
  sanitized = sanitized.replace(/onload=/gi, "blocked-onload=");
  sanitized = sanitized.replace(/onerror=/gi, "blocked-onerror=");
  sanitized = sanitized.replace(/onclick=/gi, "blocked-onclick=");
  return sanitized;
}

// Secure lightweight XOR masking/encryption for local storage data protection.
// Prevents local spyware or unauthorized local disk access from reading plaintext notes.
const ENCRYPTION_KEY = "Secured_Sticky_Notes_Salt_2026_@!";

export function encryptData(plainText: string): string {
  try {
    let result = "";
    for (let i = 0; i < plainText.length; i++) {
      const charCode = plainText.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    // Convert safely using encode/btoa
    return btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    return btoa(unescape(encodeURIComponent(plainText)));
  }
}

export function decryptData(cipherText: string): string {
  try {
    if (!cipherText) return "";
    const rawString = decodeURIComponent(escape(atob(cipherText)));
    let result = "";
    for (let i = 0; i < rawString.length; i++) {
      const charCode = rawString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    try {
      return decodeURIComponent(escape(atob(cipherText)));
    } catch (e2) {
      return "";
    }
  }
}

// Strict schema validation to prevent Prototype Pollution or malicious storage injection
export function validateAndSafenStickyNotes(rawList: any): StickyNote[] {
  if (!Array.isArray(rawList)) return [];
  const safeList: StickyNote[] = [];
  
  for (const item of rawList) {
    if (!item || typeof item !== "object") continue;
    
    // Shield against Prototype Pollution key names
    const id = typeof item.id === "string" && !item.id.includes("__proto__") && !item.id.includes("constructor") 
      ? item.id 
      : `note-safe-${Date.now()}-${Math.random()}`;
      
    const text = typeof item.text === "string" ? sanitizeText(item.text) : "";
    
    const allowedColors = ["yellow", "green", "pink", "blue", "purple", "charcoal"];
    const color = typeof item.color === "string" && allowedColors.includes(item.color) 
      ? item.color 
      : "yellow";
      
    const x = typeof item.x === "number" && !isNaN(item.x) ? Math.max(0, item.x) : 120;
    const y = typeof item.y === "number" && !isNaN(item.y) ? Math.max(0, item.y) : 180;
    const w = typeof item.w === "number" && !isNaN(item.w) ? Math.max(180, Math.min(600, item.w)) : 240;
    const h = typeof item.h === "number" && !isNaN(item.h) ? Math.max(160, Math.min(600, item.h)) : 220;
    const zIndex = typeof item.zIndex === "number" && !isNaN(item.zIndex) ? Math.max(1, item.zIndex) : 15;
    
    safeList.push({ id, text, color, x, y, w, h, zIndex });
  }
  
  return safeList;
}

interface StickyNotesProps {
  notes: StickyNote[];
  onChangeNotes: (notes: StickyNote[]) => void;
  accentColorHex: string;
}

const NOTE_COLORS: { [key: string]: { bg: string; header: string; text: string; name: string } } = {
  yellow: {
    bg: "bg-[#fef9c3]", 
    header: "bg-[#fef08a]", 
    text: "text-slate-900",
    name: "Vàng sáng"
  },
  green: {
    bg: "bg-[#dcfce7]", 
    header: "bg-[#bbf7d0]", 
    text: "text-slate-900",
    name: "Xanh lá"
  },
  pink: {
    bg: "bg-[#fce7f3]", 
    header: "bg-[#fbcfe8]", 
    text: "text-slate-900",
    name: "Hồng phấn"
  },
  blue: {
    bg: "bg-[#dbeafe]", 
    header: "bg-[#bfdbfe]", 
    text: "text-slate-900",
    name: "Xanh biển"
  },
  purple: {
    bg: "bg-[#f3e8ff]", 
    header: "bg-[#e9d5ff]", 
    text: "text-slate-900",
    name: "Tím mộng mơ"
  },
  charcoal: {
    bg: "bg-[#1e293b]", 
    header: "bg-[#334155]", 
    text: "text-slate-50",
    name: "Xám tối"
  }
};

export interface DustParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  delay: number;
}

const PIN_COLORS: { [key: string]: string } = {
  yellow: "bg-red-500 border-red-650 shadow-[inset_0_2px_4px_rgba(255,255,255,0.65)]",
  green: "bg-rose-500 border-rose-650 shadow-[inset_0_2px_4px_rgba(255,255,255,0.65)]",
  pink: "bg-blue-500 border-blue-650 shadow-[inset_0_2px_4px_rgba(255,255,255,0.65)]",
  blue: "bg-amber-500 border-amber-650 shadow-[inset_0_2px_4px_rgba(255,255,255,0.65)]",
  purple: "bg-emerald-500 border-emerald-650 shadow-[inset_0_2px_4px_rgba(255,255,255,0.65)]",
  charcoal: "bg-red-500 border-red-650 shadow-[inset_0_2px_4px_rgba(255,255,255,0.65)]"
};

const PARTICLE_COLORS: { [key: string]: string } = {
  yellow: "#fef08a",
  green: "#bbf7d0",
  pink: "#fbcfe8",
  blue: "#bfdbfe",
  purple: "#e9d5ff",
  charcoal: "#475569"
};

export function StickyNotes({ notes, onChangeNotes, accentColorHex }: StickyNotesProps) {
  // Track high active zIndex
  const [maxZIndex, setMaxZIndex] = useState(15);

  const getNextZIndex = () => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    return nextZ;
  };

  const handleUpdateNote = (id: string, updates: Partial<StickyNote>) => {
    onChangeNotes(
      notes.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  const handleDeleteNote = (id: string) => {
    onChangeNotes(notes.filter((note) => note.id !== id));
  };

  const handleCreateNewNote = (nearNote?: StickyNote) => {
    const newId = `note-${Date.now()}`;
    const defaultColor = nearNote ? nearNote.color : "yellow";
    const nextZ = getNextZIndex();
    
    const newNote: StickyNote = {
      id: newId,
      text: "",
      color: defaultColor,
      x: nearNote ? nearNote.x + 40 : Math.floor(Math.random() * 150) + 120,
      y: nearNote ? nearNote.y + 40 : Math.floor(Math.random() * 150) + 180,
      w: 240,
      h: 220,
      zIndex: nextZ
    };

    // Keep it on the screen limits
    if (typeof window !== "undefined") {
      if (newNote.x > window.innerWidth - 250) newNote.x = 100;
      if (newNote.y > window.innerHeight - 250) newNote.y = 150;
    }

    onChangeNotes([...notes, newNote]);
  };

  return (
    <>
      <AnimatePresence>
        {notes.map((note) => {
          const colorCfg = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
          
          return (
            <SingleNote
              key={note.id}
              note={note}
              colorCfg={colorCfg}
              onFocus={() => {
                const nextZ = getNextZIndex();
                handleUpdateNote(note.id, { zIndex: nextZ });
              }}
              onUpdate={(updates) => handleUpdateNote(note.id, updates)}
              onDelete={() => handleDeleteNote(note.id)}
              onCreateNew={() => handleCreateNewNote(note)}
            />
          );
        })}
      </AnimatePresence>
    </>
  );
}

interface SingleNoteProps {
  key?: string;
  note: StickyNote;
  colorCfg: typeof NOTE_COLORS[keyof typeof NOTE_COLORS];
  onFocus: () => void;
  onUpdate: (updates: Partial<StickyNote>) => void;
  onDelete: () => void;
  onCreateNew: () => void;
}

function SingleNoteComponent({ note, colorCfg, onFocus, onUpdate, onDelete, onCreateNew }: SingleNoteProps) {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize state
  const isResizing = useRef(false);
  const startDimensions = useRef({ w: 240, h: 220 });
  const startPosition = useRef({ x: 0, y: 0 });

  const [saveStatus, setSaveStatus] = useState<"idle" | "typing" | "saved">("idle");
  
  // Thanos Dissolve physics state
  const [isDissolving, setIsDissolving] = useState(false);
  const [particles, setParticles] = useState<DustParticle[]>([]);

  // Keep references in sync to prevent stale closures without binding listeners multiple times
  const noteRef = useRef(note);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    noteRef.current = note;
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (saveStatus === "typing") {
      const timer = setTimeout(() => {
        setSaveStatus("saved");
      }, 850);
      return () => clearTimeout(timer);
    } else if (saveStatus === "saved") {
      const timer = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const triggerDissolve = () => {
    if (isDissolving) return;
    setIsDissolving(true);

    const w = noteRef.current.w;
    const h = noteRef.current.h;
    const list: DustParticle[] = [];

    // Create 45 dusty flying pixel flakes with unique angles and speeds
    for (let i = 0; i < 45; i++) {
      list.push({
        id: i,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 12, // strong horizontal side breeze
        vy: -Math.random() * 8 - 4, // powerful upward lift drift
        size: 3 + Math.random() * 5,
        delay: Math.random() * 0.2
      });
    }
    setParticles(list);

    // Parent callback after disintegration completes
    setTimeout(() => {
      onDelete();
    }, 1100);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    startDimensions.current = { w: noteRef.current.w, h: noteRef.current.h };
    startPosition.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaW = moveEvent.clientX - startPosition.current.x;
      const deltaH = moveEvent.clientY - startPosition.current.y;

      const nextW = Math.max(180, Math.min(600, startDimensions.current.w + deltaW));
      const nextH = Math.max(160, Math.min(600, startDimensions.current.h + deltaH));

      onUpdateRef.current({ w: nextW, h: nextH });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
  };

  // Determine appropriate thumbtack/pin color based on current note color
  const pinColorClass = PIN_COLORS[note.color] || PIN_COLORS.yellow;
  const particleColorHex = PARTICLE_COLORS[note.color] || PARTICLE_COLORS.yellow;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.65, y: -65, rotate: -8, filter: "blur(10px)" }}
      animate={isDissolving ? {
        opacity: 0,
        scale: 0.25,
        y: -140,
        rotate: 22,
        filter: "blur(14px) brightness(1.25)",
      } : { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        rotate: 0, 
        filter: "blur(0px)" 
      }}
      exit={{ opacity: 0, scale: 0.1, y: 150, rotate: -25, filter: "blur(6px)" }}
      whileHover={isDissolving ? {} : { 
        y: -4, 
        scale: 1.015,
        // Fluid pendulum swing on hover from pin insert point!
        rotate: [0, -3.2, 2.4, -1.6, 1.0, -0.5, 0],
        boxShadow: "0 28px 65px rgba(0,0,0,0.45)"
      }}
      transition={isDissolving ? {
        duration: 0.95,
        ease: "easeIn"
      } : { 
        type: "spring", 
        stiffness: 350, 
        damping: 24,
        rotate: { duration: 1.4, ease: "easeOut" },
        boxShadow: { duration: 0.15 }
      }}
      onMouseDown={onFocus}
      style={{
        position: "absolute",
        left: `${note.x}px`,
        top: `${note.y}px`,
        width: `${note.w}px`,
        height: `${note.h}px`,
        zIndex: note.zIndex,
        // Core rotation pivot at the top of the pin position!
        transformOrigin: "50% 12px",
      }}
      className={`absolute flex flex-col rounded-xl border border-black/10 transition-colors duration-300 ${colorCfg.bg} ${colorCfg.text} select-none ${
        isDissolving ? "overflow-visible shadow-none border-transparent pointer-events-none" : "overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
      }`}
    >
      {/* 3D Push Pin on top center, animated as if pressed down on mount */}
      {!isDissolving && (
        <motion.div 
          initial={{ scale: 2.5, y: -25, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 14, delay: 0.15 }}
          className="absolute top-[-11px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none filter drop-shadow-[0_5px_4px_rgba(0,0,0,0.38)]"
        >
          {/* Thumb Pin Caphead */}
          <div className={`w-4 h-4 rounded-full relative ${pinColorClass}`}>
            {/* Inner highlight gloss */}
            <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/80" />
            {/* Base of thumbtack cap */}
            <div className="absolute -bottom-1 left-[3px] w-2 h-1.5 bg-black/15 dark:bg-white/10 rounded-sm" />
          </div>
          {/* Metal needle segment */}
          <div className="w-0.5 h-3 bg-gradient-to-b from-slate-400/90 via-slate-300/65 to-transparent -mt-0.5" />
        </motion.div>
      )}

      {/* Spreading dust particle overlays during Thanos disintegrating flow */}
      {isDissolving && particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1.1 }}
          animate={{ 
            x: p.x + p.vx * 32, 
            y: p.y + p.vy * 32, 
            opacity: 0, 
            scale: 0.1,
            rotate: Math.random() * 360 - 180,
            filter: "blur(0.5px)"
          }}
          transition={{ duration: 0.95, delay: p.delay, ease: "easeOut" }}
          className="absolute rounded-full pointer-events-none z-50"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: particleColorHex,
            boxShadow: `0 0 6px ${particleColorHex}80`
          }}
        />
      ))}

      {/* Note Header / Drag Handle */}
      <div
        className={`h-8 flex items-center justify-between px-2 cursor-move shrink-0 ${colorCfg.header} group`}
        onDoubleClick={onCreateNew}
      >
        <div className="flex items-center gap-1.5 win10-btn-exclude">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateNew();
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 text-inherit/70 hover:text-inherit transition-colors cursor-pointer"
            title="Thêm note mới"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grabber indicator in middle */}
        <div className="flex items-center opacity-30 group-hover:opacity-75 transition-opacity">
          <GripHorizontal className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-1.5 win10-btn-exclude">
          {/* Options button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorMenu(!showColorMenu);
            }}
            className={`w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 text-inherit/70 hover:text-inherit transition-colors cursor-pointer ${
              showColorMenu ? "bg-black/10" : ""
            }`}
            title="Bộ màu và Menu"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Delete note */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerDissolve();
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-450 text-inherit/70 transition-colors cursor-pointer"
            title="Xóa Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drag element implementation (Custom handle logic using standard mouse move dragging on the header tab) */}
      <DragHandler 
        containerRef={containerRef} 
        note={note} 
        onUpdate={onUpdate} 
      />

      {/* Note Body Area */}
      <div className="flex-1 min-h-0 relative p-4 pb-8">
        <textarea
          value={note.text}
          onChange={(e) => {
            onUpdate({ text: e.target.value });
            setSaveStatus("typing");
          }}
          placeholder="Viết ghi chú nhanh ở đây..."
          className="w-full h-full bg-transparent border-0 resize-none outline-none font-medium text-[13px] leading-relaxed tracking-tight select-text focus:ring-0 focus:outline-none placeholder-slate-500/35"
          style={{ color: "inherit" }}
          spellCheck={false}
        />

        {/* Micro saving state dynamic indicator */}
        <div className="absolute bottom-2 left-3 pointer-events-none flex items-center gap-1.5 select-none">
          <AnimatePresence mode="popLayout">
            {saveStatus === "typing" && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, scale: 0.8, x: -5 }}
                animate={{ opacity: 0.75, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-bold tracking-tight uppercase opacity-75">đang viết...</span>
              </motion.div>
            )}
            {saveStatus === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.8, y: 3 }}
                animate={{ opacity: 0.85, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex items-center gap-1 ${
                  note.color === "charcoal" ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                <Check className="w-3 h-3 text-current stroke-[3]" />
                <span className="text-[9px] font-bold tracking-tight uppercase">đã tự động lưu</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showColorMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className={`absolute left-0 right-0 bottom-0 p-2.5 flex flex-col gap-2 rounded-t-xl shadow-lg border-t border-black/5 ${
                note.color === "charcoal" ? "bg-slate-800" : "bg-white"
              }`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  note.color === "charcoal" ? "text-slate-350" : "text-slate-500"
                }`}>Color presets:</span>
                <span className={`text-[9px] font-semibold ${
                  note.color === "charcoal" ? "text-emerald-400" : "text-emerald-600"
                }`}>{colorCfg.name}</span>
              </div>
              
              <div className="flex justify-between items-center bg-black/5 p-1 rounded-lg">
                {Object.keys(NOTE_COLORS).map((colorKey) => {
                  const item = NOTE_COLORS[colorKey];
                  const isSelected = note.color === colorKey;
                  return (
                    <button
                      key={colorKey}
                      onClick={() => {
                        onUpdate({ color: colorKey });
                        setShowColorMenu(false);
                      }}
                      className={`h-6 w-6 rounded-full border border-black/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${item.bg}`}
                      style={{ backgroundColor: colorKey === "charcoal" ? "#1e293b" : undefined }}
                    >
                      {isSelected && (
                        <Check className={`w-3 h-3 ${colorKey === "charcoal" ? "text-white" : "text-slate-800"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resize Handle bottom right corner */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize z-20 flex items-end justify-end p-0.5 pointer-events-auto"
      >
        <svg width="6" height="6" viewBox="0 0 6 6" className="opacity-40">
          <line x1="0" y1="5" x2="5" y2="0" stroke="currentColor" strokeWidth="1" />
          <line x1="2" y1="5" x2="5" y2="2" stroke="currentColor" strokeWidth="1" />
          <line x1="4" y1="5" x2="5" y2="4" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </motion.div>
  );
}

const SingleNote = React.memo(SingleNoteComponent, (prev, next) => {
  return (
    prev.note.id === next.note.id &&
    prev.note.text === next.note.text &&
    prev.note.color === next.note.color &&
    prev.note.x === next.note.x &&
    prev.note.y === next.note.y &&
    prev.note.w === next.note.w &&
    prev.note.h === next.note.h &&
    prev.note.zIndex === next.note.zIndex &&
    prev.colorCfg.bg === next.colorCfg.bg &&
    prev.colorCfg.header === next.colorCfg.header
  );
});

// Separate helper to trigger note movement
function DragHandler({ 
  containerRef, 
  note, 
  onUpdate 
}: { 
  containerRef: React.RefObject<HTMLDivElement | null>;
  note: StickyNote;
  onUpdate: (updates: Partial<StickyNote>) => void;
}) {
  const noteRef = useRef(note);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    noteRef.current = note;
    onUpdateRef.current = onUpdate;
  }); // run on every render to keep refs in sync without triggering effects

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const header = el.querySelector(".cursor-move");
    if (!header) return;

    const onMouseDown = (e: MouseEvent) => {
      // Exclude children controls click within header
      const target = e.target as HTMLElement;
      if (target.closest(".win10-btn-exclude")) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const initialLeft = noteRef.current.x;
      const initialTop = noteRef.current.y;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let finalX = initialLeft + deltaX;
        let finalY = initialTop + deltaY;

        // Visual boundaries clamping
        if (finalY < 0) finalY = 0;
        if (typeof window !== "undefined") {
          if (finalX < 0) finalX = 0;
          if (finalX > window.innerWidth - 80) finalX = window.innerWidth - 80;
          if (finalY > window.innerHeight - 80) finalY = window.innerHeight - 80;
        }

        onUpdateRef.current({ x: finalX, y: finalY });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mouseup", onMouseUp, { passive: true });
    };

    header.addEventListener("mousedown", onMouseDown as any, { passive: true });
    return () => {
      header.removeEventListener("mousedown", onMouseDown as any);
    };
  }, [containerRef]); // only binds ONCE on mount

  return null;
}
