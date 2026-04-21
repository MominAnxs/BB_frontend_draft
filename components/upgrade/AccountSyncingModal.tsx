'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Palette, Globe, TrendingUp, 
  Wallet, ArrowLeftRight, ShieldCheck, PieChart,
  CheckCircle2, Sparkles, ArrowRight, Zap, Filter, ShoppingCart
} from 'lucide-react';

type ServiceType = 'marketing' | 'finance';
type BusinessModel = 'ecommerce' | 'leadgen' | 'ecommerce-restaurants' | 'trading-manufacturing';

interface SyncItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

const marketingEcommerceItems: SyncItem[] = [
  {
    id: 'campaigns',
    icon: <BarChart3 className="w-4 h-4" />,
    label: 'Campaign Performance',
    description: 'Syncing spend, revenue, and ROAS across Meta and Google — mapping every campaign down to ad set level.',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 ring-1 ring-blue-100',
  },
  {
    id: 'creatives',
    icon: <Palette className="w-4 h-4" />,
    label: 'Creative Performance',
    description: 'Analyzing CTR, CPA, and creative fatigue across all active ads — flagging what to scale and what to refresh.',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 ring-1 ring-purple-100',
  },
  {
    id: 'website',
    icon: <Globe className="w-4 h-4" />,
    label: 'Website Performance',
    description: 'Measuring conversion rates, checkout flow, and page speed — tracking where sessions turn into orders.',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 ring-1 ring-emerald-100',
  },
  {
    id: 'sales',
    icon: <ShoppingCart className="w-4 h-4" />,
    label: 'Sales Performance',
    description: 'Pulling in gross sales, AOV, and order fulfillment data — connecting your store revenue to ad spend.',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 ring-1 ring-amber-100',
  },
];

const marketingLeadGenItems: SyncItem[] = [
  {
    id: 'campaigns',
    icon: <BarChart3 className="w-4 h-4" />,
    label: 'Campaign Performance',
    description: 'Syncing spend, leads, and CPL across Meta, Google, and LinkedIn — mapping each campaign to real outcomes.',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 ring-1 ring-blue-100',
  },
  {
    id: 'creatives',
    icon: <Palette className="w-4 h-4" />,
    label: 'Creative Performance',
    description: 'Analyzing CTR, cost per lead, and creative fatigue across active ads — surfacing what drives form fills.',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 ring-1 ring-purple-100',
  },
  {
    id: 'website',
    icon: <Globe className="w-4 h-4" />,
    label: 'Website Performance',
    description: 'Measuring landing page speed, form submissions, and visitor behavior — optimizing every conversion point.',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 ring-1 ring-emerald-100',
  },
  {
    id: 'funnel',
    icon: <Filter className="w-4 h-4" />,
    label: 'Funnel Performance',
    description: 'Tracking the full journey from ad impression to consultation booked — identifying every drop-off stage.',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 ring-1 ring-amber-100',
  },
];

const financeEcommerceItems: SyncItem[] = [
  {
    id: 'financial-health',
    icon: <Wallet className="w-4 h-4" />,
    label: 'Financial Health',
    description: 'Analyzing your P&L across sales channels — margins, COGS, and profitability per product line.',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 ring-1 ring-blue-100',
  },
  {
    id: 'cashflow',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    label: 'Cash Flow Analysis',
    description: 'Mapping collections, vendor payouts, and platform settlements — your real-time cash position.',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 ring-1 ring-emerald-100',
  },
  {
    id: 'compliance',
    icon: <ShieldCheck className="w-4 h-4" />,
    label: 'Compliance Status',
    description: 'Reviewing GST on marketplace transactions, TDS, and filing calendars — no deadline missed.',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 ring-1 ring-amber-100',
  },
  {
    id: 'revenue',
    icon: <PieChart className="w-4 h-4" />,
    label: 'Revenue Insights',
    description: 'Breaking down revenue by channel, product mix, and seasonal trends — your growth roadmap.',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 ring-1 ring-purple-100',
  },
];

