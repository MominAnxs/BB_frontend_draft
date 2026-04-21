'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MOOD_EMOJIS, generateWeekData } from './WeeklyReportModal';
import { MonthPlanModal } from './MonthPlanModal';

type ServiceType = 'marketing' | 'finance';

/* ─────────── feedback persistence (local, read-only in this card) ─────────── */
interface FeedbackEntry {
  weekNumber: number;
  rating: number;
  note: string;
  timestamp: number;
}

function loadFeedbackHistory(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem('brego_weekly_feedback');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/* ─────────── current week of month helper ─────────── */
function getCurrentWeekOfMonth() {
  const now = new Date();
  return Math.min(4, Math.ceil(now.getDate() / 7));
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ═══════════════════════════════════════════════
   WeeklyPulseCard — compact sidebar widget
   Clean, minimal, delightful — no rings or bars,
   just a floating mood emoji, crisp hierarchy, and
   a soft blue gradient surface.
   ═══════════════════════════════════════════════ */
interface WeeklyPulseCardProps {
  serviceType?: ServiceType;
  selectedPlan?: string;
}

export function WeeklyPulseCard({ serviceType = 'marketing', selectedPlan = 'Growth' }: WeeklyPulseCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);

  useEffect(() => {
    setFeedbackHistory(loadFeedbackHistory());
  }, []);

  const currentWeek = useMemo(() => getCurrentWeekOfMonth(), []);
  const monthName = useMemo(() => MONTH_NAMES[new Date().getMonth()], []);
  const data = useMemo(() => generateWeekData(currentWeek, serviceType), [currentWeek, serviceType]);

  const currentWeekFeedback = feedbackHistory.find(f => f.weekNumber === data.weekNumber);
  const satisfactionIndex = currentWeekFeedback ? currentWeekFeedback.rating : data.satisfactionIndex;
  const mood = MOOD_EMOJIS[satisfactionIndex];

  return (
    <>
      <div className="relative mb-3">
        <motion.div
          className="relative overflow-hidden rounded-2xl cursor-pointer group"
          style={{
            background: 'linear-gradient(140deg, #F8FAFF 0%, #EFF3FF 55%, #E7EDFF 100%)',
            border: '1px solid rgba(32,76,199,0.10)',
            boxShadow:
              '0 1px 2px rgba(15,23,42,0.04), 0 6px 18px rgba(32,76,199,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          onClick={() => setShowModal(true)}
        >
          {/* Top-right soft blue orb */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              top: -30,
              right: -30,
              width: 110,
              height: 110,
              background:
                'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.22), rgba(32,76,199,0.04) 60%, transparent 75%)',
              filter: 'blur(2px)',
            }}
          />
          {/* Bottom-left soft highlight */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              bottom: -40,
              left: -20,
              width: 120,
              height: 120,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.7), rgba(255,255,255,0) 65%)',
            }}
          />

          {/* Floating sparkles */}
          <motion.div
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{ top: 18, right: 44, background: '#6366F1' }}
            animate={{ y: [0, -3, 0], opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ top: 38, right: 18, width: 3, height: 3, background: '#204CC7' }}
            animate={{ y: [0, -2, 0], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
          <motion.div
            className="absolute w-0.5 h-0.5 rounded-full pointer-events-none"
            style={{ bottom: 58, left: 24, background: '#6366F1' }}
            animate={{ y: [0, -2, 0], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          />

          <div className="relative p-4">
            {/* ── Eyebrow ── */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                    style={{ background: '#204CC7' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: '#204CC7' }}
                  />
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#204CC7',
                  }}
                >
                  WEEKLY PULSE
                </span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  fontFamily: 'Manrope, sans-serif',
                  color: '#64748B',
                  letterSpacing: '0.02em',
                }}
              >
                {data.periodLabel}
              </span>
            </div>

            {/* ── Hero row ── */}
            <div className="flex items-center gap-3">
              {/* Emoji with soft halo (no ring) */}
              <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
                {/* Soft glow backdrop */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(224,231,255,0.9) 55%, rgba(199,210,254,0.6) 100%)',
                    boxShadow:
                      '0 6px 14px rgba(32,76,199,0.12), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(32,76,199,0.08)',
                  }}
                />
                {/* Floating emoji */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.15 }}
                >
                  <motion.span
                    style={{ fontSize: '28px', lineHeight: 1, display: 'inline-block' }}
                    animate={{ y: [0, -2, 0], rotate: [0, -4, 4, 0] }}
                    transition={{
                      y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
                      rotate: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  >
                    {mood.emoji}
                  </motion.span>
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'Manrope, sans-serif',
                    color: '#0F172A',
                    lineHeight: 1.15,
                    letterSpacing: '-0.015em',
                  }}
                >
                  Week {currentWeek} · {monthName}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'Manrope, sans-serif',
                    color: mood.color,
                    marginTop: 3,
                    letterSpacing: '0.02em',
                  }}
                >
                  {mood.label}
                </div>
              </div>
            </div>

            {/* ── CTA ── */}
            <button
              className="mt-4 w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background:
                  'linear-gradient(135deg, rgba(32,76,199,0.08), rgba(99,102,241,0.08))',
                border: '1px solid rgba(32,76,199,0.15)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                  color: '#204CC7',
                  letterSpacing: '0.01em',
                }}
              >
                View month plan
              </span>
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: '#204CC7' }}
              />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <MonthPlanModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedPlan={selectedPlan}
      />
    </>
  );
}
