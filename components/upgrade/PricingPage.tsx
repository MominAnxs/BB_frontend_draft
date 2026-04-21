'use client';

import { useState } from 'react';
import { CheckCircle2, Phone, Zap, Crown, Building2, Rocket, ArrowRight, Shield, Star, Users } from 'lucide-react';

interface PricingPageProps {
  service: 'marketing' | 'finance';
  onSelectPlan: (planName: string) => void;
}

interface PlanFeature {
  name: string;
  startup: boolean | string;
  growing: boolean | string;
  enterprise: boolean | string;
}

export function PricingPage({ service, onSelectPlan }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const isFinance = service === 'finance';

  const marketingPlans = {
    startup: {
      name: 'Starter',
      icon: <Rocket className="w-5 h-5" />,
      tagline: 'For early-stage brands',
      setupFee: '25,000',
      monthlyFee: billingCycle === 'monthly' ? '30,000' : '25,000',
      adSpend: 'Up to Rs.2L/month',
      highlight: false,
    },
    growing: {
      name: 'Growth',
      icon: <Zap className="w-5 h-5" />,
      tagline: 'For scaling businesses',
      setupFee: '50,000',
      monthlyFee: billingCycle === 'monthly' ? '55,000' : '45,000',
      adSpend: 'Rs.2L - Rs.10L/month',
      highlight: true,
    },
    enterprise: {
      name: 'Enterprise',
      icon: <Building2 className="w-5 h-5" />,
      tagline: 'For large-scale operations',
      setupFee: null,
      monthlyFee: null,
      adSpend: 'Rs.10L+/month',
      highlight: false,
    },
  };

  const financePlans = {
    startup: {
      name: 'Startup',
      icon: <Rocket className="w-5 h-5" />,
      tagline: 'For small businesses',
      setupFee: '35,000',
      monthlyFee: billingCycle === 'monthly' ? '35,000' : '29,000',
      transactions: '0 - 500',
      highlight: false,
    },
    growing: {
      name: 'Growing Business',
      icon: <Zap className="w-5 h-5" />,
      tagline: 'For scaling operations',
      setupFee: '60,000',
      monthlyFee: billingCycle === 'monthly' ? '60,000' : '50,000',
      transactions: '500 - 1,000',
      highlight: true,
    },
    enterprise: {
      name: 'Enterprise',
      icon: <Building2 className="w-5 h-5" />,
      tagline: 'For large enterprises',
      setupFee: null,
      monthlyFee: null,
      transactions: '1,000+',
      highlight: false,
    },
  };

  const marketingFeatures: { category: string; features: PlanFeature[] }[] = [
    {
      category: 'Campaign Management',
      features: [
        { name: 'Meta Ads Management', startup: true, growing: true, enterprise: true },
        { name: 'Google Ads Management', startup: true, growing: true, enterprise: true },
        { name: 'LinkedIn Ads Management', startup: false, growing: true, enterprise: true },
        { name: 'Campaign Strategy & Planning', startup: 'Basic', growing: 'Advanced', enterprise: 'Custom' },
        { name: 'A/B Testing & Optimization', startup: true, growing: true, enterprise: true },
      ],
    },
    {
      category: 'Creative & Content',
      features: [
        { name: 'Ad Creative Design', startup: '4/month', growing: '10/month', enterprise: 'Unlimited' },
        { name: 'Landing Page Design', startup: '1', growing: '3', enterprise: 'Custom' },
        { name: 'Copywriting', startup: true, growing: true, enterprise: true },
        { name: 'Video Ad Production', startup: false, growing: '2/month', enterprise: 'Unlimited' },
      ],
    },
    {
      category: 'Reporting & Analytics',
      features: [
        { name: 'Real-time Dashboard', startup: true, growing: true, enterprise: true },
        { name: 'Weekly Performance Reports', startup: true, growing: true, enterprise: true },
        { name: 'Competitor Analysis', startup: false, growing: true, enterprise: true },
        { name: 'Dedicated Account Manager', startup: false, growing: true, enterprise: true },
        { name: 'Custom Analytics & Attribution', startup: false, growing: false, enterprise: true },
      ],
    },
  ];

  const financeFeatures: { category: string; features: PlanFeature[] }[] = [
    {
      category: 'Accounting',
      features: [
        { name: 'Data Entry', startup: true, growing: true, enterprise: true },
        { name: 'Reviews of Books', startup: true, growing: true, enterprise: true },
        { name: 'Bank Reconciliation', startup: true, growing: true, enterprise: true },
        { name: 'P&L & Balance Sheet', startup: true, growing: true, enterprise: true },
      ],
    },
    {
      category: 'Tax',
      features: [
        { name: 'GSTR1/3B Calculation & Filing', startup: true, growing: true, enterprise: true },
        { name: 'GST2B Reconciliation', startup: true, growing: true, enterprise: true },
        { name: 'TDS Calculation & Filing', startup: true, growing: true, enterprise: true },
        { name: 'TDS 26AS Reconciliation', startup: true, growing: true, enterprise: true },
        { name: 'Income Tax Filing', startup: false, growing: true, enterprise: true },
      ],
    },
    {
      category: 'Advisory',
      features: [
        { name: 'Monthly Financial Review', startup: false, growing: true, enterprise: true },
        { name: 'Cash Flow Forecasting', startup: false, growing: true, enterprise: true },
        { name: 'Tax Planning & Advisory', startup: false, growing: true, enterprise: true },
        { name: 'Dedicated CA/Accountant', startup: false, growing: false, enterprise: true },
        { name: 'CFO-level Guidance', startup: false, growing: false, enterprise: true },
      ],
    },
  ];

  const plans = isFinance ? financePlans : marketingPlans;
  const features = isFinance ? financeFeatures : marketingFeatures;

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-4">
          <Crown className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {isFinance ? 'Accounts & Taxation' : 'Performance Marketing'} Plans
          </span>
        </div>
        <h2 className="text-gray-900 mb-3" style={{ fontSize: '28px' }}>
          Choose the right plan for your business
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto" style={{ fontSize: '15px' }}>
          {isFinance
            ? 'Streamline your finances with expert CA-backed services. All prices are exclusive of 18% GST.'
            : 'Scale your digital marketing with AI-powered insights and expert execution. All prices are exclusive of 18% GST.'}
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${billingCycle === 'annual' ? 'left-[26px]' : 'left-0.5'}`} />
          </button>
          <span className={`text-sm ${billingCycle === 'annual' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Annual</span>
          {billingCycle === 'annual' && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              Save ~17%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-3 gap-5 mb-12">
        {/* Starter/Startup */}
        <div 
          className={`relative rounded-2xl border p-6 transition-all duration-300 ${
            hoveredPlan === 'startup' ? 'border-blue-300 shadow-lg shadow-blue-100/50 scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
          }`}
          onMouseEnter={() => setHoveredPlan('startup')}
          onMouseLeave={() => setHoveredPlan(null)}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              {plans.startup.icon}
            </div>
            <h3 className="text-blue-600 font-semibold" style={{ fontSize: '16px' }}>{plans.startup.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-10">{plans.startup.tagline}</p>

          <div className="mb-1">
            <p className="text-xs text-gray-500 mb-1">One Time Setup Fee</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">Rs.{plans.startup.setupFee}</span>
              <span className="text-xs text-gray-400">+18% GST</span>
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-1 mt-3">Monthly Fee</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">Rs.{plans.startup.monthlyFee}</span>
              <span className="text-xs text-gray-400">+18% GST</span>
            </div>
          </div>

          <div className="mb-5 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">{isFinance ? 'No. of Transactions' : 'Ad Spend Range'}</p>
            <p className="text-sm font-medium text-gray-800">{isFinance ? (plans.startup as any).transactions : (plans.startup as any).adSpend}</p>
          </div>

          <button
            onClick={() => onSelectPlan(plans.startup.name)}
            className="w-full py-3 border-2 border-gray-900 text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Growing Business */}
        <div 
          className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
            hoveredPlan === 'growing' ? 'border-blue-500 shadow-xl shadow-blue-100/60 scale-[1.02]' : 'border-blue-400 shadow-lg shadow-blue-100/40'
          }`}
          onMouseEnter={() => setHoveredPlan('growing')}
          onMouseLeave={() => setHoveredPlan(null)}
        >
          {/* Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center gap-1.5">
              <Star className="w-3 h-3 text-white fill-white" />
              <span className="text-xs font-semibold text-white">Most Popular</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1 mt-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              {plans.growing.icon}
            </div>
            <h3 className="text-blue-600 font-semibold" style={{ fontSize: '16px' }}>{plans.growing.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-10">{plans.growing.tagline}</p>

          <div className="mb-1">
            <p className="text-xs text-gray-500 mb-1">One Time Setup Fee</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">Rs.{plans.growing.setupFee}</span>
              <span className="text-xs text-gray-400">+18% GST</span>
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-1 mt-3">Monthly Fee</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">Rs.{plans.growing.monthlyFee}</span>
              <span className="text-xs text-gray-400">+18% GST</span>
            </div>
          </div>

          <div className="mb-5 px-3 py-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-500">{isFinance ? 'No. of Transactions' : 'Ad Spend Range'}</p>
            <p className="text-sm font-medium text-blue-800">{isFinance ? (plans.growing as any).transactions : (plans.growing as any).adSpend}</p>
          </div>

          <button
            onClick={() => onSelectPlan(plans.growing.name)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/25"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Enterprise */}
        <div 
          className={`relative rounded-2xl border p-6 transition-all duration-300 ${
            hoveredPlan === 'enterprise' ? 'border-gray-400 shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
          }`}
          onMouseEnter={() => setHoveredPlan('enterprise')}
          onMouseLeave={() => setHoveredPlan(null)}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              {plans.enterprise.icon}
            </div>
            <h3 className="text-gray-800 font-semibold" style={{ fontSize: '16px' }}>{plans.enterprise.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-10">{plans.enterprise.tagline}</p>

          <div className="mb-5 mt-3">
            <p className="text-3xl font-bold text-gray-900 mb-1">Contact Sales</p>
            <p className="text-xs text-gray-500">Custom pricing for your needs</p>
          </div>

          <div className="mb-5 px-3 py-2 bg-gray-50 rounded-lg mt-8">
            <p className="text-xs text-gray-500">{isFinance ? 'No. of Transactions' : 'Ad Spend Range'}</p>
            <p className="text-sm font-medium text-gray-800">{isFinance ? (plans.enterprise as any).transactions : (plans.enterprise as any).adSpend}</p>
          </div>

          <button
            onClick={() => onSelectPlan(plans.enterprise.name)}
            className="w-full py-3 border-2 border-gray-900 text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Phone className="w-4 h-4" />
            Book a Call
          </button>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>Scope of Work</h3>
        </div>
        
        {/* Table header */}
        <div className="grid grid-cols-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{plans.startup.name}</div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider text-center">{plans.growing.name}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{plans.enterprise.name}</div>
        </div>

        {features.map((category, catIndex) => (
          <div key={catIndex}>
            {/* Category header */}
            <div className="px-6 py-3 bg-blue-50/50 border-b border-gray-100">
              <span className="text-sm font-semibold text-blue-700">{category.category}</span>
            </div>
            {/* Feature rows */}
            {category.features.map((feature, fIndex) => (
              <div key={fIndex} className="grid grid-cols-4 px-6 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                <div className="text-sm text-gray-700">{feature.name}</div>
                <div className="text-center">
                  {typeof feature.startup === 'boolean' ? (
                    feature.startup ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm text-gray-700 font-medium">{feature.startup}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof feature.growing === 'boolean' ? (
                    feature.growing ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm text-blue-700 font-medium">{feature.growing}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof feature.enterprise === 'boolean' ? (
                    feature.enterprise ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm text-gray-700 font-medium">{feature.enterprise}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footnote + Trust badges */}
      <div className="mt-8 flex items-center justify-between pb-4">
        <p className="text-xs text-gray-400">
          {isFinance 
            ? '*1 Transaction = Each Data Line Item Entered into the system. All prices exclusive of 18% GST.'
            : '*Ad spend budget is managed separately. All prices exclusive of 18% GST.'
          }
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>500+ Businesses Trust Us</span>
          </div>
        </div>
      </div>
    </div>
  );
}
