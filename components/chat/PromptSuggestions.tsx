import { TrendingUp, TrendingDown, BarChart3, Zap, Target, IndianRupee, AlertTriangle, CheckCircle2, Database, ChevronRight, Radio } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import type { ComponentType, SVGProps } from 'react';

// ── Prompt definition ──
interface PromptItem {
  text: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
  color: string; // tailwind bg + text classes for the icon pill
}

// ── Prompt sets keyed by service + businessType ──
// Marketing: ecommerce | leadgen
// Finance:   ecommerce-restaurants | trading-manufacturing

const MARKETING_ECOMMERCE_PROMPTS: PromptItem[] = [
  { text: 'How is my ROAS tracking against target this month?', icon: TrendingUp, color: 'bg-brand/10 text-brand' },
  { text: 'Which campaigns should I pause to stop wasting spend?', icon: AlertTriangle, color: 'bg-rose-50 text-rose-500' },
  { text: "Why is my CAC climbing — and how do I fix it?", icon: IndianRupee, color: 'bg-purple-50 text-purple-500' },
  { text: 'Which creatives are driving the most revenue right now?', icon: Zap, color: 'bg-teal-50 text-teal-500' },
  { text: 'Meta vs Google — where should I shift my budget?', icon: BarChart3, color: 'bg-amber-50 text-amber-500' },
  { text: 'Show me products with declining sales and why', icon: TrendingDown, color: 'bg-emerald-50 text-emerald-500' },
];

const MARKETING_LEADGEN_PROMPTS: PromptItem[] = [
  { text: 'How is my CPL tracking against target this month?', icon: TrendingUp, color: 'bg-brand/10 text-brand' },
  { text: 'Which campaigns should I pause to stop bleeding budget?', icon: AlertTriangle, color: 'bg-rose-50 text-rose-500' },
  { text: 'Which creatives are driving my best quality leads?', icon: Zap, color: 'bg-teal-50 text-teal-500' },
  { text: 'LinkedIn vs Google — where are my SQLs really coming from?', icon: BarChart3, color: 'bg-amber-50 text-amber-500' },
  { text: "Where's my pipeline leaking? Show conversion trends.", icon: Target, color: 'bg-purple-50 text-purple-500' },
  { text: "Show me my biggest issues right now", icon: AlertTriangle, color: 'bg-emerald-50 text-emerald-500' },
];

const FINANCE_ECOMMERCE_PROMPTS: PromptItem[] = [
  { text: 'Give me a full financial health snapshot for this month', icon: TrendingUp, color: 'bg-brand/10 text-brand' },
  { text: 'Flag every overdue invoice I need to chase today', icon: AlertTriangle, color: 'bg-rose-50 text-rose-500' },
  { text: 'Break down my revenue — website, marketplace & in-store', icon: BarChart3, color: 'bg-purple-50 text-purple-500' },
  { text: 'Show my P&L and why gross margins are moving', icon: IndianRupee, color: 'bg-teal-50 text-teal-500' },
  { text: 'What GST returns and tax filings are due this month?', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-500' },
];

const FINANCE_TRADING_PROMPTS: PromptItem[] = [
  { text: 'Give me a full financial health snapshot for this month', icon: TrendingUp, color: 'bg-brand/10 text-brand' },
  { text: 'Show my cash flow position and working capital health', icon: IndianRupee, color: 'bg-rose-50 text-rose-500' },
  { text: 'Receivables aging — who owes me and for how long?', icon: BarChart3, color: 'bg-purple-50 text-purple-500' },
  { text: 'Are my expenses growing faster than revenue?', icon: TrendingDown, color: 'bg-teal-50 text-teal-500' },
  { text: 'What GST, TDS and advance tax deadlines are coming?', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-500' },
];

/**
 * Resolve the correct prompt set for a given service type and business type.
 *
 * service:      'Performance Marketing' | 'Accounts & Taxation'
 * businessType: 'ecommerce' | 'leadgen' | 'ecommerce-restaurants' | 'trading-manufacturing'
 */
export function getPromptsForAccount(
  service: string,
  businessType: string,
): PromptItem[] {
  if (service === 'Accounts & Taxation') {
    return businessType === 'ecommerce-restaurants'
      ? FINANCE_ECOMMERCE_PROMPTS
      : FINANCE_TRADING_PROMPTS;
  }
  // Performance Marketing
  return businessType === 'ecommerce'
    ? MARKETING_ECOMMERCE_PROMPTS
    : MARKETING_LEADGEN_PROMPTS;
}

// ── Motion variants ──
// Motion's Variants type wants ease as a named curve or a 4-tuple, not a plain
// string or number[]. Using `as const` preserves the literal types.

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // Small delay before children start, then stagger each child
      delayChildren: 0.15,
      staggerChildren: 0.07,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

// ── Component ──

interface PromptSuggestionsProps {
  service: string;
  businessType: string;
  onPromptClick: (prompt: string) => void;
}

export function PromptSuggestions({ service, businessType, onPromptClick }: PromptSuggestionsProps) {
  const prompts = getPromptsForAccount(service, businessType);
  const promptKey = `${service}-${businessType}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={promptKey}
        className="mt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div className="mb-6" variants={headingVariants}>
          <h3 className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>Try asking me about...</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-emerald-600" style={{ fontSize: '13px', fontWeight: 500 }}>Live data from your Dashboard</span>
          </div>
        </motion.div>

        <div className="space-y-2">
          {prompts.map((prompt) => {
            const Icon = prompt.icon;

            return (
              <motion.button
                key={prompt.text}
                variants={itemVariants}
                onClick={() => onPromptClick(prompt.text)}
                whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(32, 76, 199, 0.08)' }}
                whileTap={{ scale: 0.99 }}
                className="group text-left w-full p-4 bg-white/80 backdrop-blur-sm hover:bg-[#f4f6fd] border border-gray-100 hover:border-[#204CC7]/15 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${prompt.color} rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-gray-700 flex-1" style={{ fontSize: '14px', fontWeight: 400 }}>{prompt.text}</p>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}