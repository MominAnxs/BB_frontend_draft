'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  CircleDot,
  Info,
  Rocket,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   MONTH 1 PLAN DATA — shared between Setup Complete modal + Weekly pulse
   ═══════════════════════════════════════════════════════════════════════ */

export type BusinessType = 'ecommerce' | 'leadgen';

export interface WeekPlan {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  icon: typeof Target;
  note?: string;
}

export const ECOM_WEEKS: WeekPlan[] = [
  {
    week: 1,
    title: 'Foundation & Launch',
    description: 'We set up everything and get your ads live — fast',
    tasks: [
      'Share your ad account, analytics & platform accesses with our team',
      'We audit your website, ad accounts & restructure for peak performance',
      'Creative review — we align on your brand messaging & ad creatives',
      'Your campaigns go live once everything is aligned',
    ],
    note: 'Already running campaigns? We\u2019ll start optimizing them within 48 hours of getting access.',
    icon: Shield,
  },
  {
    week: 2,
    title: 'Optimize & Iterate',
    description: 'We analyze early results and fine-tune for better performance',
    tasks: [
      'Deep-dive into campaign data — underperformers are paused immediately',
      'A/B testing across ad creatives & copy (3\u20135 variations)',
      'Product feed & Shopping Ads optimized for higher conversions',
      'Audience segments, remarketing & lookalikes refined for precision',
    ],
    icon: Rocket,
  },
  {
    week: 3,
    title: 'Scale & Accelerate',
    description: 'We double down on what\u2019s working and expand your reach',
    tasks: [
      'Winning ad sets scaled by 20\u201330% for maximum impact',
      'New creative angles launched based on Week 2 insights',
      'Expansion into high-performing audience segments',
      'AOV optimization through bundles & upsell strategies',
    ],
    icon: TrendingUp,
  },
  {
    week: 4,
    title: 'Review & Strategy',
    description: 'Full Month 1 review with a clear roadmap for Month 2',
    tasks: [
      'Comprehensive Month 1 performance report delivered to you',
      'ROAS & revenue deep-dive against your targets',
      'Strategy call with data-backed recommendations for next steps',
      'Month 2 media plan & budget allocation finalized together',
    ],
    icon: BarChart3,
  },
];

export const LEADGEN_WEEKS: WeekPlan[] = [
  {
    week: 1,
    title: 'Foundation & Launch',
    description: 'We set up everything and get your campaigns live — fast',
    tasks: [
      'Share your ad account, CRM & platform accesses with our team',
      'We audit your website, ad accounts & restructure for lead quality',
      'Creative review — we align on your messaging & lead magnets',
      'Your campaigns go live once everything is aligned',
    ],
    note: 'Already running campaigns? We\u2019ll start optimizing them within 48 hours of getting access.',
    icon: Shield,
  },
  {
    week: 2,
    title: 'Optimize & Qualify',
    description: 'We filter for quality leads and optimize your conversion funnel',
    tasks: [
      'Lead data analyzed — junk filtered out, quality sources prioritized',
      'A/B testing across lead forms & landing page variations',
      'Ad copy, targeting & bidding strategies fine-tuned for lower CPL',
      'Call tracking & attribution refined for accurate reporting',
    ],
    icon: Rocket,
  },
  {
    week: 3,
    title: 'Scale & Accelerate',
    description: 'We expand your reach and nurture high-intent prospects',
    tasks: [
      'Top-performing campaigns scaled by 20\u201330%',
      'Remarketing & lead nurture sequences launched',
      'Geo-targeting & audience segments expanded strategically',
      'Landing page conversion rates optimized further',
    ],
    icon: TrendingUp,
  },
  {
    week: 4,
    title: 'Review & Strategy',
    description: 'Full Month 1 review with a clear roadmap for Month 2',
    tasks: [
      'Comprehensive lead performance report delivered to you',
      'CPL & lead quality deep-dive against your targets',
      'Strategy call with data-backed recommendations for next steps',
      'Month 2 media plan & budget allocation finalized together',
    ],
    icon: BarChart3,
  },
];

export function getWeeksFor(businessType: BusinessType): WeekPlan[] {
  return businessType === 'leadgen' ? LEADGEN_WEEKS : ECOM_WEEKS;
}

/* ═══════════════════════════════════════════════════════════════════════
   MONTH PLAN CONTENT — renders the 1st Month Roadmap (used in both the
   Setup Complete modal and the standalone Month Plan modal from sidebar).
   ═══════════════════════════════════════════════════════════════════════ */

interface MonthPlanContentProps {
  businessType?: BusinessType;
  activeWeek: number;
  onActiveWeekChange: (idx: number) => void;
  /** Hide the section header (title + subline). Useful when the wrapper modal already has its own title. */
  hideHeader?: boolean;
}

export function MonthPlanContent({
  businessType = 'ecommerce',
  activeWeek,
  onActiveWeekChange,
  hideHeader = false,
}: MonthPlanContentProps) {
  const weeks = getWeeksFor(businessType);
  const safeIdx = Math.min(Math.max(activeWeek, 0), weeks.length - 1);
  const current = weeks[safeIdx];
  const CurrentIcon = current.icon;

  return (
    <motion.div
      className="mb-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      {!hideHeader && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-[#204CC7]" />
            <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
              1st Month Roadmap
            </p>
          </div>
          <p className="text-gray-500 mb-4" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>
            Your first 30 days with Brego Performance Team. Each week builds on the last.
          </p>
        </>
      )}

      {/* Week selector */}
      <div className="flex gap-1.5 mb-4">
        {weeks.map((w, i) => {
          const WIcon = w.icon;
          const isActive = safeIdx === i;
          return (
            <button
              key={w.week}
              onClick={() => onActiveWeekChange(i)}
              className={`flex-1 py-2 px-2 rounded-xl border text-center transition-all duration-200 ${
                isActive
                  ? 'bg-[#204CC7] border-[#204CC7] text-white shadow-md shadow-blue-200/30'
                  : 'bg-white border-gray-200/60 text-gray-500 hover:border-gray-300'
              }`}
              style={{ boxShadow: isActive ? '0 2px 8px rgba(32,76,199,0.2)' : undefined }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <WIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Week {w.week}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Transparent wrapper reserves vertical space so the modal stays the same
          size across all 4 weeks (Week 1 has an extra note block; others don't).
          The card inside sits at its natural size — no gray empty-space extension. */}
      <div style={{ minHeight: 360 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={safeIdx}
          className="rounded-2xl border border-gray-200/60 bg-gray-50/30 p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}
            >
              <CurrentIcon className="w-4 h-4 text-[#204CC7]" />
            </div>
            <div>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                {current.title}
              </p>
              <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                {current.description}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {current.tasks.map((task, ti) => (
              <motion.div
                key={task}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-100/60"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ti * 0.05 }}
              >
                <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CircleDot className="w-3 h-3 text-[#204CC7]" />
                </div>
                <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>
                  {task}
                </p>
              </motion.div>
            ))}
          </div>
          {current.note && (
            <motion.div
              className="flex items-start gap-2 mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/80"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: current.tasks.length * 0.05 + 0.1 }}
            >
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800" style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.5 }}>
                {current.note}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </motion.div>
  );
}
