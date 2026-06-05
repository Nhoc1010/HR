import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Calculator as CalcIcon, 
  History, 
  Trash2
} from "lucide-react";

interface CalculatorProps {
  theme: "light" | "dark";
  employees?: any[];
}

export default function Calculator({ theme, employees = [] }: CalculatorProps) {
  // Standard Calculator State
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [equationValue, setEquationValue] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  
  // Ref for drag and drop constraints
  const standardContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Screen size state (zoom +50% larger)
  const [isZoomed, setIsZoomed] = useState<boolean>(true);

  const isLight = theme === "light";

  // Dynamic styles for standard keys
  const btnDangerClass = isLight
    ? (isZoomed
      ? "p-5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 font-extrabold rounded-2xl text-base flex items-center justify-center cursor-pointer border border-rose-200 shadow-sm transition-all duration-150"
      : "p-3 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer border border-rose-100 transition-all duration-150")
    : (isZoomed
      ? "p-5 bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 font-extrabold rounded-2xl text-base flex items-center justify-center cursor-pointer border border-rose-500/25 shadow-md transition-all duration-150"
      : "p-3 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-450 font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer border border-rose-500/10 transition-all duration-150");

  const btnDarkClass = isLight
    ? (isZoomed
      ? "p-5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-2xl text-base flex items-center justify-center cursor-pointer border border-slate-200 shadow-sm transition-all duration-150"
      : "p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-655 font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer border border-slate-150 transition-all duration-150")
    : (isZoomed
      ? "p-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-extrabold rounded-2xl text-base flex items-center justify-center cursor-pointer border border-white/10 shadow-md transition-all duration-150"
      : "p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer border border-white/5 transition-all duration-150");

  const btnOperatorClass = isLight
    ? (isZoomed
      ? "p-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 active:scale-95 font-extrabold rounded-2xl text-lg flex items-center justify-center cursor-pointer shadow-sm transition-all duration-150"
      : "p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-150 active:scale-95 font-black rounded-xl text-sm flex items-center justify-center cursor-pointer transition-all duration-150")
    : (isZoomed
      ? "p-5 bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 active:scale-95 font-extrabold rounded-2xl text-lg flex items-center justify-center cursor-pointer shadow-md transition-all duration-150"
      : "p-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 active:scale-95 font-black rounded-xl text-sm flex items-center justify-center cursor-pointer transition-all duration-150");

  const btnDigitClass = isLight
    ? (isZoomed
      ? "p-5 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-extrabold rounded-2xl text-base flex items-center justify-center cursor-pointer border border-slate-200 shadow-sm transition-all duration-150"
      : "p-3.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold rounded-xl text-sm flex items-center justify-center cursor-pointer border border-slate-200 transition-all duration-150")
    : (isZoomed
      ? "p-5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold rounded-2xl text-base flex items-center justify-center cursor-pointer border border-white/10 shadow-md transition-all duration-150"
      : "p-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-sm flex items-center justify-center cursor-pointer border border-white/5 transition-all duration-150");

  const btnEqualClass = isZoomed
    ? "p-5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-2xl text-lg flex items-center justify-center cursor-pointer shadow-xl shadow-indigo-600/30 transition-all duration-150"
    : "p-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-xl text-sm flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-600/20 transition-all duration-150";

  // Normal mode handlers
  const handleDigit = (digit: string) => {
    if (displayValue === "0") {
      setDisplayValue(digit);
    } else {
      setDisplayValue(displayValue + digit);
    }
    setEquationValue(prev => prev + digit);
  };

  const handleDecimal = () => {
    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
      setEquationValue(prev => prev + ".");
    }
  };

  const handleClear = () => {
    setDisplayValue("0");
    setPrevValue(null);
    setOperation(null);
    setEquationValue("");
  };

  const handleOperator = (op: string) => {
    setPrevValue(displayValue);
    setOperation(op);
    setDisplayValue("0");
    setEquationValue(prev => {
      const trimmed = prev.trim();
      const lastChar = trimmed.substring(trimmed.length - 1);
      if (["+", "-", "*", "/"].includes(lastChar)) {
        return trimmed.substring(0, trimmed.length - 1) + " " + op + " ";
      }
      return prev + " " + op + " ";
    });
  };

  const handlePercentage = () => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) {
      const res = val / 100;
      setDisplayValue(res.toString());
      setEquationValue(prev => prev + "%");
    }
  };

  const handleBackspace = () => {
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
      setEquationValue(prev => prev.slice(0, -1));
    } else {
      setDisplayValue("0");
      setEquationValue(prev => prev.slice(0, -1));
    }
  };

  const handleEqual = () => {
    if (!prevValue || !operation) return;
    const current = parseFloat(displayValue);
    const previous = parseFloat(prevValue);
    let result = 0;

    switch (operation) {
      case "+":
        result = previous + current;
        break;
      case "-":
        result = previous - current;
        break;
      case "*":
        result = previous * current;
        break;
      case "/":
        result = current !== 0 ? previous / current : 0;
        break;
      default:
        return;
    }

    const resStr = Number(result.toFixed(6)).toString(); // Remove trailing zeros
    const logItem = `${equationValue} = ${resStr}`;
    setHistory(prev => [logItem, ...prev].slice(0, 10)); // save last 10 entries
    setDisplayValue(resStr);
    setEquationValue(resStr);
    setPrevValue(null);
    setOperation(null);
  };

  // Keyboard support logic
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Respect default inputs
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        activeEl.tagName === "SELECT" || 
        activeEl.getAttribute("contenteditable") === "true"
      )) {
        return;
      }

      const key = e.key;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      } else if (key === ".") {
        e.preventDefault();
        handleDecimal();
      } else if (key === "+" || key === "-" || key === "*" || key === "/") {
        e.preventDefault();
        handleOperator(key);
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleEqual();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        e.preventDefault();
        handleClear();
      } else if (key === "%") {
        e.preventDefault();
        handlePercentage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [displayValue, prevValue, operation, equationValue]);

  return (
    <div className={`flex flex-col h-full gap-4 ${isLight ? "text-slate-800" : "text-slate-200"}`}>
      {/* Dynamic Header */}
      <div className={`flex items-center justify-between border-b pb-2 shrink-0 select-none ${isLight ? "border-slate-200" : "border-white/5"}`}>
        <div className="flex items-center gap-1.5">
          <CalcIcon className={`w-4 h-4 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
          <span className={`text-xs font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Máy tính tiêu chuẩn</span>
        </div>
        <span className={`text-[9px] font-mono ${isLight ? "text-indigo-600" : "text-indigo-400"}`}>Gõ phím để nhập tính toán nhanh</span>
      </div>

      <div ref={standardContainerRef} className="flex flex-col md:flex-row gap-5 flex-1 min-h-0 overflow-hidden relative">
        {/* Main Standard Keyboard & Display */}
        <motion.div 
          drag
          dragConstraints={standardContainerRef}
          dragElastic={0.15}
          dragMomentum={false}
          className={`flex-1 flex flex-col justify-between w-full mx-auto transition-colors duration-300 p-4 border rounded-2xl cursor-grab active:cursor-grabbing select-none shadow-lg z-10 ${
            isLight ? "bg-white border-slate-250 shadow-slate-200/50" : "bg-slate-900/60 border-white/10"
          }`}
        >
          {/* Display screen */}
          <div 
            className={`rounded-2xl flex flex-col justify-end text-right relative select-text transition-all duration-350 ${
              isLight ? "bg-slate-50 border border-slate-200" : "bg-slate-950/80 border border-white/5"
            } ${
              isZoomed 
                ? "p-6 h-36 mb-3 ring-1 ring-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)]" 
                : "p-4 h-24 mb-3"
            }`}
          >
            {/* Keyboard Status */}
            <div className="absolute top-2 left-3 flex items-center gap-1.5 opacity-70">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? "bg-emerald-500" : "bg-emerald-450"}`} />
              <span className={`font-semibold uppercase tracking-widest ${isLight ? "text-emerald-600" : "text-emerald-400"} ${isZoomed ? "text-[10px]" : "text-[8px]"}`}>
                Bàn phím bật
              </span>
            </div>

            {/* +50% Zoom Controls Toggle */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className={`absolute top-2 right-3 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 border ${
                isLight
                  ? (isZoomed ? "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-250")
                  : (isZoomed ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/40" : "bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800")
              }`}
              title={isZoomed ? "Thu nhỏ về 100%" : "Phóng to màn hình +50%"}
            >
              <span>{isZoomed ? "Màn hình: 150%" : "Màn hình: 100%"}</span>
            </button>

            <span className={`font-mono scroll-smooth overflow-x-auto truncate pb-1 transition-all ${
              isLight ? "text-indigo-600 animate-pulse" : "text-indigo-400"
            } ${
              isZoomed ? "text-sm" : "text-[10px]"
            }`}>
              {equationValue || "Sẵn sàng tính toán..."}
            </span>
            <span className={`font-bold font-mono tracking-tight leading-none truncate select-all transition-all duration-300 ${
              isLight ? "text-slate-900" : "text-white"
            } ${
              isZoomed ? "text-[46px] mt-1" : "text-3xl"
            }`}>
              {displayValue}
            </span>
          </div>

          {/* Buttons Layout */}
          <div className={`grid grid-cols-4 flex-1 transition-all duration-150 ${isZoomed ? "gap-4" : "gap-2"}`}>
            <button
              onClick={handleClear}
              className={btnDangerClass}
            >
              C
            </button>
            <button
              onClick={handleBackspace}
              className={btnDarkClass}
            >
              ⌫
            </button>
            <button
              onClick={handlePercentage}
              className={btnDarkClass}
            >
              %
            </button>
            <button
              onClick={() => handleOperator("/")}
              className={btnOperatorClass}
            >
              ÷
            </button>

            <button
              onClick={() => handleDigit("7")}
              className={btnDigitClass}
            >
              7
            </button>
            <button
              onClick={() => handleDigit("8")}
              className={btnDigitClass}
            >
              8
            </button>
            <button
              onClick={() => handleDigit("9")}
              className={btnDigitClass}
            >
              9
            </button>
            <button
              onClick={() => handleOperator("*")}
              className={btnOperatorClass}
            >
              ×
            </button>

            <button
              onClick={() => handleDigit("4")}
              className={btnDigitClass}
            >
              4
            </button>
            <button
              onClick={() => handleDigit("5")}
              className={btnDigitClass}
            >
              5
            </button>
            <button
              onClick={() => handleDigit("6")}
              className={btnDigitClass}
            >
              6
            </button>
            <button
              onClick={() => handleOperator("-")}
              className={btnOperatorClass}
            >
              -
            </button>

            <button
              onClick={() => handleDigit("1")}
              className={btnDigitClass}
            >
              1
            </button>
            <button
              onClick={() => handleDigit("2")}
              className={btnDigitClass}
            >
              2
            </button>
            <button
              onClick={() => handleDigit("3")}
              className={btnDigitClass}
            >
              3
            </button>
            <button
              onClick={() => handleOperator("+")}
              className={btnOperatorClass}
            >
              +
            </button>

            <button
              onClick={() => handleDigit("0")}
              className={`${btnDigitClass} col-span-2`}
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className={btnDigitClass}
            >
              .
            </button>
            <button
              onClick={handleEqual}
              className={btnEqualClass}
            >
              =
            </button>
          </div>
        </motion.div>

        {/* History Panel Side Widget */}
        <motion.div 
          drag
          dragConstraints={standardContainerRef}
          dragElastic={0.15}
          dragMomentum={false}
          className={`md:w-56 shrink-0 flex flex-col border rounded-2xl p-3.5 select-text cursor-grab active:cursor-grabbing shadow-lg z-10 transition-colors duration-300 ${
            isLight ? "border-slate-200 bg-slate-50 shadow-slate-200/50" : "border-white/10 bg-slate-950/60"
          }`}
        >
          <div className={`flex items-center justify-between pb-1 border-b mb-2.5 ${isLight ? "border-slate-200" : "border-white/5"}`}>
            <div className={`flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest pl-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              <History className={`w-3.5 h-3.5 ${isLight ? "text-indigo-600" : "text-indigo-400"}`} />
              <span>Nhật ký tính toán</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  isLight ? "hover:bg-slate-200 text-rose-600 hover:text-rose-700" : "hover:bg-white/5 text-rose-450 hover:text-rose-400"
                }`}
                title="Xóa nhật ký"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[160px] md:max-h-none text-right pr-0.5 custom-scrollbar">
            {history.length === 0 ? (
              <p className={`text-[10px] text-center py-10 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Chưa có bản ghi tính toán.</p>
            ) : (
              history.map((h, i) => (
                <div 
                  key={i} 
                  className={`py-1 border-b font-mono text-[10px] p-1 rounded transition-colors break-all ${
                    isLight ? "border-slate-100 text-slate-700 hover:bg-slate-150/70" : "border-white/3 text-slate-350 hover:bg-white/3"
                  }`}
                >
                  {h}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
