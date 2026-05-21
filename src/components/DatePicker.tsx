import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  id: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS_VN = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

const DAYS_VN = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function DatePicker({
  value,
  onChange,
  label,
  id,
  minYear = 1940,
  maxYear = 2040
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date
  const parseCurrentDateStr = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    return new Date();
  };

  const initialDate = parseCurrentDateStr(value);
  
  // Grid/View state
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  // Keep view state in sync when the parent's value changes
  useEffect(() => {
    const freshDate = parseCurrentDateStr(value);
    setViewMonth(freshDate.getMonth());
    setViewYear(freshDate.getFullYear());
  }, [value]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date helper to YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  // Human date format VN to show on inputs (e.g. 20/05/2026)
  const getDisplayValue = () => {
    if (!value) return "Chọn ngày...";
    try {
      const parts = value.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {}
    return value;
  };

  // Months lists
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // Calendar calculations
  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

  const daysCount = getDaysInMonth(viewMonth, viewYear);
  const firstDayOfWeek = getFirstDayOfMonth(viewMonth, viewYear);

  // Days of previous month to pad correctly
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevDaysCount = getDaysInMonth(prevMonth, prevYear);

  const prevMonthPaddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const dayNum = prevDaysCount - firstDayOfWeek + i + 1;
    return {
      day: dayNum,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false
    };
  });

  const currentMonthDays = Array.from({ length: daysCount }, (_, i) => ({
    day: i + 1,
    month: viewMonth,
    year: viewYear,
    isCurrentMonth: true
  }));

  // Render exactly 42 slots for grid harmony (6 weeks)
  const remainingSlotsCount = 42 - (prevMonthPaddingDays.length + currentMonthDays.length);
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextMonthPaddingDays = Array.from({ length: remainingSlotsCount }, (_, i) => ({
    day: i + 1,
    month: nextMonth,
    year: nextYear,
    isCurrentMonth: false
  }));

  const allGridDays = [...prevMonthPaddingDays, ...currentMonthDays, ...nextMonthPaddingDays];

  // Navigations
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => Math.max(minYear, prev - 1));
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => Math.min(maxYear, prev + 1));
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const selectDate = (year: number, month: number, day: number) => {
    const formatted = formatDateString(year, month, day);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isSelected = (day: number, month: number, year: number) => {
    const formatted = formatDateString(year, month, day);
    return formatted === value;
  };

  return (
    <div className="space-y-1 relative w-full text-left" ref={containerRef} id={`datepicker-container-${id}`}>
      {label && <label className="text-xs text-slate-400 font-medium block">{label}</label>}
      
      {/* Input button interface */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500/80 focus:outline-none rounded-xl text-white text-sm text-left flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all active:scale-[0.99]"
        >
          <span className={`${value ? "text-white" : "text-white/30"} font-medium`}>
            {getDisplayValue()}
          </span>
          <CalendarIcon className="w-4 h-4 text-violet-400" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-white overflow-hidden"
          >
            {/* Header: Month/Year Dropdowns */}
            <div className="flex items-center justify-between gap-1.5 mb-3.5 pb-2.5 border-b border-white/5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 flex-1 justify-center">
                {/* Month Dropdown */}
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-900/80 border border-white/5 rounded-lg text-xs font-semibold px-1.5 py-1 text-violet-300 focus:outline-none focus:border-violet-500 cursor-pointer max-w-[95px]"
                >
                  {MONTHS_VN.map((m, idx) => (
                    <option key={idx} value={idx} className="bg-slate-950 text-white">
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  className="bg-slate-900/80 border border-white/5 rounded-lg text-xs font-semibold px-1.5 py-1 text-violet-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y} className="bg-slate-950 text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-slate-500 tracking-wider">
              {DAYS_VN.map((day, idx) => (
                <div key={idx} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid of Days */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {allGridDays.map((slot, index) => {
                const active = isSelected(slot.day, slot.month, slot.year);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectDate(slot.year, slot.month, slot.day)}
                    className={`h-7 w-7 mx-auto rounded-lg text-[11px] font-medium transition-all flex items-center justify-center cursor-pointer ${
                      active
                        ? "bg-violet-600 text-white font-bold shadow-[0_0_12px_rgba(109,40,217,0.4)]"
                        : slot.isCurrentMonth
                          ? "text-slate-200 hover:bg-white/5"
                          : "text-slate-600 hover:bg-white/3 text-[10px]"
                    }`}
                  >
                    {slot.day}
                  </button>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px]">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1 rounded-md bg-violet-650/15 border border-violet-500/20 text-violet-300 hover:bg-violet-650/25 transition-all text-[10px] font-bold cursor-pointer"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white font-medium transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