const financeTradingItems: SyncItem[] = [
  {
    id: 'financial-health',
    icon: <Wallet className="w-4 h-4" />,
    label: 'Financial Health',
    description: 'Analyzing your P&L and balance sheet — building a complete snapshot of your financial position.',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 ring-1 ring-blue-100',
  },
  {
    id: 'cashflow',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    label: 'Cash Flow Analysis',
    description: 'Mapping receivables, payables, and working capital cycles — your real-time liquidity picture.',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 ring-1 ring-emerald-100',
  },
  {
    id: 'compliance',
    icon: <ShieldCheck className="w-4 h-4" />,
    label: 'Compliance Status',
    description: 'Reviewing GST, TDS, advance tax, and statutory filings — ensuring full regulatory compliance.',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 ring-1 ring-amber-100',
  },
  {
    id: 'revenue',
    icon: <PieChart className="w-4 h-4" />,
    label: 'Revenue Insights',
    description: 'Breaking down client-wise profitability, margins, and revenue trends — your strategic overview.',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 ring-1 ring-purple-100',
  },
];

function getItems(serviceType: ServiceType, businessModel?: BusinessModel): SyncItem[] {
  if (serviceType === 'finance') {
    if (businessModel === 'ecommerce-restaurants') return financeEcommerceItems;
    if (businessModel === 'trading-manufacturing') return financeTradingItems;
    return financeTradingItems; // default finance fallback
  }
  // marketing
  if (businessModel === 'ecommerce') return marketingEcommerceItems;
  if (businessModel === 'leadgen') return marketingLeadGenItems;
  return marketingEcommerceItems; // default marketing fallback
}

interface AccountSyncingModalProps {
  serviceType: ServiceType;
  businessModel?: BusinessModel;
  onComplete: () => void;
}

