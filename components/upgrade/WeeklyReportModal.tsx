'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  Circle,
  TrendingUp,
  Sparkles,
  Clock,
  MessageSquare,
  ThumbsUp,
  BarChart3,
  FileText,
  CalendarDays,
  Send,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';

type ServiceType = 'marketing' | 'finance';

/* ─────────── mood / satisfaction ─────────── */
export const MOOD_EMOJIS = [
  { emoji: '😟', label: 'Needs Improvement', color: '#EF4444', bg: '#FEF2F2', ring: '#FECACA' },
  { emoji: '😐', label: 'Fair',              color: '#F59E0B', bg: '#FFFBEB', ring: '#FDE68A' },
  { emoji: '🙂', label: 'Good',              color: '#3B82F6', bg: '#EFF6FF', ring: '#BFDBFE' },
  { emoji: '😊', label: 'Great',             color: '#10B981', bg: '#ECFDF5', ring: '#A7F3D0' },
  { emoji: '🤩', label: 'Excellent',         color: '#8B5CF6', bg: '#F5F3FF', ring: '#DDD6FE' },
];

/* ─────────── month / week helpers ─────────── */
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getCurrentMonthInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = MONTH_NAMES[month];
  const dayOfMonth = now.getDate();
  const currentWeekOfMonth = Math.min(4, Math.ceil(dayOfMonth / 7));
  return { year, month, monthName, currentWeekOfMonth };
}

