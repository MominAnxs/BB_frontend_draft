'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export type Priority = 'P1' | 'P2' | 'P3';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string; description: string }> = {
  P1: { label: 'P1', color: '#DC2626', bg: '#FEF2F2', border: 'rgba(220, 38, 38, 0.15)', description: 'Urgent' },
  P2: { label: 'P2', color: '#D97706', bg: '#FFFBEB', border: 'rgba(217, 119, 6, 0.15)', description: 'High' },
  P3: { label: 'P3', color: '#6B7280', bg: '#F3F4F6', border: 'rgba(107, 114, 128, 0.12)', description: 'Normal' },
};

interface PriorityBadgeProps {
  priority: Priority;
  onPriorityChange?: (newPriority: Priority) => void;
  compact?: boolean;
}

export function PriorityBadge({ priority, onPriorityChange, compact = false }: PriorityBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const config = PRIORITY_CONFIG[priority];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!onPriorityChange) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] flex-shrink-0"
        style={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.color }}
        />
        {config.label}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] transition-all duration-150 hover:opacity-80"
        style={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.color }}
        />
        {config.label}
        {!compact && <ChevronDown className="w-2.5 h-2.5 ml-0.5" style={{ color: config.color }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-[140px] bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl overflow-hidden z-50"
            style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {(['P1', 'P2', 'P3'] as Priority[]).map((p) => {
                const c = PRIORITY_CONFIG[p];
                const isSelected = p === priority;
                return (
                  <button
                    key={p}
                    onClick={() => { onPriorityChange(p); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100 ${
                      isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{c.label}</span>
                      <span className="text-[10px] text-gray-400 ml-1.5">{c.description}</span>
                    </div>
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="flex-shrink-0">
                        <path d="M1 4L3.5 6.5L9 1" stroke={c.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