export function AccountSyncingModal({ serviceType, businessModel, onComplete }: AccountSyncingModalProps) {
  const items = getItems(serviceType, businessModel);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const initialDelay = setTimeout(() => setActiveIndex(0), 800);
    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= items.length) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const processingTime = 1800 + Math.random() * 700;

    timers.push(setTimeout(() => {
      setCompletedItems(prev => new Set([...prev, items[activeIndex].id]));
    }, processingTime));

    timers.push(setTimeout(() => {
      if (activeIndex < items.length - 1) {
        setActiveIndex(activeIndex + 1);
      }
    }, processingTime + 350));

    if (activeIndex === items.length - 1) {
      timers.push(setTimeout(() => setAllDone(true), processingTime + 900));
    }

    return () => timers.forEach(clearTimeout);
  }, [activeIndex, items]);

  const progressPercent = items.length > 0 
    ? (completedItems.size / items.length) * 100 
    : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-[8px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 w-full max-w-[460px] mx-4"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div 
          className="bg-white rounded-2xl overflow-hidden border border-gray-200/60"
          style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
        >
          {/* Content */}
          <div className="px-6 pt-5 pb-5">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="relative flex-shrink-0">
                {!allDone && (
                  <>
                    <div 
                      className="absolute -inset-1 rounded-[14px] bg-blue-400/15"
                      style={{ animation: 'syncPulseRing 2.4s ease-out infinite' }}
                    />
                    <div 
                      className="absolute -inset-0.5 rounded-[12px] bg-blue-400/10"
                      style={{ animation: 'syncPulseRing 2.4s ease-out infinite 0.6s' }}
                    />
                  </>
                )}
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-600 ${
                  allDone 
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-md shadow-emerald-500/25' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25'
                }`}>
                  <AnimatePresence mode="wait">
                    {allDone ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      >
                        <CheckCircle2 className="w-[18px] h-[18px] text-white" />
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="sync" 
                        exit={{ scale: 0, opacity: 0 }}
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Zap className="w-[18px] h-[18px] text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-gray-900 tracking-tight" style={{ fontSize: '17px', lineHeight: '1.3' }}>
                  {allDone ? 'You\'re all set!' : 'Analyzing your data'}
                </h2>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {allDone 
                    ? 'Your personalized dashboard is ready.' 
                    : 'Building your performance dashboard...'}
                </p>
              </div>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5 mb-4"
            >
              <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-600 ${
                    allDone 
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500'
                  }`}
                  style={!allDone ? { backgroundSize: '200% 100%' } : {}}
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: allDone ? '100%' : `${progressPercent}%`,
                    ...((!allDone && progressPercent > 0) ? { backgroundPosition: ['0% 0%', '200% 0%'] } : {})
                  }}
                  transition={{ 
                    width: { duration: 0.5, ease: 'easeOut' },
                    backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                  }}
                />
              </div>
              <span className="text-[13px] text-emerald-600 font-medium tabular-nums w-7 text-right">
                {allDone ? '100' : Math.round(progressPercent)}%
              </span>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mb-4" />

            {/* Analysis items */}
            <div className="space-y-1 mb-4">
              <AnimatePresence>
                {items.map((item, index) => {
                  const isActive = index === activeIndex && !completedItems.has(item.id);
                  const isComplete = completedItems.has(item.id);
                  const isVisible = index <= activeIndex;

                  if (!isVisible) return null;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-gray-50/80 to-blue-50/40' 
                          : ''
                      }`}>
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mt-0.5 ${
                          isComplete ? 'bg-emerald-50 ring-1 ring-emerald-100' : item.iconBg
                        }`}>
                          <AnimatePresence mode="wait">
                            {isComplete ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="icon"
                                className={item.iconColor}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                {item.icon}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`transition-colors duration-500 ${
                              isComplete ? 'text-gray-600' : 'text-gray-900'
                            }`} style={{ fontSize: '14px', lineHeight: '1.3' }}>
                              {item.label}
                            </p>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex gap-[3px] items-center ml-0.5"
                              >
                                <span className="w-[3px] h-[3px] bg-blue-500 rounded-full" style={{ animation: 'syncDot 1.2s ease-in-out infinite' }} />
                                <span className="w-[3px] h-[3px] bg-blue-500 rounded-full" style={{ animation: 'syncDot 1.2s ease-in-out infinite 0.2s' }} />
                                <span className="w-[3px] h-[3px] bg-blue-500 rounded-full" style={{ animation: 'syncDot 1.2s ease-in-out infinite 0.4s' }} />
                              </motion.div>
                            )}
                            {isComplete && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-[2px] rounded-full ring-1 ring-emerald-100/80 uppercase tracking-wide"
                              >
                                Ready
                              </motion.span>
                            )}
                          </div>
                          <motion.p 
                            className={`mt-0.5 leading-relaxed transition-colors duration-500 ${
                              isComplete ? 'text-gray-400' : 'text-gray-500'
                            }`}
                            style={{ fontSize: '12.5px', lineHeight: '1.45' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.08 }}
                          >
                            {item.description}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer / CTA */}
            <AnimatePresence mode="wait">
              {allDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Success banner */}
                  <div className="mb-4 flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-emerald-50/80 to-green-50/50 border border-emerald-200/30 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-emerald-800/80 leading-snug" style={{ fontSize: '13px' }}>
                      All data synced successfully. Your insights dashboard is ready to explore.
                    </p>
                  </div>

                  {/* CTA */}
                  <motion.button
                    onClick={onComplete}
                    className="group w-full relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/15 hover:-translate-y-[1px] active:scale-[0.985]"
                    whileTap={{ scale: 0.985 }}
                  >
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 rounded-xl">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="relative flex items-center justify-center gap-2">
                        <span className="text-white" style={{ fontSize: '14px' }}>Let's Go</span>
                        <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.button>

                  <p className="text-center text-gray-400 mt-3" style={{ fontSize: '11.5px' }}>
                    Continue setting up your account anytime from the sidebar.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-2 py-1"
                >
                  <div 
                    className="w-3 h-3 rounded-full border-[1.5px] border-blue-200 border-t-blue-500" 
                    style={{ animation: 'syncSpin 0.7s linear infinite' }} 
                  />
                  <p className="text-gray-500" style={{ fontSize: '12px' }}>This only takes a moment...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes syncPulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes syncDot {
          0%, 100% { opacity: 0.25; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes syncSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
