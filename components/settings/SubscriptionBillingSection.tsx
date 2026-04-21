'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  CreditCard, Check, Crown, Zap, BarChart3, Download,
  Calendar, ArrowRight, ChevronDown, ChevronUp, Receipt,
  ArrowUpRight, Shield, Clock, Star, Sparkles, Building2,
  CheckCircle2, FileText, ExternalLink, Plus, Pencil, X, Loader2,
} from 'lucide-react';

// ── Stagger animation wrapper ──
function StaggerItem({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 * index }}
    >
      {children}
    </motion.div>
  );
}

// ── Usage Bar ──
function UsageBar({ label, used, total, unit, color }: { label: string; used: number; total: number; unit: string; color: string }) {
  const percentage = Math.min((used / total) * 100, 100);
  const colorMap: Record<string, { bar: string; bg: string; text: string }> = {
    blue: { bar: 'bg-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
    violet: { bar: 'bg-violet-500', bg: 'bg-violet-100', text: 'text-violet-600' },
    emerald: { bar: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-600' },
    amber: { bar: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-semibold ${c.text}`}>{used} / {total} {unit}</span>
      </div>
      <div className={`h-1.5 ${c.bg} rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${c.bar} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ── Plan Feature Item ──
function PlanFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-100">
        <Check className="w-3 h-3 text-emerald-600" />
      </div>
      <span className="text-sm text-gray-700">{text}</span>
    </div>
  );
}

// ── Available Plan Card ──
function PlanOption({ plan, isCurrentPlan, onSelect }: {
  plan: { name: string; price: string; period: string; features: string[]; popular?: boolean; icon: typeof Crown };
  isCurrentPlan: boolean;
  onSelect: () => void;
}) {
  const Icon = plan.icon;

  return (
    <motion.div
      className={`relative rounded-2xl border p-5 transition-all duration-200 ${
        isCurrentPlan
          ? 'border-blue-200 bg-blue-50/50 ring-1 ring-blue-100'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md cursor-pointer'
      }`}
      whileHover={!isCurrentPlan ? { y: -2 } : undefined}
      onClick={!isCurrentPlan ? onSelect : undefined}
    >
      {plan.popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-semibold rounded-full shadow-sm">
            Most Popular
          </span>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-2.5 right-4">
          <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-semibold rounded-full shadow-sm">
            Current
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          isCurrentPlan ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <Icon className={`w-4.5 h-4.5 ${isCurrentPlan ? 'text-blue-600' : 'text-gray-600'}`} />
        </div>
        <h4 className="text-sm font-semibold text-gray-900">{plan.name}</h4>
      </div>
      <div className="flex items-baseline gap-0.5 mb-3">
        <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
        <span className="text-xs text-gray-500">/{plan.period}</span>
      </div>
      <div className="space-y-1.5">
        {plan.features.map((feat, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className={`w-3 h-3 flex-shrink-0 ${isCurrentPlan ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-xs text-gray-600">{feat}</span>
          </div>
        ))}
      </div>
      {!isCurrentPlan && (
        <button className="w-full mt-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-1.5">
          Switch Plan
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

// ── Main Component ──
export function SubscriptionBillingSection() {
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  // ── Billing Details editable state ──
  const [billingData, setBillingData] = useState({
    companyName: 'Brego Digital Pvt. Ltd.',
    gstNumber: '27AADCB2230M1ZP',
    billingAddress: 'Mumbai, Maharashtra 400001',
    billingEmail: 'accounts@company.com',
  });
  const [billingDraft, setBillingDraft] = useState({ ...billingData });
  const [billingEditing, setBillingEditing] = useState(false);
  const [billingSaving, setBillingSaving] = useState(false);

  const handleBillingEdit = () => {
    setBillingDraft({ ...billingData });
    setBillingEditing(true);
  };

  const handleBillingCancel = () => {
    setBillingDraft({ ...billingData });
    setBillingEditing(false);
  };

  const handleBillingSave = () => {
    setBillingSaving(true);
    setTimeout(() => {
      setBillingData({ ...billingDraft });
      setBillingSaving(false);
      setBillingEditing(false);
      toast.success('Billing Details updated', {
        description: 'Your changes have been saved.',
        duration: 2500,
      });
    }, 800);
  };

  const currentPlan = {
    name: 'Professional',
    price: '₹25,000',
    period: 'month',
    status: 'Active' as const,
    nextBilling: 'March 1, 2026',
    startDate: 'January 1, 2026',
    features: [
      'Full access to all reports & analytics',
      'Up to 10 team members',
      'Priority email & chat support',
      'Custom branding & white-label',
      'API access & integrations',
      'Dedicated account manager',
    ],
  };

  const usage = [
    { label: 'Team Members', used: 4, total: 10, unit: 'seats', color: 'blue' },
    { label: 'Active Campaigns', used: 7, total: 15, unit: 'campaigns', color: 'violet' },
    { label: 'Storage Used', used: 2.4, total: 10, unit: 'GB', color: 'emerald' },
    { label: 'API Calls (this month)', used: 8420, total: 25000, unit: 'calls', color: 'amber' },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '₹9,999',
      period: 'month',
      icon: Zap,
      features: ['Basic analytics dashboard', 'Up to 3 team members', 'Email support', 'Standard reports'],
    },
    {
      name: 'Professional',
      price: '₹25,000',
      period: 'month',
      icon: Crown,
      popular: true,
      features: ['Full analytics & reporting', 'Up to 10 team members', 'Priority support', 'API access'],
    },
    {
      name: 'Enterprise',
      price: '₹49,999',
      period: 'month',
      icon: Sparkles,
      features: ['Everything in Professional', 'Unlimited team members', 'Custom integrations', 'SLA guarantee'],
    },
  ];

  const invoices = [
    { id: 'INV-2026-002', date: 'Feb 1, 2026', amount: '₹25,000', status: 'Paid' as const, plan: 'Professional Plan', period: 'Feb 2026' },
    { id: 'INV-2026-001', date: 'Jan 1, 2026', amount: '₹25,000', status: 'Paid' as const, plan: 'Professional Plan', period: 'Jan 2026' },
    { id: 'INV-2025-012', date: 'Dec 1, 2025', amount: '₹25,000', status: 'Paid' as const, plan: 'Professional Plan', period: 'Dec 2025' },
    { id: 'INV-2025-011', date: 'Nov 1, 2025', amount: '₹25,000', status: 'Paid' as const, plan: 'Professional Plan', period: 'Nov 2025' },
    { id: 'INV-2025-010', date: 'Oct 1, 2025', amount: '₹25,000', status: 'Paid' as const, plan: 'Professional Plan', period: 'Oct 2025' },
    { id: 'INV-2025-009', date: 'Sep 1, 2025', amount: '₹15,000', status: 'Paid' as const, plan: 'Starter Plan', period: 'Sep 2025' },
  ];

  const visibleInvoices = showAllInvoices ? invoices : invoices.slice(0, 3);

  const statusStyles: Record<string, string> = {
    Paid: 'bg-green-50 text-green-600 border-green-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Failed: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <StaggerItem index={0}>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Subscription & Billing</h1>
          <p className="text-sm text-gray-500">Manage your plan, payment method, and billing history</p>
        </div>
      </StaggerItem>

      {/* ─── SECTION 1: Current Plan Hero Card ─── */}
      <StaggerItem index={1}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Plan Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name} Plan</h3>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-md border border-emerald-100">
                      {currentPlan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">Your current active subscription</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-gray-900">{currentPlan.price}</span>
                  <span className="text-sm text-gray-400">/{currentPlan.period}</span>
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Billed Monthly</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {currentPlan.features.map((feature, i) => (
                <PlanFeature key={i} text={feature} />
              ))}
            </div>
          </div>

          {/* Billing Info Bar */}
          <div className="px-6 pb-5">
            <div className="flex items-center gap-4 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Next billing:</span>
                <span className="text-xs font-semibold text-gray-700">{currentPlan.nextBilling}</span>
              </div>
              <div className="w-px h-3.5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Member since:</span>
                <span className="text-xs font-semibold text-gray-700">{currentPlan.startDate}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <motion.button
              onClick={() => setShowAllPlans(!showAllPlans)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <ArrowUpRight className="w-4 h-4" />
              {showAllPlans ? 'Hide Plans' : 'Change Plan'}
            </motion.button>
            <button className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              Cancel Subscription
            </button>
          </div>
        </div>
      </StaggerItem>

      {/* ─── Available Plans (expandable) ─── */}
      <AnimatePresence>
        {showAllPlans && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Star className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Available Plans</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <PlanOption
                    key={plan.name}
                    plan={plan}
                    isCurrentPlan={plan.name === 'Professional'}
                    onSelect={() => {}}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SECTION 2: Usage & Limits ─── */}
      <StaggerItem index={2}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Usage & Limits</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {usage.map((item) => (
              <UsageBar key={item.label} {...item} />
            ))}
          </div>
        </div>
      </StaggerItem>

      {/* ─── SECTION 3: Payment Method ─── */}
      {/* Payment Method section removed */}

      {/* ─── SECTION 4: Billing Details ─── */}
      <StaggerItem index={3}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Billing Details</h3>
            {!billingEditing ? (
              <button
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                onClick={handleBillingEdit}
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            ) : (
              <button
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                onClick={handleBillingCancel}
                disabled={billingSaving}
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            )}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {!billingEditing ? (
                /* ── View Mode ── */
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-2 gap-x-8 gap-y-3"
                >
                  <div>
                    <span className="text-[13px] text-gray-500 uppercase tracking-wider font-medium">Company Name</span>
                    <p className="text-sm text-gray-800 mt-0.5">{billingData.companyName}</p>
                  </div>
                  <div>
                    <span className="text-[13px] text-gray-500 uppercase tracking-wider font-medium">GST Number</span>
                    <p className="text-sm text-gray-800 mt-0.5 font-mono">{billingData.gstNumber}</p>
                  </div>
                  <div>
                    <span className="text-[13px] text-gray-500 uppercase tracking-wider font-medium">Billing Address</span>
                    <p className="text-sm text-gray-800 mt-0.5">{billingData.billingAddress}</p>
                  </div>
                  <div>
                    <span className="text-[13px] text-gray-500 uppercase tracking-wider font-medium">Billing Email</span>
                    <p className="text-sm text-gray-800 mt-0.5">{billingData.billingEmail}</p>
                  </div>
                </motion.div>
              ) : (
                /* ── Edit Mode ── */
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="text-[13px] text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Company Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 placeholder:text-gray-300"
                        value={billingDraft.companyName}
                        onChange={(e) => setBillingDraft({ ...billingDraft, companyName: e.target.value })}
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-gray-500 uppercase tracking-wider font-medium block mb-1.5">GST Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 font-mono placeholder:text-gray-300"
                        value={billingDraft.gstNumber}
                        onChange={(e) => setBillingDraft({ ...billingDraft, gstNumber: e.target.value })}
                        placeholder="e.g. 27AADCB2230M1ZP"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Billing Address</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 placeholder:text-gray-300"
                        value={billingDraft.billingAddress}
                        onChange={(e) => setBillingDraft({ ...billingDraft, billingAddress: e.target.value })}
                        placeholder="City, State, PIN"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Billing Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 placeholder:text-gray-300"
                        value={billingDraft.billingEmail}
                        onChange={(e) => setBillingDraft({ ...billingDraft, billingEmail: e.target.value })}
                        placeholder="billing@company.com"
                      />
                    </div>
                  </div>

                  {/* Save / Cancel actions */}
                  <div className="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-gray-100">
                    <button
                      className="px-4 py-2 text-xs font-medium text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                      onClick={handleBillingCancel}
                      disabled={billingSaving}
                    >
                      Discard
                    </button>
                    <motion.button
                      className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60"
                      onClick={handleBillingSave}
                      disabled={billingSaving}
                      whileTap={{ scale: 0.97 }}
                    >
                      {billingSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </StaggerItem>

      {/* ─── SECTION 5: Invoice History ─── */}
      <StaggerItem index={4}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Invoice History</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400">{invoices.length} invoices</span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors duration-200">
                <Download className="w-3 h-3" />
                Export All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {visibleInvoices.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/40 transition-colors duration-150 group"
              >
                {/* Invoice icon */}
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-200">
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{inv.id}</p>
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md border ${statusStyles[inv.status]}`}>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{inv.plan} &middot; {inv.period}</p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">{inv.amount}</p>
                  <p className="text-[13px] text-gray-500">{inv.date}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Download Invoice"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="View Invoice"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Show more / less */}
          {invoices.length > 3 && (
            <div className="px-6 py-3 border-t border-gray-100">
              <button
                onClick={() => setShowAllInvoices(!showAllInvoices)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showAllInvoices ? (
                  <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>View All Invoices ({invoices.length}) <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </StaggerItem>

      {/* ─── Security footer ─── */}
      <StaggerItem index={5}>
        <div className="flex items-start gap-3 px-5 py-4 bg-gray-50/80 rounded-2xl border border-gray-200/60">
          <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600 font-medium">Payments secured by Razorpay</p>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Your payment information is encrypted and securely processed. We never store full card details on our servers.
            </p>
          </div>
        </div>
      </StaggerItem>
    </div>
  );
}