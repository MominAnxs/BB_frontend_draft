'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, ArrowLeft, Check, Star, Users, Target,
  FileText, IndianRupee, BarChart3, BookOpen,
  Calendar, ChevronRight, MessageSquare,
  Sparkles, Award, ThumbsUp, ThumbsDown, Send,
  Shield, CheckCircle2, Calculator,
  PartyPopper, Minus, AlertTriangle, ClipboardList,
  Receipt, Landmark, PieChart, Briefcase as BriefcaseBusiness, Info,
} from 'lucide-react';
import { InlineChatIncidentForm } from '../chat/InlineChatIncidentForm';
import type { InlineIncidentResult } from '../chat/InlineChatIncidentForm';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

type Phase = 'welcome' | 'team-intro' | 'service-plan' | 'feedback' | 'complete';

interface AccountsTeamOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  clientName: string;
  companyName: string;
  selectedPlan?: string;
  businessType?: string;
  revenueRange?: string;
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

const ACCOUNTS_TEAM: TeamMember[] = [
  {
    name: 'Tejas Atha',
    role: 'Chief Operating Officer',
    specialty: 'Strategy & Operations',
    intro: "I personally oversee every Accounts & Taxation engagement at Brego. From the moment we set up your books to your monthly financial reviews — I'm here to make sure everything runs like clockwork.",
    initials: 'TA',
    gradient: 'linear-gradient(135deg, #1E293B, #475569)',
  },
  {
    name: 'Zubear Shaikh',
    role: 'Accounts & Taxation Lead',
    specialty: 'Your single point of contact',
    intro: "I'll be managing your books end-to-end — daily bookkeeping, monthly reconciliations, and MIS reports. Think of me as your outsourced CFO who's always just a message away.",
    initials: 'ZS',
    gradient: 'linear-gradient(135deg, #C026D3, #E879F9)',
  },
  {
    name: 'Irshad Qureshi',
    role: 'Accounts & Taxation Specialist',
    specialty: 'GST, TDS & ITR Expert',
    intro: "I take care of all your tax filings — GST returns, TDS compliance, advance tax, and annual ITR. My goal is simple: zero penalties, maximum savings, and complete peace of mind for you.",
    initials: 'IQ',
    gradient: 'linear-gradient(135deg, #2563EB, #60A5FA)',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   FINANCE VARIANT RESOLVER
   Two accounts & taxation flows — one tuned for E-Commerce / Restaurants
   (marketplace reconciliations, multi-channel settlements) and one for
   Trading / Manufacturing / Services (vendor ledgers, stock, job-work).
   ═══════════════════════════════════════════════════════════════════════ */

type FinanceVariant = 'ecommerce-restaurants' | 'trading-manufacturing';

function resolveFinanceVariant(bt?: string): FinanceVariant {
  if (!bt) return 'trading-manufacturing';
  const n = bt.toLowerCase();
  if (
    n.includes('e-commerce') ||
    n.includes('ecommerce') ||
    n.includes('restaurant') ||
    n === 'ecommerce-restaurants'
  ) {
    return 'ecommerce-restaurants';
  }
  return 'trading-manufacturing';
}

/* ═══════════════════════════════════════════════════════════════════════
   MONTH 1 PLAN DATA — two variants
   ═══════════════════════════════════════════════════════════════════════ */

interface WeekPlan {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  note?: string;
  icon: typeof Target;
}

// ── E-Commerce / Restaurants — marketplace & multi-channel focus ──
const ECOMMERCE_RESTAURANT_WEEKS: WeekPlan[] = [
  {
    week: 1,
    title: 'Onboarding & Channel Setup',
    description: 'We map every sales channel and pull all your settlement data',
    tasks: [
      'Share your Tally / Zoho Books / Shopify / POS access with our team',
      'We pull last 12 months of marketplace statements — Amazon, Flipkart, Meesho, Swiggy, Zomato',
      'Payment gateway & COD settlements (Razorpay, Stripe, Paytm, Shiprocket) aggregated',
      'A shared workspace is set up with channel-wise folders',
    ],
    note: 'Selling on multiple marketplaces? We handle all channel reconciliations in one place — no more spreadsheet juggling.',
    icon: ClipboardList,
  },
  {
    week: 2,
    title: 'Marketplace & Settlement Reconciliation',
    description: 'We match every payout with your bank and flag missed credits',
    tasks: [
      'Marketplace settlement reports reconciled against bank credits',
      'Payment gateway fees, TCS deductions & commissions cross-verified',
      'Returns, refunds & cancellations matched line-by-line',
      'COD remittances from delivery partners reconciled to the rupee',
    ],
    icon: BookOpen,
  },
  {
    week: 3,
    title: 'Compliance Setup',
    description: 'Multi-state GST, TCS on marketplaces & e-invoicing — all wired up',
    tasks: [
      'GST on multi-state B2C sales mapped per marketplace',
      'TCS deducted by marketplaces claimed in GSTR-2B & ITC reconciled',
      'E-Invoice portal configured for high-volume invoicing',
      'Restaurant GST composition / regular scheme reviewed (if applicable)',
    ],
    icon: Shield,
  },
  {
    week: 4,
    title: 'First Deliverables',
    description: 'Channel-wise P&L and SKU profitability — delivered on time',
    tasks: [
      'GSTR-1 & GSTR-3B filed with marketplace TCS adjustments',
      'Channel-wise P&L (Amazon, Flipkart, Swiggy, dine-in, website)',
      'SKU-level profitability report — what’s making money, what’s not',
      'Strategy call to review channel mix & plan Month 2 together',
    ],
    icon: BarChart3,
  },
];

// ── Trading, Manufacturing or Services — vendor, stock & ledger focus ──
const TRADING_MANUFACTURING_WEEKS: WeekPlan[] = [
  {
    week: 1,
    title: 'Onboarding & Setup',
    description: 'We collect your records and get everything organized from day one',
    tasks: [
      'Share your Tally / Zoho Books / ERP access with our team',
      'We gather last 12 months of bank statements & begin reconciliation',
      'Previous GST returns, TDS filings & advance tax workings reviewed',
      'A shared workspace is set up for seamless document exchange',
    ],
    note: 'Already have someone managing your books? No problem — we\u2019ll coordinate with them seamlessly to ensure a smooth transition.',
    icon: ClipboardList,
  },
  {
    week: 2,
    title: 'Books Review & Clean-up',
    description: 'Party ledgers, stock and job-work — we clean every corner',
    tasks: [
      'Full ledger review — party-wise debtors & creditors reconciled',
      'Stock ledger & inventory valuation verified (manufacturing)',
      'Job-work register & movement of goods tallied',
      'Misposted entries corrected; clean opening balances prepared',
    ],
    icon: BookOpen,
  },
  {
    week: 3,
    title: 'Compliance Setup',
    description: 'GST, TDS on contracts, E-way bills and advance tax — all aligned',
    tasks: [
      'GSTR-1 / 2A / 3B with ITC reconciliation — no credit left unclaimed',
      'TDS on professional services, contracts & rent set up correctly',
      'E-way bill portal configured for inter-state movement',
      'Advance tax liability mapped for the current FY',
    ],
    icon: Shield,
  },
  {
    week: 4,
    title: 'First Deliverables',
    description: 'Vendor, debtor and cost-center reports — delivered on time',
    tasks: [
      'GSTR-1 & GSTR-3B filed for the current period',
      'Vendor-wise outstanding & debtor ageing report',
      'P&L with cost-center / product-line breakdown',
      'Strategy call to review working capital & plan Month 2 together',
    ],
    icon: BarChart3,
  },
];

function getAccountsWeeks(variant: FinanceVariant): WeekPlan[] {
  return variant === 'ecommerce-restaurants' ? ECOMMERCE_RESTAURANT_WEEKS : TRADING_MANUFACTURING_WEEKS;
}

/* ═══════════════════════════════════════════════════════════════════════
   SERVICE SCOPE (read-only deliverables) — two variants
   ═══════════════════════════════════════════════════════════════════════ */

interface ServiceDeliverable {
  id: string;
  label: string;
  frequency: string;
  description: string;
  icon: typeof Target;
}

// ── E-Commerce / Restaurants deliverables ──
const ECOMMERCE_RESTAURANT_DELIVERABLES: ServiceDeliverable[] = [
  {
    id: 'bookkeeping',
    label: 'Bookkeeping & Marketplace Reconciliation',
    frequency: 'Monthly',
    description: 'Daily transactions, payment gateway settlements & marketplace payouts — all recorded, reconciled and tallied to your bank',
    icon: BookOpen,
  },
  {
    id: 'gst-einvoice',
    label: 'GST Returns & E-Invoice',
    frequency: 'Monthly',
    description: 'GSTR-1, GSTR-3B + E-invoice generation and marketplace TCS credit reconciliation — across every state you sell in',
    icon: Receipt,
  },
  {
    id: 'tds-tcs',
    label: 'TDS & TCS Compliance',
    frequency: 'Monthly / Quarterly',
    description: 'TDS on vendors plus marketplace TCS credits claimed correctly — no credit lost, no penalties',
    icon: Landmark,
  },
  {
    id: 'itr',
    label: 'Income Tax Return',
    frequency: 'Annual',
    description: 'ITR preparation, tax computation & advance tax planning — structured to minimize your liability legally',
    icon: FileText,
  },
  {
    id: 'channel-mis',
    label: 'Channel-wise MIS & SKU Profitability',
    frequency: 'Monthly',
    description: 'Amazon, Flipkart, Swiggy, dine-in, website — channel-level P&L plus SKU-wise margins so you know where to double down',
    icon: PieChart,
  },
  {
    id: 'advisory',
    label: 'Dedicated Manager',
    frequency: 'Ongoing',
    description: 'One dedicated manager for all your queries, strategy calls & compliance guidance — no runarounds, ever',
    icon: BriefcaseBusiness,
  },
];

// ── Trading / Manufacturing / Services deliverables ──
const TRADING_MANUFACTURING_DELIVERABLES: ServiceDeliverable[] = [
  {
    id: 'bookkeeping',
    label: 'Bookkeeping & Reconciliation',
    frequency: 'Monthly',
    description: 'Your transactions recorded daily, ledgers maintained, bank & party balances reconciled — books always current',
    icon: BookOpen,
  },
  {
    id: 'gst-eway',
    label: 'GST Returns & E-way Bill',
    frequency: 'Monthly',
    description: 'GSTR-1 & GSTR-3B filed on time + E-way bill compliance for inter-state movement, with ITC reconciliation to maximize credits',
    icon: Receipt,
  },
  {
    id: 'tds',
    label: 'TDS Compliance',
    frequency: 'Monthly / Quarterly',
    description: 'TDS on vendors, contracts, rent, professional services + quarterly returns (24Q, 26Q) — handled end-to-end, penalty-free',
    icon: Landmark,
  },
  {
    id: 'itr',
    label: 'Income Tax Return',
    frequency: 'Annual',
    description: 'ITR preparation, tax computation & advance tax planning — structured to minimize your liability legally',
    icon: FileText,
  },
  {
    id: 'mis',
    label: 'MIS & Cost-Center Reports',
    frequency: 'Monthly',
    description: 'P&L, balance sheet, cash flow, debtor ageing, stock & cost-center dashboards — so you always know where your money is going',
    icon: PieChart,
  },
  {
    id: 'advisory',
    label: 'Dedicated Manager',
    frequency: 'Ongoing',
    description: 'One dedicated manager for all your queries, strategy calls & compliance guidance — no runarounds, ever',
    icon: BriefcaseBusiness,
  },
];

function getServiceDeliverables(variant: FinanceVariant): ServiceDeliverable[] {
  return variant === 'ecommerce-restaurants' ? ECOMMERCE_RESTAURANT_DELIVERABLES : TRADING_MANUFACTURING_DELIVERABLES;
}

/* ═══════════════════════════════════════════════════════════════════════
   FEEDBACK DATA
   ═══════════════════════════════════════════════════════════════════════ */

const FEEDBACK_QUESTIONS = [
  {
    id: 'team',
    question: 'How confident do you feel about your dedicated Accounts Team?',
  },
  {
    id: 'alignment',
    question: 'Does the service scope cover everything you need?',
  },
  {
    id: 'satisfaction',
    question: 'How would you rate this onboarding experience so far?',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED CHECK RING
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
          stroke="url(#atSetupGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 30}
          initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="atSetupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
    { id: 'team-intro', label: 'Your Team', num: 1 },
    { id: 'service-plan', label: 'Service Plan', num: 2 },
    { id: 'feedback', label: 'Feedback', num: 3 },
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
   SERVICE DELIVERABLE CARD (read-only — no approve/discuss)
   ═══════════════════════════════════════════════════════════════════════ */

function DeliverableCard({
  deliverable,
  index,
}: {
  deliverable: ServiceDeliverable;
  index: number;
}) {
  const Icon = deliverable.icon;

  return (
    <motion.div
      className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}
            >
              <Icon className="w-4.5 h-4.5 text-[#204CC7]" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 truncate" style={{ fontSize: '14px', fontWeight: 600 }}>
                {deliverable.label}
              </p>
              <p className="text-gray-500 truncate" style={{ fontSize: '13px', fontWeight: 400 }}>
                {deliverable.description}
              </p>
            </div>
          </div>
          <div
            className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 flex-shrink-0 ml-3"
            style={{ minWidth: '70px', textAlign: 'center' }}
          >
            <p className="text-emerald-700" style={{ fontSize: '13px', fontWeight: 600 }}>
              {deliverable.frequency}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
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

export function AccountsTeamOnboarding({
  isOpen,
  onComplete,
  clientName,
  companyName,
  selectedPlan,
  businessType,
  onIncidentCreated,
}: AccountsTeamOnboardingProps) {
  // Resolve the finance variant once per render — drives Month 1 plan & service scope
  const financeVariant = resolveFinanceVariant(businessType);
  const [phase, setPhase] = useState<Phase>('welcome');
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [allMet, setAllMet] = useState(false);
  const [metMembers, setMetMembers] = useState<Set<number>>(new Set());

  // Service plan state
  const [activeWeek, setActiveWeek] = useState(0);
  const [scopeAcknowledged, setScopeAcknowledged] = useState(false);

  // Feedback state
  const [teamRating, setTeamRating] = useState(0);
  const [alignmentAnswer, setAlignmentAnswer] = useState<'yes' | 'partial' | 'no' | null>(null);
  const [satisfactionRating, setSatisfactionRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentRaised, setIncidentRaised] = useState(false);

  const team = ACCOUNTS_TEAM;
  const weeks = getAccountsWeeks(financeVariant);
  const deliverables = getServiceDeliverables(financeVariant);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [phase]);

  const markMet = useCallback((idx: number) => {
    setMetMembers(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  useEffect(() => {
    if (metMembers.size >= team.length) setAllMet(true);
  }, [metMembers, team.length]);

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
                You're All Set!
              </motion.h2>
              <motion.p
                className="text-gray-500"
                style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.6 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Your <span style={{ fontWeight: 600, color: '#204CC7' }}>{planName}</span> plan is active — let's get your finances in order
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
                    { num: 1, label: 'Meet the team that will manage your finances', icon: Users, active: true },
                    { num: 2, label: 'Review what we deliver & your Month 1 roadmap', icon: ClipboardList, active: false },
                    { num: 3, label: 'Share quick feedback & we begin right away', icon: Sparkles, active: false },
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
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
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
                  Your team is ready
                </motion.p>
              </motion.div>

              {/* CTA */}
              <motion.button
                onClick={() => setPhase('team-intro')}
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
                Meet your Team
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
              You're All Onboarded!
            </motion.h2>
            <motion.p
              className="text-gray-500 mb-1"
              style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.6 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Your finance team is already getting started on {companyName}'s books.
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
                { icon: Users, text: 'Your dedicated accounts team is introduced and ready' },
                { icon: ClipboardList, text: 'Service scope reviewed and confirmed by you' },
                { icon: Calendar, text: 'Month 1 roadmap locked in and ready to execute' },
                { icon: MessageSquare, text: 'Your feedback received — we\'re on it' },
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

            {/* What's coming teaser */}
            <motion.div
              className="rounded-xl border border-gray-100 p-4 mb-5"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: 'linear-gradient(135deg, #FAFBFF, #F5F7FF)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-[#204CC7]" />
                <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>What you'll see this month</p>
              </div>
              <div className="space-y-2">
                {[
                  'Your books cleaned up and fully reconciled',
                  'GST compliance calendar live with auto-reminders',
                  'First MIS report delivered to your dashboard',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#204CC7]/40" />
                    <p className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>{item}</p>
                  </div>
                ))}
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
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
            >
              <Calculator className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
                Accounts & Taxation Kickoff
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
               PHASE 1: TEAM INTRODUCTION
               ═══════════════════════════════════════════════════ */}
            {phase === 'team-intro' && (
              <motion.div
                key="team-intro"
                className="p-5 sm:p-6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Welcome banner */}
                <motion.div
                  className="rounded-2xl p-5 mb-5 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #059669, transparent)' }}
                  />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <p className="text-amber-400/80" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Your Finance Team is Ready
                      </p>
                    </div>
                    <h3 className="text-white mb-1" style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.3 }}>
                      {firstName}, meet the people behind your numbers
                    </h3>
                    <p className="text-gray-400" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.6 }}>
                      Three specialists — one mission: keeping your books spotless, taxes filed on time, and your finances crystal clear. Tap each to learn more.
                    </p>
                  </div>
                </motion.div>

                {/* Team grid */}
                <div className="space-y-2.5">
                  {team.map((member, i) => {
                    const isExpanded = expandedMember === i;
                    const isMet = metMembers.has(i);

                    return (
                      <motion.div
                        key={member.name}
                        className={`rounded-2xl border transition-colors duration-300 ${
                          isExpanded
                            ? 'border-[#204CC7]/20 bg-blue-50/20'
                            : isMet
                            ? 'border-green-200/60 bg-green-50/15'
                            : 'border-gray-200/60 bg-white hover:border-gray-300/60'
                        }`}
                        style={{
                          boxShadow: isExpanded
                            ? '0 4px 20px rgba(32,76,199,0.08)'
                            : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                      >
                        <button
                          className="w-full flex items-center gap-3.5 p-3.5 text-left"
                          onClick={() => {
                            setExpandedMember(isExpanded ? null : i);
                            if (!isMet) markMet(i);
                          }}
                          aria-expanded={isExpanded}
                          aria-controls={`at-member-detail-${i}`}
                        >
                          <div className="relative flex-shrink-0">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center"
                              style={{ background: member.gradient, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                            >
                              <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>{member.initials}</span>
                            </div>
                            {isMet && !isExpanded && (
                              <motion.div
                                className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-green-500 border-[1.5px] border-white flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              >
                                <Check className="w-2 h-2 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                {member.name}
                              </p>
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  background: isExpanded ? 'rgba(32,76,199,0.1)' : 'rgba(32,76,199,0.06)',
                                  color: '#204CC7',
                                }}
                              >
                                {member.role}
                              </span>
                            </div>
                            <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                              {member.specialty}
                            </p>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ease-out flex-shrink-0 ${
                              isExpanded ? 'rotate-90 text-[#204CC7]' : 'text-gray-500'
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              id={`at-member-detail-${i}`}
                              role="region"
                              aria-label={`About ${member.name}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                                opacity: { duration: 0.2, delay: 0.05 },
                              }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="px-3.5 pb-3.5">
                                <div className="pt-2.5 border-t border-gray-100/60">
                                  <div
                                    className="flex items-start gap-3 mt-2 p-3 rounded-xl"
                                    style={{ background: 'linear-gradient(135deg, #F8FAFF, #F0F4FF)' }}
                                  >
                                    <div
                                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                      style={{ background: member.gradient }}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p
                                      className="text-gray-600"
                                      style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.7 }}
                                    >
                                      "{member.intro}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Progress hint */}
                <AnimatePresence>
                  {!allMet && (
                    <motion.div
                      className="flex items-center justify-center gap-2 mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex gap-1">
                        {team.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                              metMembers.has(i) ? 'bg-green-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                        {metMembers.size}/{team.length} introduced
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {allMet && (
                  <motion.div
                    className="flex items-center justify-center gap-2 mt-4"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <p className="text-green-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                      You've met everyone — your team is ready to go!
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════
               PHASE 2: SERVICE PLAN (read-only — no approve/discuss)
               ═══════════════════════════════════════════════════ */}
            {phase === 'service-plan' && (
              <motion.div
                key="service-plan"
                className="p-5 sm:p-6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Week-by-week timeline */}
                <motion.div
                  className="mb-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#204CC7]" />
                    <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
                      1st Month Roadmap
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>
                    Here's exactly what happens in your first 30 days — from setup to your first financial reports.
                  </p>

                  {/* Week selector */}
                  <div className="flex gap-1.5 mb-4">
                    {weeks.map((w, i) => {
                      const WIcon = w.icon;
                      return (
                        <button
                          key={w.week}
                          onClick={() => setActiveWeek(i)}
                          className={`flex-1 py-2 px-2 rounded-xl border text-center transition-all duration-200 ${
                            activeWeek === i
                              ? 'bg-[#204CC7] border-[#204CC7] text-white shadow-md shadow-blue-200/30'
                              : 'bg-white border-gray-200/60 text-gray-500 hover:border-gray-300'
                          }`}
                          style={{ boxShadow: activeWeek === i ? '0 2px 8px rgba(32,76,199,0.2)' : undefined }}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <WIcon className={`w-3.5 h-3.5 ${activeWeek === i ? 'text-white/80' : 'text-gray-500'}`} />
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>Week {w.week}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active week content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeWeek}
                      className="rounded-2xl border border-gray-200/60 bg-gray-50/30 p-4"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      {(() => {
                        const w = weeks[activeWeek];
                        const WIcon = w.icon;
                        return (
                          <>
                            <div className="flex items-center gap-2.5 mb-3">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}
                              >
                                <WIcon className="w-4 h-4 text-[#204CC7]" />
                              </div>
                              <div>
                                <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                  {w.title}
                                </p>
                                <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                                  {w.description}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {w.tasks.map((task, ti) => (
                                <motion.div
                                  key={task}
                                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-100/60"
                                  initial={{ opacity: 0, x: 8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: ti * 0.05 }}
                                >
                                  <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  </div>
                                  <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>
                                    {task}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                            {w.note && (
                              <motion.div
                                className="flex items-start gap-2 mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/80"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: w.tasks.length * 0.05 + 0.1 }}
                              >
                                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-800" style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.5 }}>
                                  {w.note}
                                </p>
                              </motion.div>
                            )}
                          </>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <div className="h-px bg-gray-100 my-4" />

                {/* Service Scope — read-only deliverables */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#204CC7]" />
                      <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
                        Service Scope
                      </p>
                    </div>
                    <span
                      className="text-gray-500 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100"
                      style={{ fontSize: '13px', fontWeight: 500 }}
                    >
                      {financeVariant === 'ecommerce-restaurants'
                        ? 'E-Commerce / Restaurants'
                        : 'Trading / Manufacturing / Services'}
                    </span>
                  </div>
                  <p className="text-gray-500 mb-4" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>
                    Everything below is handled by your team — you focus on growing your business, we handle the numbers.
                  </p>

                  <div className="space-y-2.5">
                    {deliverables.map((d, i) => (
                      <DeliverableCard key={d.id} deliverable={d} index={i} />
                    ))}
                  </div>

                  {/* Acknowledge checkbox */}
                  <motion.div
                    className="mt-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      onClick={() => setScopeAcknowledged(!scopeAcknowledged)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                        scopeAcknowledged
                          ? 'border-green-200 bg-green-50/40'
                          : 'border-gray-200/60 bg-white hover:border-gray-300'
                      }`}
                      style={{ boxShadow: scopeAcknowledged ? '0 2px 8px rgba(5,150,105,0.08)' : '0 1px 3px rgba(0,0,0,0.03)' }}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                          scopeAcknowledged
                            ? 'bg-green-500'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {scopeAcknowledged && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p
                        className={scopeAcknowledged ? 'text-green-700' : 'text-gray-600'}
                        style={{ fontSize: '13px', fontWeight: 500, textAlign: 'left' }}
                      >
                        I've reviewed everything — the service scope and Month 1 plan look great
                      </p>
                    </button>
                  </motion.div>
                </motion.div>
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
                      Your feedback helps us serve you better.<br />We're ready to take it from here.
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
                        Almost there — a quick check-in
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.6 }}>
                        Before we dive into your books, we'd love to know how you're feeling about everything so far. Takes 30 seconds.
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
            {phase !== 'team-intro' ? (
              <button
                onClick={() => {
                  if (phase === 'service-plan') setPhase('team-intro');
                  else if (phase === 'feedback') setPhase('service-plan');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {phase === 'team-intro' && (
              <motion.button
                onClick={() => setPhase('service-plan')}
                disabled={!allMet}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all duration-300 ${
                  allMet ? 'opacity-100 cursor-pointer' : 'opacity-35 cursor-not-allowed'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #204CC7 0%, #4338CA 100%)',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: allMet ? '0 4px 14px -2px rgba(32,76,199,0.3)' : 'none',
                }}
                whileHover={allMet ? { scale: 1.02 } : {}}
                whileTap={allMet ? { scale: 0.98 } : {}}
              >
                Continue to Service Plan
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {phase === 'service-plan' && (
              <motion.button
                onClick={() => setPhase('feedback')}
                disabled={!scopeAcknowledged}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all duration-300 ${
                  scopeAcknowledged ? 'opacity-100 cursor-pointer' : 'opacity-35 cursor-not-allowed'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #204CC7 0%, #4338CA 100%)',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: scopeAcknowledged ? '0 4px 14px -2px rgba(32,76,199,0.3)' : 'none',
                }}
                whileHover={scopeAcknowledged ? { scale: 1.02 } : {}}
                whileTap={scopeAcknowledged ? { scale: 0.98 } : {}}
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
          defaultService="Accounts & Taxation"
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
