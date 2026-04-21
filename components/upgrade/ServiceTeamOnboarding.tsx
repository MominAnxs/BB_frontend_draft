'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, ArrowLeft, Check, Star, Users, Target,
  Megaphone, Calendar, MessageSquare,
  Sparkles, Award, ThumbsUp, ThumbsDown, Send,
  CheckCircle2,
  PartyPopper, Minus, AlertTriangle,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { InlineChatIncidentForm } from '../chat/InlineChatIncidentForm';
import type { InlineIncidentResult } from '../chat/InlineChatIncidentForm';
import { MonthPlanContent } from './MonthPlanContent';
// Figma asset placeholder — replace with actual image path when available
const dashboardPreview = '/images/dashboard-preview.png';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

type BusinessType = 'ecommerce' | 'leadgen';
type Phase = 'welcome' | 'month-plan' | 'feedback' | 'complete';

interface ServiceTeamOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  businessType: BusinessType;
  clientName: string;
  companyName: string;
  monthlyBudget?: string;
  selectedPlan?: string;
  onIncidentCreated?: (result: InlineIncidentResult) => void;
}

/* ═══════════════════════════════════════════════════════════════════════
   TEAM DATA
   ═══════════════════════════════════════════════════════════════════════ */

interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  intro: string;
  initials: string;
  gradient: string;
}

const ECOMMERCE_TEAM: TeamMember[] = [
  {
    name: 'Tejas Atha',
    role: 'Chief Operating Officer',
    specialty: 'Strategy & Operations',
    intro: "I oversee the entire performance operation for your account. From high-level strategy to ensuring every team member delivers results — I'm personally invested in your growth.",
    initials: 'TA',
    gradient: 'linear-gradient(135deg, #1E293B, #475569)',
  },
  {
    name: 'Chinmay Pawar',
    role: 'Performance Marketing Lead',
    specialty: 'Your single point of contact',
    intro: "I'll be your primary point of contact throughout this journey. From weekly strategy calls to performance reviews — I'm always a message away.",
    initials: 'CP',
    gradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
  },
  {
    name: 'Piyush Sharma',
    role: 'Performance Specialist',
    specialty: 'Meta & Google Ads Expert',
    intro: "I'll be managing your ad campaigns across Meta & Google. My focus is maximizing your ROAS while scaling revenue predictably.",
    initials: 'PS',
    gradient: 'linear-gradient(135deg, #204CC7, #3B82F6)',
  },
];

