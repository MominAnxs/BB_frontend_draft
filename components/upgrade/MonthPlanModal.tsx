'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, X } from 'lucide-react';
import { MonthPlanContent, type BusinessType } from './MonthPlanContent';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getCurrentWeekOfMonth() {
  const now = new Date();
  // Week 1 = days 1-7, Week 2 = 8-14, etc. Cap at 4.
  return Math.min(4, Math.max(1, Math.ceil(now.getDate() / 7)));
}

interface MonthPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessType?: BusinessType;
  selectedPlan?: string;
}

export function MonthPlanModal({
  isOpen,
  onClose,
  businessType = 'ecommerce',
  selectedPlan = 'Growth',
}: MonthPlanModalProps) {
  const currentWeekIdx = useMemo(() => getCurrentWeekOfMonth() - 1, []);
  const monthName = useMemo(() => MONTH_NAMES[new Date().getMonth()], []);
  const year = useMemo(() => new Date().getFullYear(), []);
  const [activeWeek, setActiveWeek] = useState(currentWeekIdx);
  const [mounted, setMounted] = useState(false);

  // Portal mount guard (SSR-safe)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to current week every time the modal is opened
  useEffect(() => {
    if (isOpen) setActiveWeek(currentWeekIdx);
  }, [isOpen, currentWeekIdx]);

  // Prevent background scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center overflow-y-auto py-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-[720px] mx-4 bg-white rounded-[22px] overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
              maxHeight: 'calc(100vh - 32px)',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Header ── */}
            <div
              className="px-5 sm:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(180deg, #FAFBFF 0%, #FFFFFF 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #204CC7, #6366F1)' }}
                >
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
                    1st Month Plan
                  </p>
                  <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                    {monthName} {year} · {selectedPlan} Plan
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close month plan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Scrollable content (matches Setup Complete modal exactly) ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 sm:p-6">
                <MonthPlanContent
                  businessType={businessType}
                  activeWeek={activeWeek}
                  onActiveWeekChange={setActiveWeek}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