function getMonthWeekRange(month: number, year: number, weekOfMonth: number): { start: Date; end: Date } {
  const startDay = (weekOfMonth - 1) * 7 + 1;
  const start = new Date(year, month, startDay);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDay = Math.min(startDay + 6, lastDay);
  const end = new Date(year, month, endDay);
  return { start, end };
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/* ─────────── checklist task model ─────────── */
interface ChecklistTask {
  id: string;
  title: string;
  completed: boolean;
  note?: string; // explainer / reason behind the task
}

interface WeeklySnapshot {
  weekNumber: number;
  periodLabel: string;
  totalTasks: number;
  completedTasks: number;
  satisfactionIndex: number;
  feedbackNote: string;
  feedbackSubmitted: boolean;
  teamNote: string;
  highlights: { label: string; value: string; icon: any; color: string }[];
  checklist: ChecklistTask[];
}

/* ─────────── mock data generator (month-aware) ─────────── */
function generateWeekData(weekOfMonth: number, serviceType: ServiceType): WeeklySnapshot {
  const { month, year, monthName, currentWeekOfMonth } = getCurrentMonthInfo();
  const range = getMonthWeekRange(month, year, weekOfMonth);
  const period = `${formatShortDate(range.start)} – ${formatShortDate(range.end)}`;

  const isFuture = weekOfMonth > currentWeekOfMonth;
  const isCurrent = weekOfMonth === currentWeekOfMonth;
  const isPast = weekOfMonth < currentWeekOfMonth;

  if (serviceType === 'marketing') {
    const seeds: Record<number, Partial<WeeklySnapshot>> = {
      1: {
        satisfactionIndex: 4,
        teamNote: isPast
          ? `Solid start to ${monthName}! Launched 3 new campaigns on Meta and Google. CPA dropped 8% — your best opening week this quarter.`
          : `Kicking off ${monthName} strong — we're launching fresh campaigns and refreshing creatives across all channels.`,
        highlights: [
          { label: 'Campaigns', value: '4', icon: TrendingUp, color: '#204CC7' },
          { label: 'Creatives', value: '3', icon: Sparkles, color: '#8B5CF6' },
          { label: 'Ad Spend', value: '₹1.6L', icon: BarChart3, color: '#10B981' },
          { label: 'Pending', value: '1', icon: Clock, color: '#F59E0B' },
        ],
        checklist: [
          { id: 'pm-w1-1', title: 'Launch Meta lookalike campaign', completed: isPast || isCurrent, note: 'Lookalike audiences based on your top 5% buyers convert 3x better than broad targeting. This lets us reach people similar to your best customers at a lower CPA.' },
          { id: 'pm-w1-2', title: 'Google Shopping feed optimisation', completed: isPast || isCurrent, note: 'Your product titles and descriptions need keyword alignment with actual search queries. This directly impacts impression share and click-through rate on Shopping ads.' },
          { id: 'pm-w1-3', title: 'CPA analysis — weekly report', completed: isPast || isCurrent, note: 'Weekly CPA tracking helps us catch rising costs early. If a campaign\'s CPA spikes, we can pause or reallocate budget before it eats into your margins.' },
          { id: 'pm-w1-4', title: 'Audience segmentation refresh', completed: isPast, note: 'Your audience segments are 30+ days old. Refreshing them ensures we\'re targeting based on the latest purchase and engagement data, not stale signals.' },
          { id: 'pm-w1-5', title: 'Banner ad design — seasonal promo', completed: isPast, note: 'Seasonal creatives consistently outperform evergreen ones by 20-35% in CTR. Timely visuals create urgency and relevance for your audience.' },
        ],
      },
      2: {
        satisfactionIndex: 3,
        teamNote: isPast
          ? 'ROAS improved 12% — we scaled your top-performing campaigns and paused underperformers to optimise spend.'
          : isCurrent
            ? 'This week we\'re focused on scaling winners and cutting low-ROAS campaigns. Your ad copies are being refreshed.'
            : `Planned focus: scaling top campaigns and refreshing creatives for ${monthName}.`,
        highlights: [
          { label: 'Campaigns', value: '6', icon: TrendingUp, color: '#204CC7' },
          { label: 'Creatives', value: '4', icon: Sparkles, color: '#8B5CF6' },
          { label: 'Ad Spend', value: '₹1.8L', icon: BarChart3, color: '#10B981' },
          { label: 'Pending', value: '2', icon: Clock, color: '#F59E0B' },
        ],
        checklist: [
          { id: 'pm-w2-1', title: 'Google Ads — refresh top 3 ad copies', completed: isPast, note: 'Ad fatigue sets in after 2-3 weeks. Refreshing copies improves Quality Score and reduces CPC — we\'ve seen 15-20% cost drops from copy refreshes alone.' },
          { id: 'pm-w2-2', title: 'Meta Ads — A/B test carousel vs. single image', completed: isPast, note: 'Carousels show 30% higher engagement for multi-product brands, but single images convert better for hero products. Testing tells us what works for your specific audience.' },
          { id: 'pm-w2-3', title: 'Pause low-ROAS display campaigns', completed: isPast || isCurrent, note: 'Two display campaigns are returning below 1.5x ROAS. Pausing them frees up ₹18K/week that we\'ll redirect to your top performers for better overall returns.' },
          { id: 'pm-w2-4', title: 'Landing page speed audit', completed: isPast, note: 'Your landing page loads in 4.2s on mobile — every second above 3s drops conversion rate by ~7%. A speed fix directly improves your cost-per-lead.' },
          { id: 'pm-w2-5', title: 'Weekly performance report', completed: false, note: 'This gives you a clear snapshot of spend, leads, CPA, and ROAS across all channels so you can track ROI and make informed decisions with us.' },
          { id: 'pm-w2-6', title: 'Budget reallocation memo', completed: false, note: 'Based on Week 1-2 data, we\'re recommending shifting 20% budget from Display to Meta Remarketing where ROAS is 2.8x higher. This memo explains the rationale.' },
        ],
      },
      3: {
        satisfactionIndex: 3,
        teamNote: isPast
          ? 'Remarketing audiences went live. Negative keyword cleanup saved ~₹12K in wasted spend this week.'
          : isCurrent
            ? 'Ramping up remarketing and negative keyword cleanup this week. Expect updated performance numbers by Thursday.'
            : `Week 3 focus: remarketing rollout and keyword optimisation for better CPA.`,
        highlights: [
          { label: 'Campaigns', value: '5', icon: TrendingUp, color: '#204CC7' },
          { label: 'Creatives', value: '2', icon: Sparkles, color: '#8B5CF6' },
          { label: 'Ad Spend', value: '₹1.9L', icon: BarChart3, color: '#10B981' },
          { label: 'Pending', value: '1', icon: Clock, color: '#F59E0B' },
        ],
        checklist: [
          { id: 'pm-w3-1', title: 'New remarketing audiences — cart abandoners', completed: isPast, note: '68% of carts are abandoned. Remarketing to these high-intent users within 24-72 hours recovers 10-15% of lost revenue at a fraction of the acquisition cost.' },
          { id: 'pm-w3-2', title: 'Negative keyword cleanup', completed: isPast, note: 'We found 47 irrelevant search terms draining ~₹12K/week. Adding them as negatives stops wasted spend immediately and improves your overall campaign efficiency.' },
          { id: 'pm-w3-3', title: 'Keyword expansion — add long-tail queries', completed: isPast || isCurrent, note: 'Long-tail keywords have 35% lower CPC and higher purchase intent. Adding these captures qualified traffic your competitors are likely missing.' },
          { id: 'pm-w3-4', title: 'Competitor ad benchmarking update', completed: false, note: 'Monitoring competitor ad copy, offers, and landing pages helps us differentiate your messaging and find gaps in the market we can exploit.' },
          { id: 'pm-w3-5', title: 'YouTube bumper ad — finalise script', completed: false, note: 'YouTube bumper ads (6s) build brand recall at scale. The script needs sign-off so we can go into production and launch by Week 4.' },
        ],
      },
      4: {
        satisfactionIndex: 4,
        teamNote: isPast
          ? `Great close to ${monthName}! Monthly report is ready — ROAS is up 18% vs last month. We'll share the full deck Monday.`
          : isCurrent
            ? `Wrapping up ${monthName} strong — final optimisations and your monthly performance report are in progress.`
            : `End-of-month: final optimisations, monthly reporting, and next month's strategy prep.`,
        highlights: [
          { label: 'Campaigns', value: '6', icon: TrendingUp, color: '#204CC7' },
          { label: 'Creatives', value: '5', icon: Sparkles, color: '#8B5CF6' },
          { label: 'Ad Spend', value: '₹2.0L', icon: BarChart3, color: '#10B981' },
          { label: 'Pending', value: '0', icon: Clock, color: '#F59E0B' },
        ],
        checklist: [
          { id: 'pm-w4-1', title: 'Monthly performance report — compile & share', completed: isPast, note: 'The full-month report covers all KPIs — spend, CPA, ROAS, lead quality, and channel breakdowns. It\'s your single source of truth for marketing ROI this month.' },
          { id: 'pm-w4-2', title: 'Review creative brief — next month', completed: isPast, note: 'Planning creatives a week early avoids last-minute rushes and gives designers enough time to produce high-quality assets aligned with your brand.' },
          { id: 'pm-w4-3', title: 'Final bid strategy adjustments', completed: isPast || isCurrent, note: 'End-of-month bid tuning ensures we\'re not overspending in the last days. We adjust target CPA bids based on the month\'s conversion data to protect your margins.' },
          { id: 'pm-w4-4', title: 'Next month campaign strategy memo', completed: false, note: 'This outlines our recommended channel mix, budget allocation, and creative direction for next month based on this month\'s learnings and your business goals.' },
        ],
      },
    };

    const seed = seeds[weekOfMonth] || seeds[1]!;
    return {
      weekNumber: weekOfMonth,
      periodLabel: period,
      totalTasks: (seed.checklist || []).length,
      completedTasks: (seed.checklist || []).filter(t => t.completed).length,
      satisfactionIndex: seed.satisfactionIndex ?? 3,
      feedbackNote: '',
      feedbackSubmitted: isPast,
      teamNote: seed.teamNote || '',
      highlights: seed.highlights as any || [],
      checklist: seed.checklist || [],
    };
  }

  // ── Finance (Accounts & Taxation) ──
  const finSeeds: Record<number, Partial<WeeklySnapshot>> = {
    1: {
      satisfactionIndex: 3,
      teamNote: isPast
        ? `Last month's books are closed. Your total revenue was ₹18.4L with ₹2.1L in receivables still outstanding. We've flagged 3 invoices overdue by 30+ days — details below.`
        : isCurrent
          ? `Closing last month's books this week. We're recording final sales entries, matching bank transactions, and processing payroll. Your books will be updated by Thursday.`
          : `Week 1 focus: closing previous month's books, bank reconciliation, and payroll processing.`,
      highlights: [],
      checklist: [
        {
          id: 'at-w1-1',
          title: 'Close last month\u2019s books \u2014 record all sales & purchase entries',
          completed: isPast || isCurrent,
          note: 'Every sale and purchase from last month needs to be recorded accurately before we can generate your P&L. Delayed entries mean your profit numbers are wrong, and you could be making business decisions based on outdated data.',
        },
        {
          id: 'at-w1-2',
          title: 'Bank reconciliation \u2014 match all transactions with books',
          completed: isPast || isCurrent,
          note: 'We compare every transaction in your bank statement against your accounting records. This catches duplicates, missed entries, or unauthorised debits. Last month, reconciliation caught \u20b947K in unrecorded vendor payments.',
        },
        {
          id: 'at-w1-3',
          title: 'Process payroll \u2014 salary, PF, ESI calculations',
          completed: isPast,
          note: 'Payroll includes salary disbursement, PF (12% employer + 12% employee), and ESI contributions. Late PF deposit after the 15th attracts damages up to 100% of the arrears under the EPF Act. We process early to keep you compliant.',
        },
        {
          id: 'at-w1-4',
          title: 'TDS deposit for last month \u2014 due by 7th',
          completed: isPast,
          note: 'TDS deducted on rent, professional fees, contractor payments, and salaries must be deposited to the government by the 7th of the following month. Missing this deadline means 1.5% interest per month and a late filing fee of \u20b9200/day.',
        },
        {
          id: 'at-w1-5',
          title: 'Receivables follow-up \u2014 3 invoices overdue (\u20b92.1L)',
          completed: false,
          note: 'Three customer invoices totalling \u20b92.1L are past their payment terms. Ageing receivables hurt your cash flow directly \u2014 if these stretch beyond 90 days, you may need to provision for bad debt, which reduces your reported profit.',
        },
      ],
    },
    2: {
      satisfactionIndex: 4,
      teamNote: isPast
        ? `GST filed on time \u2014 you claimed \u20b91.8L in input tax credit this month. ITC reconciliation found \u20b932K in mismatched invoices that we've flagged with your vendors for correction before the annual return.`
        : isCurrent
          ? `GST week \u2014 GSTR-1 was filed on the 11th. We're now preparing GSTR-3B (due 20th) and reconciling your input tax credit to make sure you're not leaving money on the table.`
          : `Week 2 focus: GST filing, ITC reconciliation, and vendor invoice verification.`,
      highlights: [],
      checklist: [
        {
          id: 'at-w2-1',
          title: 'File GSTR-1 \u2014 outward supply details (due 11th)',
          completed: isPast || (isCurrent && new Date().getDate() >= 11),
          note: 'GSTR-1 reports all your sales invoices to the government. Your customers need this data to claim their input tax credit. If we file late, your buyers can\'t claim ITC on time, which strains your business relationships.',
        },
        {
          id: 'at-w2-2',
          title: 'File GSTR-3B \u2014 tax payment & summary return (due 20th)',
          completed: isPast,
          note: 'GSTR-3B is where you actually pay your GST liability. This month your output tax is \u20b93.2L and eligible ITC is \u20b91.8L, so net payable is ~\u20b91.4L. Late filing = \u20b950/day penalty + 18% annual interest on unpaid tax.',
        },
        {
          id: 'at-w2-3',
          title: 'ITC reconciliation \u2014 match purchase invoices with GSTR-2B',
          completed: isPast || isCurrent,
          note: 'Your vendors\' uploaded invoices (in GSTR-2B) must match your purchase records for you to claim ITC. We found \u20b932K in mismatches \u2014 invoices where the vendor hasn\'t uploaded or amounts don\'t match. Unclaimed ITC is money you\'re losing.',
        },
        {
          id: 'at-w2-4',
          title: 'Vendor invoice verification \u2014 flag errors before payment',
          completed: isPast,
          note: 'We check every vendor invoice for correct GST number, HSN codes, tax rate, and amount before you pay. Paying an invoice with a wrong GSTIN means you can\'t claim ITC on it \u2014 effectively increasing your cost by 18%.',
        },
        {
          id: 'at-w2-5',
          title: 'Update cash flow tracker with tax outflows',
          completed: false,
          note: 'GST, TDS, PF, and ESI payments go out this week. We update your cash flow projection so you know exactly how much working capital is available after all statutory payments. This prevents overdraft surprises.',
        },
      ],
    },
    3: {
      satisfactionIndex: 3,
      teamNote: isPast
        ? `Your ${monthName} P&L is ready. Gross margin came in at 42% (down from 45% last month) \u2014 the dip is from higher raw material costs. We've broken down where expenses increased and flagged \u20b985K in costs that could be optimised.`
        : isCurrent
          ? `Building your monthly P&L and expense analysis this week. We're also reviewing your receivables ageing and flagging any unusual expense spikes compared to last month.`
          : `Week 3 focus: monthly P&L preparation, expense analysis, and receivables review.`,
      highlights: [],
      checklist: [
        {
          id: 'at-w3-1',
          title: 'Prepare monthly P&L \u2014 revenue, COGS, expenses, net profit',
          completed: isPast,
          note: 'Your P&L tells you exactly how much money your business made (or lost) this month. We break it down: revenue, cost of goods sold, operating expenses, and net profit. This is the single most important report for understanding if your business is healthy.',
        },
        {
          id: 'at-w3-2',
          title: 'Expense analysis \u2014 compare against last month & flag spikes',
          completed: isPast || isCurrent,
          note: 'We compare every expense category (rent, salaries, materials, logistics, utilities) against last month and your average. Any category that jumped 10%+ gets flagged with an explanation. This is how you catch cost leaks early before they become a pattern.',
        },
        {
          id: 'at-w3-3',
          title: 'Receivables ageing report \u2014 who owes you and for how long',
          completed: isPast || isCurrent,
          note: 'This report shows every unpaid customer invoice sorted by age: 0\u201330 days, 30\u201360 days, 60\u201390 days, and 90+ days. Right now \u20b92.1L is in the 30\u201360 day bucket. The longer invoices age, the harder they are to collect \u2014 recovery drops 30% after 90 days.',
        },
        {
          id: 'at-w3-4',
          title: 'Payables review \u2014 upcoming vendor payment schedule',
          completed: false,
          note: 'You have \u20b94.7L in vendor payments due in the next 15 days. We prioritise by payment terms and early-payment discounts. Paying strategically preserves your cash flow while maintaining vendor trust and capturing available discounts.',
        },
        {
          id: 'at-w3-5',
          title: 'Review depreciation schedule \u2014 fixed assets',
          completed: false,
          note: 'Depreciation reduces your taxable profit legally. We ensure all assets (equipment, vehicles, computers) are depreciated at correct rates under the Income Tax Act. Missing depreciation entries means you\'re paying more tax than you need to.',
        },
      ],
    },
    4: {
      satisfactionIndex: 4,
      teamNote: isPast
        ? `${monthName} closed cleanly. Net profit margin: 14.2%. All GST and TDS filings are on time. We've shared your financial snapshot with key numbers and a compliance calendar for next month \u2014 no deadlines will be missed.`
        : isCurrent
          ? `Closing ${monthName} \u2014 final adjustments, month-end provisions, and preparing your financial summary. We're also mapping next month's compliance deadlines so nothing catches us off guard.`
          : `Week 4 focus: month-end closing, financial summary, and next month's compliance planning.`,
      highlights: [],
      checklist: [
        {
          id: 'at-w4-1',
          title: 'Month-end closing \u2014 accruals, provisions, adjustments',
          completed: isPast || isCurrent,
          note: 'We book accrued expenses (electricity, rent adjustments), provisions for doubtful debts, and any pending journal entries. Without proper month-end closing, your financial statements won\'t reflect reality \u2014 and that affects every business decision you make.',
        },
        {
          id: 'at-w4-2',
          title: 'Financial summary \u2014 P&L, balance sheet, cash position',
          completed: isPast,
          note: 'A one-page summary showing: total revenue, gross profit, net profit, cash in bank, total receivables, total payables, and key ratios. This gives you a complete picture of where your business stands without needing to read 20 pages of accounts.',
        },
        {
          id: 'at-w4-3',
          title: 'Tax liability estimate \u2014 advance tax check',
          completed: false,
          note: 'If your total tax liability for the year exceeds \u20b910,000, advance tax must be paid quarterly (15 Jun, 15 Sep, 15 Dec, 15 Mar). Underpayment attracts interest under Sections 234B and 234C. We check your running total to make sure you\'re on track.',
        },
        {
          id: 'at-w4-4',
          title: 'Next month compliance calendar \u2014 all deadlines mapped',
          completed: false,
          note: 'Every statutory deadline for next month: TDS deposit (7th), GSTR-1 (11th), GSTR-3B (20th), PF/ESI (15th), and any quarterly filings. We send you reminders 3 days before each deadline so approvals happen on time and penalties never apply.',
        },
        {
          id: 'at-w4-5',
          title: 'Cost optimisation review \u2014 identify savings for next month',
          completed: false,
          note: 'We review this month\'s expenses against industry benchmarks and your historical data to identify where you\'re overspending. Last quarter, this review helped reduce operational costs by \u20b91.2L through vendor renegotiation and expense consolidation.',
        },
      ],
    },
  };

  const fSeed = finSeeds[weekOfMonth] || finSeeds[1]!;
  return {
    weekNumber: weekOfMonth,
    periodLabel: period,
    totalTasks: (fSeed.checklist || []).length,
    completedTasks: (fSeed.checklist || []).filter(t => t.completed).length,
    satisfactionIndex: fSeed.satisfactionIndex ?? 4,
    feedbackNote: '',
    feedbackSubmitted: isPast,
    teamNote: fSeed.teamNote || '',
    highlights: fSeed.highlights as any || [],
    checklist: fSeed.checklist || [],
  };
}

/* ─────────── Month progress across all 4 weeks ─────────── */
function getMonthSummary(serviceType: ServiceType) {
  let total = 0, completed = 0;
  for (let w = 1; w <= 4; w++) {
    const d = generateWeekData(w, serviceType);
    total += d.totalTasks;
    completed += d.completedTasks;
  }
  return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

/* ─────────── Expandable Task Row ─────────── */
function TaskRow({ task, isExpanded, onToggle }: { task: ChecklistTask; isExpanded: boolean; onToggle: () => void }) {
  const hasNote = !!task.note;

  return (
    <div
      className="rounded-lg transition-colors"
      style={{
        background: isExpanded ? '#F8FAFC' : 'transparent',
      }}
    >
      <button
        onClick={hasNote ? onToggle : undefined}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${hasNote ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
        style={{ textAlign: 'left' }}
        aria-expanded={hasNote ? isExpanded : undefined}
      >
        {task.completed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
        )}
        <span
          className={`flex-1 ${task.completed ? 'text-gray-400' : 'text-gray-700'}`}
          style={{
            fontSize: '14px',
            fontWeight: 400,
            fontFamily: 'Manrope, sans-serif',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </span>
        {hasNote && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isExpanded && (
              <Info className="w-3.5 h-3.5 text-gray-300" />
            )}
            <ChevronDown
              className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && task.note && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className="mx-3 mb-2.5 px-3 py-2.5 rounded-lg"
              style={{
                background: '#F0F4FF',
                borderLeft: '2px solid #204CC7',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  fontFamily: 'Manrope, sans-serif',
                  lineHeight: '1.55',
                  color: '#4B5563',
                  margin: 0,
                }}
              >
                {task.note}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Modal
   ═══════════════════════════════════════════════ */
interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: ServiceType;
  selectedPlan?: string;
  onFeedbackSubmit?: (weekNumber: number, rating: number, note: string) => void;
}

export function WeeklyReportModal({ isOpen, onClose, serviceType, selectedPlan = 'Growth', onFeedbackSubmit }: WeeklyReportModalProps) {
  const { monthName, year, currentWeekOfMonth } = useMemo(() => getCurrentMonthInfo(), []);
  const [activeWeek, setActiveWeek] = useState(currentWeekOfMonth);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const data = useMemo(() => generateWeekData(activeWeek, serviceType), [activeWeek, serviceType]);
  const monthSummary = useMemo(() => getMonthSummary(serviceType), [serviceType]);
  const pct = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  const mood = MOOD_EMOJIS[data.satisfactionIndex];

  const isFuture = activeWeek > currentWeekOfMonth;
  const isCurrent = activeWeek === currentWeekOfMonth;
  const isPast = activeWeek < currentWeekOfMonth;

  const handleSubmitFeedback = () => {
    if (feedbackRating === null) return;
    setFeedbackSent(true);
    onFeedbackSubmit?.(data.weekNumber, feedbackRating, feedbackNote);
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const switchWeek = (week: number) => {
    setActiveWeek(week);
    setFeedbackRating(null);
    setFeedbackNote('');
    setFeedbackSent(false);
    setTaskFilter('all');
    setExpandedTaskId(null);
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 30, stiffness: 380 }}
            className="relative bg-white rounded-2xl w-full max-w-[600px] max-h-[88vh] overflow-hidden flex flex-col mx-4"
            style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
          >
            {/* ── Header ── */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              {/* Title row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #204CC7, #6366F1)' }}
                  >
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }} className="text-gray-900">
                      {monthName} {year}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-gray-400">
                      {selectedPlan} Plan · {monthSummary.completed}/{monthSummary.total} tasks this month
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* ── Month progress bar ── */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }} className="text-gray-500">
                    Monthly progress
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', color: '#204CC7' }}>
                    {monthSummary.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #204CC7, #6366F1)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${monthSummary.pct}%` }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                  />
                </div>
              </div>

              {/* ── Week selector ── */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((w) => {
                  const isActive = w === activeWeek;
                  const wPast = w < currentWeekOfMonth;
                  const wCurrent = w === currentWeekOfMonth;
                  const wFuture = w > currentWeekOfMonth;

                  return (
                    <button
                      key={w}
                      onClick={() => switchWeek(w)}
                      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 relative"
                      style={{
                        background: isActive ? (wCurrent ? '#EFF6FF' : wPast ? '#F0FDF4' : '#F9FAFB') : 'transparent',
                        border: isActive ? `1.5px solid ${wCurrent ? '#BFDBFE' : wPast ? '#BBF7D0' : '#E5E7EB'}` : '1.5px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {wPast && (
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          </div>
                        )}
                        {wCurrent && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: isActive ? 700 : 500,
                            fontFamily: 'Manrope, sans-serif',
                            color: wFuture ? '#9CA3AF' : isActive ? (wCurrent ? '#204CC7' : '#059669') : '#374151',
                          }}
                        >
                          Week {w}
                        </span>
                      </div>
                      {wCurrent && isActive && (
                        <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif', color: '#204CC7' }}>
                          This Week
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'thin' }}>
              {/* Date range pill */}
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} className="text-gray-900">
                  Week {activeWeek} of {monthName}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-gray-400">
                  {data.periodLabel}
                </span>
              </div>

              {/* ── Future week — friendly placeholder ── */}
              {isFuture && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div
                    className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: '#F3F4F6' }}
                  >
                    <CalendarDays className="w-5 h-5 text-gray-400" />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} className="text-gray-500 block mb-1">
                    Coming up
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-gray-400">
                    We'll update this once Week {activeWeek} begins.
                  </span>
                </motion.div>
              )}

              {/* ── Current / Past week content ── */}
              {!isFuture && (
                <motion.div
                  key={activeWeek}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* ── Progress row ── */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                      <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                        <circle
                          cx="28" cy="28" r="22"
                          fill="none" stroke={isPast ? '#10B981' : '#204CC7'} strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeDasharray={`${pct * 1.382} 138.2`}
                          transform="rotate(-90 28 28)"
                          style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: isPast ? '#10B981' : '#204CC7' }}>
                          {pct}%
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} className="text-gray-900">
                          {data.completedTasks} of {data.totalTasks} tasks
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-gray-400">
                          {isPast ? 'completed' : 'done so far'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: isPast ? '#10B981' : '#204CC7' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: '16px', lineHeight: 1 }}>{mood.emoji}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', color: mood.color }}>
                          {mood.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Team note ── */}
                  <div className="flex gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/50 mb-5">
                    <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} className="text-blue-700/70 block mb-0.5">
                        {isPast ? 'What we did' : isCurrent ? 'What\'s happening' : 'What\'s planned'}
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Manrope, sans-serif', lineHeight: '1.55' }} className="text-gray-600">
                        {data.teamNote}
                      </p>
                    </div>
                  </div>

                  {/* ── Tasks ── */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} className="text-gray-900">
                        {isCurrent ? 'This week\'s tasks' : `Week ${activeWeek} tasks`}
                      </span>

                      {/* ── Filter toggles ── */}
                      <div
                        className="flex items-center rounded-lg overflow-hidden"
                        style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}
                      >
                        {(['all', 'done', 'pending'] as const).map((filter) => {
                          const isActive = taskFilter === filter;
                          const count = filter === 'all'
                            ? data.checklist.length
                            : filter === 'done'
                              ? data.checklist.filter(t => t.completed).length
                              : data.checklist.filter(t => !t.completed).length;
                          return (
                            <button
                              key={filter}
                              onClick={() => setTaskFilter(filter)}
                              className="px-2.5 py-1 transition-all duration-150"
                              style={{
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 400,
                                fontFamily: 'Manrope, sans-serif',
                                color: isActive ? '#204CC7' : '#6B7280',
                                background: isActive ? '#FFFFFF' : 'transparent',
                                boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                              }}
                            >
                              {filter.charAt(0).toUpperCase() + filter.slice(1)}{' '}
                              <span style={{ fontSize: '13px', fontWeight: 400, color: isActive ? '#204CC7' : '#9CA3AF' }}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Hint for expandable notes ── */}
                    <div className="flex items-center gap-1.5 mb-2 px-3">
                      <Info className="w-3 h-3 text-gray-300" />
                      <span style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif', color: '#9CA3AF' }}>
                        Tap any task to see why it matters
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {data.checklist
                        .filter((task) => {
                          if (taskFilter === 'done') return task.completed;
                          if (taskFilter === 'pending') return !task.completed;
                          return true;
                        })
                        .map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            isExpanded={expandedTaskId === task.id}
                            onToggle={() => toggleTaskExpand(task.id)}
                          />
                        ))}
                      {data.checklist.filter((task) => {
                        if (taskFilter === 'done') return task.completed;
                        if (taskFilter === 'pending') return !task.completed;
                        return true;
                      }).length === 0 && (
                        <div className="text-center py-4">
                          <span style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-gray-400">
                            {taskFilter === 'done' ? 'No completed tasks yet' : 'All tasks are done!'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Feedback — only for current week ── */}
                  {isCurrent && (
                    <div className="rounded-xl border border-gray-100 p-4" style={{ background: '#FAFBFC' }}>
                      {feedbackSent ? (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center gap-2 py-3"
                        >
                          <ThumbsUp className="w-4 h-4 text-emerald-500" />
                          <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }} className="text-emerald-600">
                            Thanks for your feedback!
                          </span>
                        </motion.div>
                      ) : (
                        <>
                          <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} className="text-gray-700 block mb-3">
                            How's this week going?
                          </span>
                          <div className="flex items-center gap-2 mb-3">
                            {MOOD_EMOJIS.map((m, i) => (
                              <button
                                key={i}
                                onClick={() => setFeedbackRating(i)}
                                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all duration-150"
                                style={{
                                  background: feedbackRating === i ? m.bg : 'transparent',
                                  border: feedbackRating === i ? `1.5px solid ${m.ring}` : '1.5px solid transparent',
                                  opacity: feedbackRating === null || feedbackRating === i ? 1 : 0.35,
                                }}
                              >
                                <span style={{ fontSize: '22px' }}>{m.emoji}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: feedbackRating === i ? 600 : 400,
                                  fontFamily: 'Manrope, sans-serif',
                                  color: feedbackRating === i ? m.color : '#9CA3AF',
                                }}>
                                  {m.label}
                                </span>
                              </button>
                            ))}
                          </div>

                          {feedbackRating !== null && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.2 }}
                              className="flex gap-2"
                            >
                              <input
                                type="text"
                                value={feedbackNote}
                                onChange={(e) => setFeedbackNote(e.target.value)}
                                placeholder="Add a note (optional)"
                                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-300 transition-all"
                                style={{ fontSize: '14px', fontFamily: 'Manrope, sans-serif' }}
                              />
                              <button
                                onClick={handleSubmitFeedback}
                                className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.97] flex items-center gap-1.5"
                                style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', background: '#204CC7' }}
                              >
                                <Send className="w-3.5 h-3.5" />
                                Send
                              </button>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export { generateWeekData, type WeeklySnapshot };