const LEADGEN_TEAM: TeamMember[] = [
  {
    name: 'Tejas Atha',
    role: 'Chief Operating Officer',
    specialty: 'Strategy & Operations',
    intro: "I oversee the entire performance operation for your account. From high-level strategy to ensuring every team member delivers results — I'm personally invested in your growth.",
    initials: 'TA',
    gradient: 'linear-gradient(135deg, #1E293B, #475569)',
  },
  {
    name: 'Chinmay Pawar',
    role: 'Performance Marketing Lead',
    specialty: 'Your single point of contact',
    intro: "I'll be your primary point of contact throughout this journey. From weekly strategy calls to performance reviews — I'm always a message away.",
    initials: 'CP',
    gradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
  },
  {
    name: 'Piyush Sharma',
    role: 'Performance Specialist',
    specialty: 'Meta & Google Ads Expert',
    intro: "I'll manage your lead gen campaigns to drive high-quality leads while keeping your CPL within target range and optimizing conversion funnels.",
    initials: 'PS',
    gradient: 'linear-gradient(135deg, #204CC7, #3B82F6)',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   FEEDBACK DATA
   ═══════════════════════════════════════════════════════════════════════ */

const FEEDBACK_QUESTIONS = [
  {
    id: 'team',
    question: 'How do you feel about the Brego Performance Team?',
  },
  {
    id: 'alignment',
    question: 'Are you aligned with the media plan & strategy?',
  },
  {
    id: 'satisfaction',
    question: 'How satisfied are you with the overall experience?',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED CHECK RING (from PostPaymentCompletionModal style)
   ═══════════════════════════════════════════════════════════════════════ */

function AnimatedSetupCheck() {
  return (
    <div className="relative w-[72px] h-[72px]">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1.6 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      />
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r="30" fill="none" stroke="#E5E7EB" strokeWidth="2.5" opacity="0.15" />
        <motion.circle
          cx="36" cy="36" r="30" fill="none"
          stroke="url(#setupGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 30}
          initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="setupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.6 }}
      >
        <div
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            boxShadow: '0 6px 20px -3px rgba(5,150,105,0.35)',
          }}
        >
          <motion.svg width="20" height="15" viewBox="0 0 22 16" fill="none">
            <motion.path
              d="M2 8L8 14L20 2"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.8, ease: 'easeOut' }}
            />
          </motion.svg>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PHASE INDICATOR
   ═══════════════════════════════════════════════════════════════════════ */

function PhaseIndicator({ currentPhase }: { currentPhase: Phase }) {
  const phases: { id: Phase; label: string; num: number }[] = [
    { id: 'month-plan', label: '1st Month Plan', num: 1 },
    { id: 'feedback', label: 'Feedback', num: 2 },
  ];

  const currentIdx = currentPhase === 'welcome' ? -1 : phases.findIndex(p => p.id === currentPhase);

  return (
    <div className="flex items-center gap-1.5">
      {phases.map((phase, i) => {
        const isActive = phase.id === currentPhase;
        const isDone = i < currentIdx;

        return (
          <div key={phase.id} className="flex items-center gap-1.5">
            <motion.div
              className={`w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-500 ${
                isDone
                  ? 'bg-green-500'
                  : isActive
                  ? 'bg-[#204CC7] ring-[3px] ring-blue-100'
                  : 'bg-gray-200'
              }`}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {isDone ? (
                <Check className="w-2.5 h-2.5 text-white" />
              ) : (
                <span className="text-white" style={{ fontSize: '9px', fontWeight: 700 }}>
                  {phase.num}
                </span>
              )}
            </motion.div>
            <span
              className={`hidden md:inline ${
                isActive ? 'text-gray-800' : isDone ? 'text-green-600' : 'text-gray-500'
              }`}
              style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500 }}
            >
              {phase.label}
            </span>
            {i < phases.length - 1 && (
              <div
                className={`w-5 h-[1.5px] rounded-full transition-colors duration-500 ${
                  isDone ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   STAR RATING
   ═══════════════════════════════════════════════════════════════════════ */

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1 transition-colors"
            whileTap={{ scale: 0.85 }}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hovered || value)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200'
              }`}
            />
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {(hovered || value) > 0 && (
          <motion.p
            key={hovered || value}
            className="text-gray-500"
            style={{ fontSize: '13px', fontWeight: 500 }}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {labels[hovered || value]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export function ServiceTeamOnboarding({
  isOpen,
  onComplete,
  businessType,
  clientName,
  companyName,
  monthlyBudget,
  selectedPlan,
  onIncidentCreated,
}: ServiceTeamOnboardingProps) {
  const [phase, setPhase] = useState<Phase>('welcome');

  // Month plan state
  const [activeWeek, setActiveWeek] = useState(0);

  // Feedback state
  const [teamRating, setTeamRating] = useState(0);
  const [alignmentAnswer, setAlignmentAnswer] = useState<'yes' | 'partial' | 'no' | null>(null);
  const [satisfactionRating, setSatisfactionRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentRaised, setIncidentRaised] = useState(false);

  const team = businessType === 'ecommerce' ? ECOMMERCE_TEAM : LEADGEN_TEAM;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [phase]);

  // Manager info (first team member)
  const manager = team[0];
  const canSubmitFeedback = teamRating > 0 && alignmentAnswer !== null && satisfactionRating > 0;

  const handleSubmitFeedback = useCallback(() => {
    setFeedbackSubmitted(true);
    setTimeout(() => setPhase('complete'), 2200);
  }, []);

  const firstName = clientName.split(' ')[0] || 'there';
  const planName = selectedPlan || 'Growth';

  if (!isOpen) return null;

  /* ─── WELCOME BRIDGE PHASE ─── */
  if (phase === 'welcome') {
    return (
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.10)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="relative z-10 w-full max-w-[460px] mx-4"
          initial={{ opacity: 0, scale: 0.9, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="bg-white rounded-[22px] overflow-hidden"
            style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
          >
            {/* Hero top */}
            <div
              className="relative px-8 pt-8 pb-5 text-center"
              style={{ background: 'linear-gradient(180deg, #F7F9FF 0%, #FFFFFF 100%)' }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[260px] h-[100px] rounded-full opacity-40"
                style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.10) 0%, transparent 70%)' }}
              />
              <div className="flex justify-center mb-4 relative z-10">
                <AnimatedSetupCheck />
              </div>

              <motion.h2
                className="text-gray-900 mb-1"
                style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Setup Complete!
              </motion.h2>
              <motion.p
                className="text-gray-500"
                style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.6 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Your <span style={{ fontWeight: 600, color: '#204CC7' }}>{planName}</span> plan is active and fully configured
              </motion.p>
            </div>

            {/* Content */}
            <div className="px-8 pb-7">
              {/* What happens next */}
              <motion.div
                className="mb-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p
                  className="text-gray-500 uppercase tracking-[0.08em] mb-2.5 px-0.5 text-center"
                  style={{ fontSize: '13px', fontWeight: 700 }}
                >
                  What happens next
                </p>
                <div className="space-y-2">
                  {[
                    { num: 1, label: 'Review your 1st Month plan', icon: Target, active: true },
                    { num: 2, label: 'Share your feedback & we go live', icon: Sparkles, active: false },
                  ].map((step, i) => (
                    <motion.div
                      key={step.num}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        step.active
                          ? 'border-[#204CC7]/15 bg-blue-50/40'
                          : 'border-gray-100 bg-gray-50/30'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          step.active ? '' : ''
                        }`}
                        style={{
                          background: step.active
                            ? 'linear-gradient(135deg, #204CC7, #4F46E5)'
                            : 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                        }}
                      >
                        <step.icon className={`w-3.5 h-3.5 ${step.active ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <span
                        className={step.active ? 'text-gray-900' : 'text-gray-500'}
                        style={{ fontSize: '13px', fontWeight: step.active ? 600 : 400 }}
                      >
                        {step.label}
                      </span>
                      {step.active && (
                        <motion.span
                          className="ml-auto text-[#204CC7]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.1 }}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Team initials row preview */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex -space-x-2">
                  {team.map((m, i) => (
                    <motion.div
                      key={m.name}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ background: m.gradient, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.05 + i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <span className="text-white" style={{ fontSize: '10px', fontWeight: 700 }}>{m.initials}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  className="text-gray-500 ml-1"
                  style={{ fontSize: '13px', fontWeight: 400 }}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  Your plan is ready
                </motion.p>
              </motion.div>

              {/* CTA */}
              <motion.button
                onClick={() => setPhase('month-plan')}
                className="w-full py-3 text-white rounded-2xl flex items-center justify-center gap-2 group"
                style={{
                  background: 'linear-gradient(135deg, #204CC7 0%, #4338CA 100%)',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow: '0 4px 16px -2px rgba(32,76,199,0.32)',
                }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15 }}
                whileHover={{ scale: 1.01, boxShadow: '0 6px 22px -2px rgba(32,76,199,0.42)' }}
                whileTap={{ scale: 0.98 }}
              >
                View your 1st Month Plan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <motion.p
                className="text-center text-gray-500 mt-3"
                style={{ fontSize: '13px', fontWeight: 400 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.25 }}
              >
                Takes about 3 minutes
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ─── COMPLETE PHASE ─── */
  if (phase === 'complete') {
    return (
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(4px)' }}
        />
        <motion.div
          className="relative z-10 w-full max-w-[460px] mx-4 bg-white rounded-[22px] overflow-hidden flex flex-col"
          style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)', maxHeight: '85vh' }}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Hero */}
          <div
            className="relative px-8 pt-8 pb-4 text-center"
            style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[260px] h-[100px] rounded-full opacity-50"
              style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.10) 0%, transparent 70%)' }}
            />
            <motion.div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center relative z-10"
              style={{
                background: 'linear-gradient(135deg, #059669, #10B981)',
                boxShadow: '0 8px 24px -4px rgba(5,150,105,0.3)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            >
              <PartyPopper className="w-7 h-7 text-white" />
            </motion.div>

            <motion.h2
              className="text-gray-900 mb-1"
              style={{ fontSize: '20px', fontWeight: 700 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              You're Truly Onboarded!
            </motion.h2>
            <motion.p
              className="text-gray-500 mb-1"
              style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.6 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {companyName}'s performance marketing journey begins now.
            </motion.p>
          </div>

          {/* Content */}
          <div className="px-8 pb-7 overflow-y-auto flex-1 min-h-0">
            {/* Checklist */}
            <motion.div
              className="flex flex-col gap-2 mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: Users, text: 'Dedicated team assigned & introduced' },
                { icon: Calendar, text: '1st Month plan ready to execute' },
                { icon: MessageSquare, text: 'Your feedback received' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-green-50/50 border border-green-100/50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.07 }}
                >
                  <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Dashboard preview */}
            <motion.div
              className="rounded-xl overflow-hidden border border-gray-100 mb-5"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="relative">
                <ImageWithFallback
                  src={dashboardPreview}
                  alt="Your Performance Dashboard"
                  className="w-full h-auto"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(255,255,255,0.8) 100%)' }}
                />
              </div>
            </motion.div>

          </div>

          {/* Sticky footer */}
          <div className="px-8 pb-7 pt-3 shrink-0" style={{ boxShadow: '0 -8px 16px -4px rgba(0,0,0,0.04)' }}>
            <motion.button
              onClick={onComplete}
              className="w-full py-3 text-white rounded-2xl flex items-center justify-center gap-2 group"
              style={{
                background: 'linear-gradient(135deg, #204CC7 0%, #4338CA 100%)',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 4px 16px -2px rgba(32,76,199,0.32)',
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.01, boxShadow: '0 6px 22px -2px rgba(32,76,199,0.42)' }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ─── MAIN 3-PHASE LAYOUT ─── */
  return (
    <motion.div
      className="fixed inset-0 z-[9998] flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(4px)' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-[720px] mx-auto my-4 sm:my-6 bg-white rounded-[22px] overflow-hidden flex flex-col"
        style={{
          boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
          maxHeight: 'calc(100vh - 32px)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
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
              <Megaphone className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
                Performance Marketing Kickoff
              </p>
              <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                {companyName} · {planName} Plan
              </p>
            </div>
          </div>
          <PhaseIndicator currentPhase={phase} />
        </div>

        {/* ── Scrollable Content ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ═══════════════════════════════════════════════════
               PHASE 2: 1ST MONTH PLAN
               ═══════════════════════════════════════════════════ */}
            {phase === 'month-plan' && (
              <motion.div
                key="month-plan"
                className="p-5 sm:p-6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <MonthPlanContent
                  businessType={businessType}
                  activeWeek={activeWeek}
                  onActiveWeekChange={setActiveWeek}
                />
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════
               PHASE 3: CLIENT FEEDBACK
               ═══════════════════════════════════════════════════ */}
            {phase === 'feedback' && (
              <motion.div
                key="feedback"
                className="p-5 sm:p-6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {feedbackSubmitted ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                      style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-gray-900 mb-1" style={{ fontSize: '18px', fontWeight: 700 }}>
                      Thank you, {firstName}!
                    </h3>
                    <p className="text-gray-500" style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.5 }}>
                      Your feedback means the world to us.<br />Let's make this journey incredible together.
                    </p>
                    <motion.div
                      className="flex items-center gap-1.5 mt-4 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="w-1 h-1 rounded-full bg-gray-300 animate-pulse" />
                      <p style={{ fontSize: '13px', fontWeight: 400 }}>Preparing your dashboard</p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="text-center mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}
                      >
                        <Award className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="text-gray-900 mb-1" style={{ fontSize: '18px', fontWeight: 700 }}>
                        One last thing — your feedback
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.6 }}>
                        Help us understand your confidence level before we kick things off. This takes 30 seconds.
                      </p>
                    </motion.div>

                    {/* Q1: Team Rating */}
                    <motion.div
                      className="rounded-2xl border border-gray-200/60 p-5 mb-3"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="text-gray-900 mb-3 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {FEEDBACK_QUESTIONS[0].question}
                      </p>
                      <StarRating value={teamRating} onChange={setTeamRating} />
                    </motion.div>

                    {/* Q2: Alignment */}
                    <motion.div
                      className="rounded-2xl border border-gray-200/60 p-5 mb-3"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16 }}
                    >
                      <p className="text-gray-900 mb-3 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {FEEDBACK_QUESTIONS[1].question}
                      </p>
                      <div className="flex items-center justify-center gap-2.5">
                        {([
                          { id: 'yes' as const, label: 'Fully aligned', icon: ThumbsUp, color: 'green' },
                          { id: 'partial' as const, label: 'Partially', icon: Minus, color: 'amber' },
                          { id: 'no' as const, label: 'Need changes', icon: ThumbsDown, color: 'red' },
                        ] as const).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setAlignmentAnswer(opt.id)}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                              alignmentAnswer === opt.id
                                ? opt.color === 'green'
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : opt.color === 'amber'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-white border-gray-200/60 text-gray-500 hover:border-gray-300'
                            }`}
                            style={{ boxShadow: alignmentAnswer === opt.id ? undefined : '0 1px 2px rgba(0,0,0,0.02)' }}
                          >
                            <opt.icon className="w-4 h-4" />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Q3: Satisfaction */}
                    <motion.div
                      className="rounded-2xl border border-gray-200/60 p-5 mb-3"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 }}
                    >
                      <p className="text-gray-900 mb-3 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {FEEDBACK_QUESTIONS[2].question}
                      </p>
                      <div className="flex items-center justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((level) => {
                          const labels = ['', 'Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];
                          const emojis = ['', '😞', '😐', '🙂', '😊', '🤩'];
                          const isActive = satisfactionRating === level;

                          return (
                            <button
                              key={level}
                              onClick={() => setSatisfactionRating(level)}
                              className={`flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl border transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#204CC7]/5 border-[#204CC7]/20 text-[#204CC7]'
                                  : 'bg-white border-gray-200/60 text-gray-500 hover:border-gray-300'
                              }`}
                              style={{ boxShadow: isActive ? undefined : '0 1px 2px rgba(0,0,0,0.02)' }}
                            >
                              <span style={{ fontSize: '20px' }}>{emojis[level]}</span>
                              <span style={{ fontSize: '13px', fontWeight: 500 }}>{labels[level]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Optional note */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 }}
                    >
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="Anything else you'd like to share? (Optional)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200/60 bg-white text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#204CC7]/20 focus:border-[#204CC7]/30 transition-all"
                        style={{ fontSize: '13px', fontWeight: 400, minHeight: '68px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
                        rows={3}
                      />
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        {!(['complete', 'welcome'] as Phase[]).includes(phase) && !(phase === 'feedback' && feedbackSubmitted) && (
          <div
            className="px-5 sm:px-6 py-3.5 border-t border-gray-100 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%)' }}
          >
            {phase === 'feedback' ? (
              <button
                onClick={() => setPhase('month-plan')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {phase === 'month-plan' && (
              <motion.button
                onClick={() => setPhase('feedback')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all duration-300 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #204CC7 0%, #4338CA 100%)',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px -2px rgba(32,76,199,0.3)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to Feedback
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {phase === 'feedback' && !feedbackSubmitted && (
              <div className="flex items-center gap-2.5">
                {incidentRaised ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'Manrope, sans-serif',
                      color: '#059669',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Incident Raised
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setShowIncidentForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'Manrope, sans-serif',
                      color: '#204CC7',
                      background: 'rgba(32,76,199,0.06)',
                      border: '1px solid rgba(32,76,199,0.15)',
                    }}
                    whileHover={{ scale: 1.02, background: 'rgba(32,76,199,0.10)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Raise Incident
                  </motion.button>
                )}
                <motion.button
                  onClick={handleSubmitFeedback}
                  disabled={!canSubmitFeedback}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all duration-300 ${
                    canSubmitFeedback ? 'opacity-100 cursor-pointer' : 'opacity-35 cursor-not-allowed'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #204CC7 0%, #4338CA 100%)',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'Manrope, sans-serif',
                    boxShadow: canSubmitFeedback ? '0 4px 14px -2px rgba(32,76,199,0.3)' : 'none',
                  }}
                  whileHover={canSubmitFeedback ? { scale: 1.02 } : {}}
                  whileTap={canSubmitFeedback ? { scale: 0.98 } : {}}
                >
                  <Send className="w-3.5 h-3.5" />
                  Done
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Incident Form Portal */}
      {showIncidentForm && (
        <InlineChatIncidentForm
          defaultService="Performance Marketing"
          onClose={() => setShowIncidentForm(false)}
          onSubmit={(result: InlineIncidentResult) => {
            setShowIncidentForm(false);
            setIncidentRaised(true);
            onIncidentCreated?.(result);
          }}
        />
      )}
    </motion.div>
  );
}
