'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BRAND = '#204CC7';
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Parse display date like "Tue, 11 Feb" to a Date object
export function parseDisplayDate(display: string): Date | null {
  try {
    const match = display.match(/(\d{1,2})\s+(\w+)/);
    if (!match) return null;
    const day = parseInt(match[1], 10);
    const monthStr = match[2];
    const monthIdx = SHORT_MONTHS.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
    if (monthIdx === -1) return null;
    // Default to current year, or next year if month already passed
    const now = new Date();
    let year = now.getFullYear();
    const candidate = new Date(year, monthIdx, day);
    if (candidate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      year += 1;
    }
    return new Date(year, monthIdx, day);
  } catch {
    return null;
  }
}

// Format a Date to display string like "Tue, 11 Feb"
function formatDisplayDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DatePickerPopoverProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  isOverdue?: boolean;
  compact?: boolean;
}

export function DatePickerPopover({ currentDate, onDateChange, isOverdue, compact = false }: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parsed = parseDisplayDate(currentDate);
  const now = new Date();
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? now.getMonth());

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Reset view when opening
  useEffect(() => {
    if (open && parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [open]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const selectedDay = parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth
    ? parsed.getDate()
    : null;

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    onDateChange(formatDisplayDate(d));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1.5 flex-shrink-0 rounded-lg transition-colors group/date ${
          compact ? 'px-0.5 py-0.5 -mx-0.5 -my-0.5' : 'px-1.5 py-0.5 -mx-1.5 -my-0.5'
        } ${isOverdue ? 'hover:bg-red-50 bg-red-50/50' : 'hover:bg-green-50'}`}
      >
        <Calendar className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${isOverdue ? 'text-red-500' : 'text-green-600'}`} />
        <span className={`whitespace-nowrap transition-colors ${
          compact ? 'text-[11.5px]' : 'text-[13px]'
        } ${
          isOverdue
            ? 'text-red-500 group-hover/date:text-red-600'
            : 'text-gray-500 group-hover/date:text-green-700'
        }`} style={{ fontWeight: isOverdue ? 600 : 500 }}>{currentDate}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${compact ? 'left-0' : 'right-0'} top-full mt-2 w-[260px] bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden z-50 select-none`}
            style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Month/Year Nav */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-3 pt-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] text-gray-400 py-1" style={{ fontWeight: 600 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 px-3 pb-3">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const selected = selectedDay === day;
                const todayMark = isToday(day);
                return (
                  <button
                    key={day}
                    onClick={() => selectDay(day)}
                    className={`w-8 h-8 mx-auto rounded-lg text-xs flex items-center justify-center transition-all duration-100 ${
                      selected
                        ? 'text-white'
                        : todayMark
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={selected ? { backgroundColor: BRAND, fontWeight: 600 } : { fontWeight: todayMark ? 600 : 400 }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Today shortcut */}
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                onClick={() => selectDay(today.getDate())}
                className="text-xs hover:underline transition-colors"
                style={{ color: BRAND, fontWeight: 500 }}
                onMouseDown={() => {
                  setViewYear(today.getFullYear());
                  setViewMonth(today.getMonth());
                }}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
