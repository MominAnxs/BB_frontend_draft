'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  ChevronDown,
  Lightbulb,
  ArrowRight,
  Zap,
  Globe,
  Palette,
  Filter,
  Target,
  IndianRupee,
  ShoppingCart,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Eye,
  PlayCircle,
  Sparkles,
  Clock,
  Smartphone,
  UserPlus
} from 'lucide-react';
import { PerformanceScoreGauge } from './PerformanceScoreGauge';

// Dynamic imports — drawers are heavy (3500+ lines combined), only load when opened
const CampaignsDrawer = dynamic(() => import('./CampaignsDrawer').then(m => ({ default: m.CampaignsDrawer })), { ssr: false });
const CreativesDrawer = dynamic(() => import('./OverviewDrawers').then(m => ({ default: m.CreativesDrawer })), { ssr: false });
const WebsiteDrawer = dynamic(() => import('./OverviewDrawers').then(m => ({ default: m.WebsiteDrawer })), { ssr: false });

interface OverviewModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
  onNavigateToWebsite?: () => void;
  additionalMetrics?: string[];
}

// KPI Widget Component with Target vs Achieved Design
function KPIWidget({
  label,
  achieved,
  target,
  unit,
  icon: Icon,
  status,
  trend,
}: {
  label: string;
  achieved: number;
  target: number;
  unit: string;
  icon: any;
  status: 'good' | 'warning' | 'bad';
  trend?: string;
}) {
  const percentage = (achieved / target) * 100;
  
  const statusConfig = {
    good: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      ringColor: 'ring-green-500/20',
      textColor: 'text-green-600'
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      ringColor: 'ring-amber-500/20',
      textColor: 'text-amber-600'
    },
    bad: {
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      ringColor: 'ring-red-500/20',
      textColor: 'text-red-600'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatValue = (val: number, unit: string) => {
    if (unit === '₹') {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    if (unit === 'x') return `${val.toFixed(2)}x`;
    if (unit === '%') return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}%`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5">
      {/* Header with Status Indicator + Trend */}
      <div className="flex items-center justify-between mb-6">
        <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center ring-4 ${config.ringColor} transition-all duration-300 group-hover:scale-110`}>
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        {trend && (() => {
          const isUp = trend.startsWith('+');
          // For these metrics, going down is bad; for cost metrics like Ad Spend/CPC/CPL, down is good
          const higherIsBetter = ['Revenue', 'ROAS', 'Orders', 'AOV', 'Leads', 'Total Leads', 'Qualified Leads', 'QL', 'CTR', 'LTV'].includes(label);
          const trendIsGood = higherIsBetter ? isUp : !isUp;
          return (
            <span className={`text-[13px] flex items-center gap-0.5 ${trendIsGood ? 'text-green-600' : 'text-red-500'}`} style={{ fontWeight: 600 }}>
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend}
            </span>
          );
        })()}
      </div>

      {/* Label */}
      <div className="mb-3">
        <p className="text-sm text-gray-500" style={{ fontWeight: 500 }}>{label}</p>
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl text-gray-900 tracking-tight" style={{ fontWeight: 700 }}>
            {formatValue(achieved, unit)}
          </span>
          <span className="text-sm text-gray-400" style={{ fontWeight: 500 }}>
            / {formatValue(target, unit)}
          </span>
        </div>
      </div>

      {/* Minimal Progress Indicator */}
      <div className="space-y-2">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              status === 'good' ? 'bg-gradient-to-r from-green-400 to-green-500' :
              status === 'warning' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
              'bg-gradient-to-r from-red-400 to-red-500'
            } transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[13px] ${config.textColor}`} style={{ fontWeight: 600 }}>
            {percentage.toFixed(0)}%
          </span>
          {percentage >= 100 ? (
            <span className="text-[13px] text-green-600 flex items-center gap-1" style={{ fontWeight: 500 }}>
              <TrendingUp className="w-3 h-3" />
              Target met
            </span>
          ) : (
            <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>
              {(100 - percentage).toFixed(0)}% to go
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple Metric Widget — no target/achieved, just value + trend
function SimpleMetricWidget({
  label,
  value,
  trend,
  isPositive,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: any;
}) {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center ring-4 ring-brand/10 transition-all duration-300 group-hover:scale-110">
          <Icon className="w-5 h-5 text-brand" />
        </div>
      </div>
      <div className="mb-3">
        <p className="text-sm text-gray-500" style={{ fontWeight: 500 }}>{label}</p>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl text-gray-900 tracking-tight" style={{ fontWeight: 700 }}>{value}</span>
        <span className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`} style={{ fontWeight: 600 }}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend}
        </span>
      </div>
    </div>
  );
}

// Available additional metrics data pool
const ADDITIONAL_METRICS_DATA: Record<string, { value: string; trend: string; isPositive: boolean; icon: any }> = {
  'CPC': { value: '₹18.4', trend: '-₹2.1', isPositive: true, icon: IndianRupee },
  'CPM': { value: '₹142', trend: '+₹8', isPositive: false, icon: IndianRupee },
  'CTR': { value: '3.2%', trend: '+0.4%', isPositive: true, icon: Target },
  'Impressions': { value: '24.8M', trend: '+12%', isPositive: true, icon: Users },
  'Clicks': { value: '792K', trend: '+8.3%', isPositive: true, icon: ArrowUpRight },
  'Conversions': { value: '2,841', trend: '+14%', isPositive: true, icon: CheckCircle },
  'Conv. Rate': { value: '3.58%', trend: '+0.22%', isPositive: true, icon: TrendingUp },
  'CAC': { value: '₹521', trend: '-₹34', isPositive: true, icon: IndianRupee },
  'LTV': { value: '₹8,420', trend: '+₹620', isPositive: true, icon: TrendingUp },
  'Frequency': { value: '2.4x', trend: '+0.3', isPositive: false, icon: Users },
  'Reach': { value: '10.3M', trend: '+18%', isPositive: true, icon: Globe },
  'Bounce Rate': { value: '42.5%', trend: '-3.1%', isPositive: true, icon: TrendingDown },
  'Add to Cart': { value: '12,450', trend: '+9%', isPositive: true, icon: ShoppingCart },
  'Cart Abandonment': { value: '68.2%', trend: '-2.4%', isPositive: true, icon: XCircle },
  'Profit Margin': { value: '24.8%', trend: '+1.6%', isPositive: true, icon: TrendingUp },
  // ── Brand Awareness: Meta Ads Manager native fields (map 1:1 to Marketing API) ──
  'Estimated Ad Recall Lift Rate': { value: '8.4%', trend: '+1.2%', isPositive: true, icon: Sparkles },
  'Estimated Ad Recallers': { value: '142K', trend: '+18K', isPositive: true, icon: Users },
  'Cost per Estimated Ad Recaller': { value: '₹4.80', trend: '-₹0.60', isPositive: true, icon: IndianRupee },
  'ThruPlays': { value: '386K', trend: '+22%', isPositive: true, icon: PlayCircle },
  'Cost per ThruPlay': { value: '₹2.20', trend: '-₹0.30', isPositive: true, icon: IndianRupee },
  'Video Plays at 100%': { value: '58.2%', trend: '+3.4%', isPositive: true, icon: CheckCircle },
  '2-Second Continuous Video Plays': { value: '1.8M', trend: '+24%', isPositive: true, icon: Eye },
  'Video Average Play Time': { value: '12.4s', trend: '+1.8s', isPositive: true, icon: Clock },
  // ── App Installs: Meta Ads Manager native fields for App Promotion campaigns ──
  'App Installs': { value: '48,240', trend: '+28%', isPositive: true, icon: Smartphone },
  'Cost per App Install': { value: '₹82', trend: '-₹12', isPositive: true, icon: IndianRupee },
  'Install Rate': { value: '14.6%', trend: '+2.4%', isPositive: true, icon: Target },
  'Mobile App Purchases': { value: '2,840', trend: '+18%', isPositive: true, icon: ShoppingCart },
  'Cost per Mobile App Purchase': { value: '₹1,420', trend: '-₹180', isPositive: true, icon: IndianRupee },
  'Mobile App Purchase ROAS': { value: '3.8x', trend: '+0.4x', isPositive: true, icon: TrendingUp },
  'App Activations': { value: '42,180', trend: '+26%', isPositive: true, icon: Zap },
  'Complete Registrations (App)': { value: '18,640', trend: '+22%', isPositive: true, icon: UserPlus },
};

// Main Widget Component
function SummaryWidget({ 
  title, 
  icon: Icon,
  iconBg,
  iconColor,
  data,
  onViewDetails,
  showViewDetails = true,
  onCardClick
}: { 
  title: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  data: any;
  onViewDetails: () => void;
  showViewDetails?: boolean;
  onCardClick?: () => void;
}) {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col min-h-[400px] ${onCardClick ? 'cursor-pointer' : ''}`}
      onClick={(e) => {
        if (onCardClick && !(e.target as HTMLElement).closest('button')) {
          onCardClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className="text-base text-gray-900" style={{ fontWeight: 600 }}>{title}</h3>
        </div>
        {showViewDetails && (
          <button
            onClick={onCardClick || onViewDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand hover:bg-brand-light rounded-lg transition-colors"
            style={{ fontWeight: 500 }}
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content - Flexible height */}
      <div className="flex-1 mb-3 flex flex-col">
        {data.content}
      </div>

      {/* Insights Dropdown - Fixed at bottom */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="w-full flex items-center justify-between py-1 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-brand" />
            <span className="text-sm text-brand" style={{ fontWeight: 500 }}>Insights</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
        </button>

        {showInsights && (
          <div className="p-3 bg-brand-light rounded-lg border border-brand/10 space-y-2">
            {data.insights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-[13px] text-gray-700" style={{ fontWeight: 400, lineHeight: 1.5 }}>{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Month-over-Month / Day-over-Day Performance Table
function MoMPerformanceTable({ businessModel }: { businessModel: 'ecommerce' | 'leadgen' }) {
  const [view, setView] = useState<'monthly' | 'daily'>('monthly');

  const monthlyData = businessModel === 'ecommerce' ? [
    { period: 'Apr 2026', isCurrent: true, spends: '₹14.8L', spendsTarget: '₹16.5L', revenue: '₹41.2L', revenueTarget: '₹48L', roas: 2.78, roasTarget: 2.90, purchases: '2,134', costPerPurchase: '₹694', aov: '₹1,932', convRate: '3.42%', impressions: '1.84Cr', cpm: '₹80.5', ctr: '2.84%' },
    { period: 'Mar 2026', isCurrent: false, spends: '₹13.7L', spendsTarget: '₹15L', revenue: '₹37.3L', revenueTarget: '₹42L', roas: 2.72, roasTarget: 2.80, purchases: '1,948', costPerPurchase: '₹702', aov: '₹1,913', convRate: '3.28%', impressions: '1.73Cr', cpm: '₹79.2', ctr: '2.72%' },
    { period: 'Feb 2026', isCurrent: false, spends: '₹12.4L', spendsTarget: '₹14L', revenue: '₹33.1L', revenueTarget: '₹38L', roas: 2.66, roasTarget: 2.70, purchases: '1,786', costPerPurchase: '₹697', aov: '₹1,854', convRate: '3.14%', impressions: '1.56Cr', cpm: '₹79.6', ctr: '2.68%' },
    { period: 'Jan 2026', isCurrent: false, spends: '₹11.2L', spendsTarget: '₹13L', revenue: '₹28.7L', revenueTarget: '₹35L', roas: 2.55, roasTarget: 2.70, purchases: '1,592', costPerPurchase: '₹706', aov: '₹1,801', convRate: '2.96%', impressions: '1.43Cr', cpm: '₹78.5', ctr: '2.58%' },
    { period: 'Dec 2025', isCurrent: false, spends: '₹15.9L', spendsTarget: '₹16L', revenue: '₹46.5L', revenueTarget: '₹45L', roas: 2.93, roasTarget: 2.80, purchases: '2,486', costPerPurchase: '₹638', aov: '₹1,869', convRate: '3.68%', impressions: '2.12Cr', cpm: '₹74.7', ctr: '3.12%' },
    { period: 'Nov 2025', isCurrent: false, spends: '₹17.2L', spendsTarget: '₹16L', revenue: '₹52.8L', revenueTarget: '₹48L', roas: 3.07, roasTarget: 3.00, purchases: '2,812', costPerPurchase: '₹613', aov: '₹1,879', convRate: '3.84%', impressions: '2.37Cr', cpm: '₹72.8', ctr: '3.24%' },
    { period: 'Oct 2025', isCurrent: false, spends: '₹13.4L', spendsTarget: '₹14L', revenue: '₹35.9L', revenueTarget: '₹38L', roas: 2.67, roasTarget: 2.70, purchases: '1,876', costPerPurchase: '₹715', aov: '₹1,911', convRate: '3.08%', impressions: '1.65Cr', cpm: '₹81.4', ctr: '2.62%' },
    { period: 'Sep 2025', isCurrent: false, spends: '₹12.1L', spendsTarget: '₹13L', revenue: '₹31.4L', revenueTarget: '₹35L', roas: 2.59, roasTarget: 2.70, purchases: '1,654', costPerPurchase: '₹731', aov: '₹1,898', convRate: '2.88%', impressions: '1.48Cr', cpm: '₹82.1', ctr: '2.54%' },
    { period: 'Aug 2025', isCurrent: false, spends: '₹11.6L', spendsTarget: '₹13L', revenue: '₹29.8L', revenueTarget: '₹34L', roas: 2.57, roasTarget: 2.60, purchases: '1,542', costPerPurchase: '₹752', aov: '₹1,934', convRate: '2.76%', impressions: '1.38Cr', cpm: '₹84.2', ctr: '2.48%' },
    { period: 'Jul 2025', isCurrent: false, spends: '₹10.8L', spendsTarget: '₹12L', revenue: '₹27.1L', revenueTarget: '₹32L', roas: 2.51, roasTarget: 2.60, purchases: '1,428', costPerPurchase: '₹756', aov: '₹1,897', convRate: '2.68%', impressions: '1.31Cr', cpm: '₹82.6', ctr: '2.42%' },
    { period: 'Jun 2025', isCurrent: false, spends: '₹13.2L', spendsTarget: '₹14L', revenue: '₹36.8L', revenueTarget: '₹40L', roas: 2.79, roasTarget: 2.85, purchases: '1,924', costPerPurchase: '₹686', aov: '₹1,912', convRate: '3.18%', impressions: '1.72Cr', cpm: '₹76.8', ctr: '2.86%' },
    { period: 'May 2025', isCurrent: false, spends: '₹14.5L', spendsTarget: '₹15L', revenue: '₹40.2L', revenueTarget: '₹42L', roas: 2.77, roasTarget: 2.80, purchases: '2,086', costPerPurchase: '₹695', aov: '₹1,927', convRate: '3.36%', impressions: '1.81Cr', cpm: '₹80.1', ctr: '2.92%' },
  ] : [
    // Lead Generation Monthly Data — Metrics: Spends, Leads (total form fills), CPL, MQLs, SQL Rate %, Cost/SQL, Conv. Rate (click→lead), Impressions, CPM, CTR
    { period: 'Apr 2026', isCurrent: true, spends: '₹4.1L', spendsTarget: '₹4.5L', leads: '524', leadsTarget: '600', cpl: 783, cplTarget: 750, ql: '168', cplQ: '₹2,440', convRate: '4.82%', impressions: '62.4L', cpm: '₹65.7', ctr: '2.82%' },
    { period: 'Mar 2026', isCurrent: false, spends: '₹3.8L', spendsTarget: '₹4.2L', leads: '486', leadsTarget: '550', cpl: 782, cplTarget: 764, ql: '152', cplQ: '₹2,500', convRate: '4.58%', impressions: '58.1L', cpm: '₹65.4', ctr: '2.68%' },
    { period: 'Feb 2026', isCurrent: false, spends: '₹3.5L', spendsTarget: '₹4L', leads: '438', leadsTarget: '520', cpl: 799, cplTarget: 769, ql: '134', cplQ: '₹2,612', convRate: '4.34%', impressions: '54.2L', cpm: '₹64.6', ctr: '2.62%' },
    { period: 'Jan 2026', isCurrent: false, spends: '₹3.2L', spendsTarget: '₹3.8L', leads: '392', leadsTarget: '480', cpl: 816, cplTarget: 792, ql: '118', cplQ: '₹2,712', convRate: '4.12%', impressions: '49.8L', cpm: '₹64.3', ctr: '2.54%' },
    { period: 'Dec 2025', isCurrent: false, spends: '₹4.4L', spendsTarget: '₹4.5L', leads: '586', leadsTarget: '580', cpl: 751, cplTarget: 776, ql: '194', cplQ: '₹2,268', convRate: '5.14%', impressions: '68.5L', cpm: '₹64.2', ctr: '3.04%' },
    { period: 'Nov 2025', isCurrent: false, spends: '₹4.8L', spendsTarget: '₹4.5L', leads: '648', leadsTarget: '560', cpl: 741, cplTarget: 804, ql: '220', cplQ: '₹2,182', convRate: '5.38%', impressions: '72.1L', cpm: '₹66.6', ctr: '3.12%' },
    { period: 'Oct 2025', isCurrent: false, spends: '₹3.6L', spendsTarget: '₹4L', leads: '452', leadsTarget: '500', cpl: 796, cplTarget: 800, ql: '142', cplQ: '₹2,535', convRate: '4.42%', impressions: '55.8L', cpm: '₹64.5', ctr: '2.64%' },
    { period: 'Sep 2025', isCurrent: false, spends: '₹3.3L', spendsTarget: '₹3.8L', leads: '406', leadsTarget: '470', cpl: 813, cplTarget: 809, ql: '122', cplQ: '₹2,705', convRate: '4.18%', impressions: '51.4L', cpm: '₹64.2', ctr: '2.56%' },
    { period: 'Aug 2025', isCurrent: false, spends: '₹3.1L', spendsTarget: '₹3.5L', leads: '374', leadsTarget: '440', cpl: 829, cplTarget: 795, ql: '108', cplQ: '₹2,870', convRate: '3.96%', impressions: '48.2L', cpm: '₹64.3', ctr: '2.48%' },
    { period: 'Jul 2025', isCurrent: false, spends: '₹2.9L', spendsTarget: '₹3.5L', leads: '348', leadsTarget: '420', cpl: 833, cplTarget: 833, ql: '98', cplQ: '₹2,959', convRate: '3.82%', impressions: '45.6L', cpm: '₹63.6', ctr: '2.42%' },
    { period: 'Jun 2025', isCurrent: false, spends: '₹3.5L', spendsTarget: '₹3.8L', leads: '462', leadsTarget: '480', cpl: 758, cplTarget: 792, ql: '148', cplQ: '₹2,365', convRate: '4.68%', impressions: '56.4L', cpm: '₹62.1', ctr: '2.78%' },
    { period: 'May 2025', isCurrent: false, spends: '₹3.7L', spendsTarget: '₹4L', leads: '478', leadsTarget: '500', cpl: 774, cplTarget: 800, ql: '154', cplQ: '₹2,403', convRate: '4.72%', impressions: '58.8L', cpm: '₹62.9', ctr: '2.84%' },
  ];

  const dailyData = businessModel === 'ecommerce' ? [
    { period: '15 Apr 2026', isCurrent: true, spends: '₹52.4K', revenue: '₹1.48L', roas: 2.82, purchases: '78', costPerPurchase: '₹672', aov: '₹1,897', convRate: '3.52%', impressions: '6.2L', cpm: '₹84.5', ctr: '2.92%' },
    { period: '14 Apr 2026', isCurrent: false, spends: '₹48.6K', revenue: '₹1.32L', roas: 2.72, purchases: '68', costPerPurchase: '₹715', aov: '₹1,941', convRate: '3.28%', impressions: '5.8L', cpm: '₹83.8', ctr: '2.78%' },
    { period: '13 Apr 2026', isCurrent: false, spends: '₹55.1K', revenue: '₹1.61L', roas: 2.92, purchases: '84', costPerPurchase: '₹656', aov: '₹1,917', convRate: '3.64%', impressions: '6.5L', cpm: '₹84.8', ctr: '2.96%' },
    { period: '12 Apr 2026', isCurrent: false, spends: '₹46.2K', revenue: '₹1.24L', roas: 2.68, purchases: '62', costPerPurchase: '₹745', aov: '₹2,000', convRate: '3.12%', impressions: '5.4L', cpm: '₹85.6', ctr: '2.68%' },
    { period: '11 Apr 2026', isCurrent: false, spends: '₹51.8K', revenue: '₹1.42L', roas: 2.74, purchases: '72', costPerPurchase: '₹719', aov: '₹1,972', convRate: '3.38%', impressions: '6.1L', cpm: '₹84.9', ctr: '2.84%' },
    { period: '10 Apr 2026', isCurrent: false, spends: '₹49.3K', revenue: '₹1.38L', roas: 2.80, purchases: '74', costPerPurchase: '₹666', aov: '₹1,865', convRate: '3.46%', impressions: '5.9L', cpm: '₹83.6', ctr: '2.88%' },
    { period: '09 Apr 2026', isCurrent: false, spends: '₹44.7K', revenue: '₹1.18L', roas: 2.64, purchases: '58', costPerPurchase: '₹771', aov: '₹2,034', convRate: '2.94%', impressions: '5.2L', cpm: '₹86.0', ctr: '2.58%' },
    { period: '08 Apr 2026', isCurrent: false, spends: '₹53.2K', revenue: '₹1.52L', roas: 2.86, purchases: '82', costPerPurchase: '₹649', aov: '₹1,854', convRate: '3.58%', impressions: '6.4L', cpm: '₹83.1', ctr: '2.94%' },
    { period: '07 Apr 2026', isCurrent: false, spends: '₹47.8K', revenue: '₹1.28L', roas: 2.68, purchases: '66', costPerPurchase: '₹724', aov: '₹1,939', convRate: '3.18%', impressions: '5.6L', cpm: '₹85.4', ctr: '2.72%' },
    { period: '06 Apr 2026', isCurrent: false, spends: '₹50.5K', revenue: '₹1.44L', roas: 2.85, purchases: '76', costPerPurchase: '₹664', aov: '₹1,895', convRate: '3.48%', impressions: '6.0L', cpm: '₹84.2', ctr: '2.90%' },
    { period: '05 Apr 2026', isCurrent: false, spends: '₹42.1K', revenue: '₹1.08L', roas: 2.56, purchases: '54', costPerPurchase: '₹780', aov: '₹2,000', convRate: '2.82%', impressions: '4.9L', cpm: '₹85.9', ctr: '2.52%' },
    { period: '04 Apr 2026', isCurrent: false, spends: '₹45.6K', revenue: '₹1.22L', roas: 2.68, purchases: '64', costPerPurchase: '₹713', aov: '₹1,906', convRate: '3.14%', impressions: '5.3L', cpm: '₹86.0', ctr: '2.66%' },
    { period: '03 Apr 2026', isCurrent: false, spends: '₹54.8K', revenue: '₹1.56L', roas: 2.85, purchases: '80', costPerPurchase: '₹685', aov: '₹1,950', convRate: '3.54%', impressions: '6.3L', cpm: '₹87.0', ctr: '2.86%' },
    { period: '02 Apr 2026', isCurrent: false, spends: '₹48.2K', revenue: '₹1.34L', roas: 2.78, purchases: '70', costPerPurchase: '₹689', aov: '₹1,914', convRate: '3.32%', impressions: '5.7L', cpm: '₹84.6', ctr: '2.76%' },
    { period: '01 Apr 2026', isCurrent: false, spends: '₹46.9K', revenue: '₹1.26L', roas: 2.68, purchases: '66', costPerPurchase: '₹711', aov: '₹1,909', convRate: '3.22%', impressions: '5.5L', cpm: '₹85.3', ctr: '2.70%' },
  ] : [
    // Lead Generation Daily Data
    { period: '15 Apr 2026', isCurrent: true, spends: '₹14.2K', leads: '19', cpl: '₹747', ql: '6', cplQ: '₹2,367', convRate: '5.04%', impressions: '2.1L', cpm: '₹67.6', ctr: '2.86%' },
    { period: '14 Apr 2026', isCurrent: false, spends: '₹13.8K', leads: '17', cpl: '₹812', ql: '5', cplQ: '₹2,760', convRate: '4.62%', impressions: '2.0L', cpm: '₹69.0', ctr: '2.72%' },
    { period: '13 Apr 2026', isCurrent: false, spends: '₹15.1K', leads: '21', cpl: '₹719', ql: '7', cplQ: '₹2,157', convRate: '5.28%', impressions: '2.2L', cpm: '₹68.6', ctr: '2.94%' },
    { period: '12 Apr 2026', isCurrent: false, spends: '₹12.6K', leads: '15', cpl: '₹840', ql: '4', cplQ: '₹3,150', convRate: '4.18%', impressions: '1.9L', cpm: '₹66.3', ctr: '2.64%' },
    { period: '11 Apr 2026', isCurrent: false, spends: '₹14.5K', leads: '18', cpl: '₹806', ql: '6', cplQ: '₹2,417', convRate: '4.86%', impressions: '2.1L', cpm: '₹69.0', ctr: '2.78%' },
    { period: '10 Apr 2026', isCurrent: false, spends: '₹13.2K', leads: '18', cpl: '₹733', ql: '6', cplQ: '₹2,200', convRate: '5.12%', impressions: '2.0L', cpm: '₹66.0', ctr: '2.82%' },
    { period: '09 Apr 2026', isCurrent: false, spends: '₹11.8K', leads: '14', cpl: '₹843', ql: '4', cplQ: '₹2,950', convRate: '3.94%', impressions: '1.8L', cpm: '₹65.6', ctr: '2.52%' },
    { period: '08 Apr 2026', isCurrent: false, spends: '₹15.4K', leads: '20', cpl: '₹770', ql: '7', cplQ: '₹2,200', convRate: '5.18%', impressions: '2.3L', cpm: '₹67.0', ctr: '2.92%' },
    { period: '07 Apr 2026', isCurrent: false, spends: '₹12.8K', leads: '16', cpl: '₹800', ql: '5', cplQ: '₹2,560', convRate: '4.48%', impressions: '1.9L', cpm: '₹67.4', ctr: '2.68%' },
    { period: '06 Apr 2026', isCurrent: false, spends: '₹14.8K', leads: '19', cpl: '₹779', ql: '6', cplQ: '₹2,467', convRate: '4.94%', impressions: '2.2L', cpm: '₹67.3', ctr: '2.84%' },
    { period: '05 Apr 2026', isCurrent: false, spends: '₹11.2K', leads: '13', cpl: '₹862', ql: '3', cplQ: '₹3,733', convRate: '3.72%', impressions: '1.7L', cpm: '₹65.9', ctr: '2.46%' },
    { period: '04 Apr 2026', isCurrent: false, spends: '₹13.4K', leads: '16', cpl: '₹838', ql: '5', cplQ: '₹2,680', convRate: '4.42%', impressions: '2.0L', cpm: '₹67.0', ctr: '2.62%' },
    { period: '03 Apr 2026', isCurrent: false, spends: '₹14.6K', leads: '20', cpl: '₹730', ql: '7', cplQ: '₹2,086', convRate: '5.22%', impressions: '2.2L', cpm: '₹66.4', ctr: '2.88%' },
    { period: '02 Apr 2026', isCurrent: false, spends: '₹13.6K', leads: '17', cpl: '₹800', ql: '5', cplQ: '₹2,720', convRate: '4.64%', impressions: '2.0L', cpm: '₹68.0', ctr: '2.74%' },
    { period: '01 Apr 2026', isCurrent: false, spends: '₹12.4K', leads: '15', cpl: '₹827', ql: '5', cplQ: '₹2,480', convRate: '4.28%', impressions: '1.9L', cpm: '₹65.3', ctr: '2.58%' },
  ];

  const data = view === 'monthly' ? monthlyData : dailyData;

  const columns = businessModel === 'ecommerce'
    ? [
        { key: 'spends', label: 'SPENDS', highlight: true },
        { key: 'revenue', label: 'REVENUE', highlight: true },
        { key: 'roas', label: 'ROAS', highlight: true },
        { key: 'purchases', label: 'PURCHASES' },
        { key: 'costPerPurchase', label: 'COST/PURCHASE' },
        { key: 'aov', label: 'AOV' },
        { key: 'convRate', label: 'CONV. RATE' },
        { key: 'impressions', label: 'IMPRESSIONS' },
        { key: 'cpm', label: 'CPM' },
        { key: 'ctr', label: 'CTR' },
      ]
    : [
        { key: 'spends', label: 'SPENDS', highlight: true },
        { key: 'leads', label: 'LEADS', highlight: true },
        { key: 'cpl', label: 'CPL', highlight: true },
        { key: 'ql', label: 'QL' },
        { key: 'cplQ', label: 'CPL-Q' },
        { key: 'convRate', label: 'CONV. RATE' },
        { key: 'impressions', label: 'IMPRESSIONS' },
        { key: 'cpm', label: 'CPM' },
        { key: 'ctr', label: 'CTR' },
      ];

  const getRoasColor = (roas: number) => {
    if (roas >= 3.0) return 'text-green-700';
    if (roas >= 2.5) return 'text-blue-700';
    if (roas >= 2.0) return 'text-amber-700';
    return 'text-red-700';
  };

  // CPL color — lower is better
  const getCplColor = (cpl: number) => {
    if (cpl <= 750) return 'text-green-700';
    if (cpl <= 800) return 'text-blue-700';
    if (cpl <= 850) return 'text-amber-700';
    return 'text-red-700';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-base text-gray-900 font-semibold">
              {view === 'monthly' ? 'Month-over-Month Performance' : 'Day-over-Day Performance'}
            </h3>
            <p className="text-sm text-gray-500 font-normal">
              Overall {view} performance across all campaigns
            </p>
          </div>
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1" role="tablist" aria-label="Performance view">
          <button
            role="tab"
            aria-selected={view === 'monthly'}
            onClick={() => setView('monthly')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            role="tab"
            aria-selected={view === 'daily'}
            onClick={() => setView('daily')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }} aria-label={view === 'monthly' ? 'Month-over-Month Performance' : 'Day-over-Day Performance'}>
          <thead>
            <tr className="bg-gray-50/80">
              <th
                scope="col"
                className="text-left px-6 py-3.5 text-xs text-gray-500 uppercase tracking-widest font-semibold sticky left-0 bg-gray-50/80 z-10 border-b border-gray-200/60"
                style={{ minWidth: '170px', boxShadow: '4px 0 8px -2px rgba(0,0,0,0.04)' }}
              >
                {view === 'monthly' ? 'MONTH' : 'DATE'}
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`text-right px-5 py-3.5 text-xs uppercase tracking-widest font-semibold border-b border-gray-200/60 ${
                    col.highlight ? 'text-brand' : 'text-gray-500'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const isLast = idx === data.length - 1;
              return (
                <tr
                  key={idx}
                  className={`transition-colors duration-150 ${
                    row.isCurrent
                      ? 'bg-brand/[0.03] hover:bg-brand/[0.06]'
                      : idx % 2 === 1
                        ? 'bg-gray-50/40 hover:bg-gray-50/80'
                        : 'bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <td
                    className={`px-6 py-3.5 whitespace-nowrap sticky left-0 z-10 ${
                      !isLast ? 'border-b border-gray-100/80' : ''
                    } ${
                      row.isCurrent
                        ? 'bg-brand/[0.03]'
                        : idx % 2 === 1
                          ? 'bg-gray-50/40'
                          : 'bg-white'
                    }`}
                    style={{ minWidth: '170px', boxShadow: '4px 0 8px -2px rgba(0,0,0,0.04)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-800 font-medium">{row.period}</span>
                      {row.isCurrent && (
                        <span className="px-1.5 py-0.5 bg-brand/10 text-brand text-[11px] rounded-md uppercase tracking-wide font-bold">
                          Live
                        </span>
                      )}
                    </div>
                  </td>
                  {columns.map((col) => {
                    const val = (row as any)[col.key];
                    const isRoas = col.key === 'roas';
                    const isCpl = col.key === 'cpl';
                    const isHighlightNumeric = isRoas || isCpl;
                    const colorClass = isRoas ? getRoasColor(val) : isCpl ? getCplColor(val) : 'text-gray-600';
                    return (
                      <td
                        key={col.key}
                        className={`text-right px-5 py-3.5 whitespace-nowrap text-sm ${isHighlightNumeric ? 'font-semibold' : 'font-normal'} ${colorClass} ${
                          !isLast ? 'border-b border-gray-100/80' : ''
                        }`}
                      >
                        {isRoas ? `${val.toFixed(2)}x` : isCpl ? `₹${val}` : val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Key Takeaways */}
      {view === 'monthly' && (() => {
        const takeaways = businessModel === 'ecommerce'
          ? [
              { title: 'ROAS trending upward', description: 'Improved from 2.51x (Jul) to 2.78x (Apr), a +10.8% gain over 9 months. Nov peaked at 3.07x during festive season — replicating that creative mix could accelerate Q2.' },
              { title: 'Cost/Purchase rising', description: 'Crept from ₹613 (Nov) to ₹694 (Apr), a 13.2% increase. Scaling spend without matching conversion gains is eroding margins. Audit underperforming ad sets above ₹720 CPP.' },
              { title: 'CPM efficiency unlocked', description: 'Impressions grew from 1.31Cr (Jul) to 1.84Cr (Apr) while CPM only moved from ₹82.6 to ₹80.5. Expanding reach without inflating cost signals strong audience-channel fit.' },
            ]
          : [
              { title: 'Lead volume up 50%', description: 'Leads grew from 348 (Jul) to 524 (Apr), a +50.6% increase. Nov spiked to 648 leads with the lowest CPL (₹741) — replicating that campaign structure in Q2 could push past the 600 target.' },
              { title: 'CPL-Q above ₹2,400', description: 'Qualified CPL sits at ₹2,440 (Apr) vs. ₹2,182 in Nov when QL conversion hit 34%. Tightening lead scoring criteria and adding mid-funnel nurture flows could reduce CPL-Q by 12–15%.' },
              { title: 'Qualification rate plateauing at 32%', description: 'QL/Lead ratio has hovered between 30–34% since Oct. Leads are coming in but not converting to qualified. A/B testing landing page forms and adding intent-based questions could lift QL rate to 38%+.' },
            ];

        return (
          <div className="mx-6 mb-5 mt-4 px-5 py-4 bg-amber-50/60 border border-amber-200/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-gray-900 font-semibold">Key Takeaways</span>
            </div>
            <div className="space-y-2.5">
              {takeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-[7px] flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed font-normal">
                    <span className="font-semibold text-gray-900">{t.title}</span>
                    {' — '}{t.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export function OverviewModule({ businessModel, selectedChannel, onNavigateToWebsite, additionalMetrics = [] }: OverviewModuleProps) {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);


  // Auto-derive status: green at 90%+, amber at 60-89%, red below 60%
  // Cost metrics (lower is better): green if at or under target
  const costLabels = ['Ad Spend', 'CPL', 'CAC', 'CPC', 'CPM', 'CPA', 'Cost Per Conv.'];
  const deriveStatus = (achieved: number, target: number, label: string): 'good' | 'warning' | 'bad' => {
    if (costLabels.includes(label)) return achieved <= target ? 'good' : 'warning';
    const pct = target > 0 ? (achieved / target) * 100 : 0;
    return pct >= 90 ? 'good' : pct >= 60 ? 'warning' : 'bad';
  };

  // E-commerce KPIs (values in raw rupees for monetary fields)
  const ecommerceKPIsRaw = [
    { label: 'Ad Spend', achieved: 1480000, target: 1650000, unit: '₹', icon: IndianRupee, trend: '+12%' },
    { label: 'Revenue', achieved: 2850000, target: 3200000, unit: '₹', icon: TrendingUp, trend: '-6%' },
    { label: 'ROAS', achieved: 1.93, target: 2.20, unit: 'x', icon: Target, trend: '-0.14' },
    { label: 'Orders', achieved: 842, target: 1000, unit: '', icon: ShoppingCart, trend: '+9%' },
    { label: 'AOV', achieved: 3385, target: 3200, unit: '₹', icon: Users, trend: '-₹180' },
  ];

  // Lead Gen KPIs - Mathematically consistent: Spend / Leads = CPL
  // ₹4,10,000 / 524 = ₹783 CPL | Target: ₹4,50,000 / 600 = ₹750 CPL
  // Qualified Leads: 524 leads × 32% QL rate = 168 QL | Target: 200
  const leadgenKPIsRaw = [
    { label: 'Ad Spend', achieved: 410000, target: 450000, unit: '₹', icon: IndianRupee, trend: '+8%' },
    { label: 'Total Leads', achieved: 524, target: 600, unit: '', icon: Users, trend: '+14%' },
    { label: 'Qualified Leads', achieved: 168, target: 200, unit: '', icon: CheckCircle, trend: '+22%' },
    { label: 'CPL', achieved: 783, target: 750, unit: '₹', icon: IndianRupee, trend: '-₹31' },
    { label: 'CTR', achieved: 2.8, target: 3.2, unit: '%', icon: TrendingUp, trend: '+0.3%' },
  ];

  const kpisRaw = businessModel === 'ecommerce' ? ecommerceKPIsRaw : leadgenKPIsRaw;
  const kpis = kpisRaw.map(k => ({ ...k, status: deriveStatus(k.achieved, k.target, k.label) }));

  // Campaign data by period - E-COMMERCE
  const ecommerceCampaignsByPeriod = {
    '7days': [
      { name: 'Meta - Product Catalog Sales', spend: '₹2.4L', revenue: '₹6.8L', roas: '2.83x' },
      { name: 'Google - Shopping (High Intent)', spend: '₹3.1L', revenue: '₹7.2L', roas: '2.32x' },
      { name: 'Meta - Dynamic Retargeting', spend: '₹1.8L', revenue: '₹4.1L', roas: '2.28x' },
    ],
    '30days': [
      { name: 'Google - Search Brand Keywords', spend: '₹8.2L', revenue: '₹21.5L', roas: '2.62x' },
      { name: 'Meta - Lookalike Audiences', spend: '₹6.5L', revenue: '₹16.8L', roas: '2.58x' },
      { name: 'Google - Performance Max', spend: '₹9.1L', revenue: '₹22.4L', roas: '2.46x' },
    ],
    '90days': [
      { name: 'Meta - Catalog + Dynamic Ads', spend: '₹22.4L', revenue: '₹62.3L', roas: '2.78x' },
      { name: 'Google - Shopping Ecosystem', spend: '₹28.5L', revenue: '₹71.2L', roas: '2.50x' },
      { name: 'YouTube - Video Action Campaigns', spend: '₹12.8L', revenue: '₹29.1L', roas: '2.27x' },
    ],
    'alltime': [
      { name: 'Meta - Evergreen Catalog Sales', spend: '₹45.2L', revenue: '₹128.5L', roas: '2.84x' },
      { name: 'Google - Shopping All Products', spend: '₹52.8L', revenue: '₹142.3L', roas: '2.69x' },
      { name: 'Meta - Retargeting Suite', spend: '₹38.6L', revenue: '₹98.7L', roas: '2.56x' },
    ]
  };

  // Campaign data by period - LEAD GENERATION
  const leadgenCampaignsByPeriod = {
    '7days': [
      { name: 'LinkedIn - B2B Decision Makers', spend: '₹1.8L', leads: '42', cpl: '₹4,286' },
      { name: 'Meta - Lead Gen Forms', spend: '₹1.2L', leads: '156', cpl: '₹769' },
      { name: 'Google - Search Intent Keywords', spend: '₹2.1L', leads: '89', cpl: '₹2,360' },
    ],
    '30days': [
      { name: 'LinkedIn - Industry Targeting', spend: '₹6.8L', leads: '168', cpl: '₹4,048' },
      { name: 'Meta - Lead Magnets Campaign', spend: '₹4.5L', leads: '624', cpl: '₹721' },
      { name: 'Google - High Intent Search', spend: '₹8.2L', leads: '342', cpl: '₹2,398' },
    ],
    '90days': [
      { name: 'LinkedIn - ABM Campaigns', spend: '₹18.4L', leads: '456', cpl: '4,035' },
      { name: 'Meta - Video Lead Generation', spend: '₹12.8L', leads: '1,842', cpl: '₹695' },
      { name: 'Google - Conversion Campaigns', spend: '₹22.5L', leads: '956', cpl: '₹2,353' },
    ],
    'alltime': [
      { name: 'LinkedIn - Executive Targeting', spend: '₹42.2L', leads: '1,124', cpl: '₹3,754' },
      { name: 'Meta - Lead Gen Suite', spend: '₹38.6L', leads: '5,428', cpl: '₹711' },
      { name: 'Google - Search + Display', spend: '₹52.8L', leads: '2,245', cpl: '₹2,352' },
    ]
  };

  const campaignsByPeriod = businessModel === 'ecommerce' ? ecommerceCampaignsByPeriod : leadgenCampaignsByPeriod;

  // Helper to render a platform campaign widget — business-model aware
  const formatKPIValue = (val: number, unit: string) => {
    if (unit === '₹') {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    if (unit === 'x') return `${val.toFixed(2)}x`;
    if (unit === '%') return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}%`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  const buildPlatformCampaignData = (
    platform: 'meta' | 'google',
    stats: { label: string; achieved: number; target: number; unit: string }[],
    campaigns: { name: string; spend: string; revenue?: string; roas?: string; leads?: string; cpl?: string }[],
    insights: React.ReactNode[]
  ) => ({
    content: (
      <div className="space-y-3">
        {/* Campaign KPIs — Target vs Achieved */}
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
          {stats.map((stat, i) => {
            const pct = Math.min((stat.achieved / stat.target) * 100, 100);
            const isOnTrack = pct >= 90;
            // For cost metrics, being under target is good
            const isCostMetric = ['Ad Spend', 'CPL', 'CPC', 'CPM', 'CPA'].includes(stat.label);
            const isGood = isCostMetric ? stat.achieved <= stat.target : stat.achieved >= stat.target * 0.9;
            return (
              <div key={i} className="p-3 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 mb-1.5" style={{ fontSize: '12px', fontWeight: 500 }}>{stat.label}</p>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-gray-900" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {formatKPIValue(stat.achieved, stat.unit)}
                  </span>
                  <span className="text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
                    / {formatKPIValue(stat.target, stat.unit)}
                  </span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isGood ? 'bg-green-400' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%`, transition: 'width 0.5s ease-out' }}
                  />
                </div>
                <p className={`mt-1.5 ${isGood ? 'text-green-600' : 'text-amber-600'}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                  {pct.toFixed(0)}% of target
                </p>
              </div>
            );
          })}
        </div>

        {/* Top Performing Campaigns */}
        <div className="space-y-1.5">
          <p className="text-sm text-gray-900 mb-2" style={{ fontWeight: 600 }}>Top Performing Campaigns</p>
          {campaigns.map((campaign, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{campaign.name}</p>
                  <p className="text-[13px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
                    {businessModel === 'ecommerce'
                      ? `Spend: ${campaign.spend} • Revenue: ${campaign.revenue}`
                      : `Spend: ${campaign.spend} • Leads: ${campaign.leads}`
                    }
                  </p>
                </div>
              </div>
              <span className={`text-sm ml-3 flex-shrink-0 ${businessModel === 'ecommerce' ? 'text-green-600' : 'text-blue-600'}`} style={{ fontWeight: 700 }}>
                {businessModel === 'ecommerce' ? campaign.roas : campaign.cpl}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    insights,
  });

  // Meta Campaign Overview data — adapts to business model
  const metaCampaignData = businessModel === 'ecommerce'
    ? buildPlatformCampaignData(
        'meta',
        [
          { label: 'Ad Spend', achieved: 820000, target: 900000, unit: '₹' },
          { label: 'Revenue', achieved: 2160000, target: 2500000, unit: '₹' },
          { label: 'ROAS', achieved: 2.64, target: 2.80, unit: 'x' },
        ],
        [
          { name: 'Product Catalog Sales', spend: '₹2.4L', revenue: '₹6.8L', roas: '2.83x' },
          { name: 'Dynamic Retargeting', spend: '₹1.8L', revenue: '₹4.1L', roas: '2.28x' },
          { name: 'Lookalike Audiences', spend: '₹1.5L', revenue: '₹3.6L', roas: '2.40x' },
        ],
        [
          <span key="1"><span style={{ fontWeight: 600 }}>Product Catalog campaigns</span> outperforming by 28% with dynamic product ads driving strong ROAS.</span>,
          <span key="2"><span style={{ fontWeight: 600 }}>Dynamic Retargeting</span> delivering consistent 2.28x ROAS. Consider scaling budget by 20%.</span>,
          <span key="3"><span style={{ fontWeight: 600 }}>Weekend performance</span> up 15%. Test increasing weekend budgets by 20-30%.</span>,
        ]
      )
    : buildPlatformCampaignData(
        'meta',
        [
          { label: 'Ad Spend', achieved: 240000, target: 280000, unit: '₹' },
          { label: 'Leads', achieved: 312, target: 350, unit: '' },
          { label: 'CPL', achieved: 769, target: 750, unit: '₹' },
        ],
        [
          { name: 'Lead Gen Forms - Service', spend: '₹1.2L', leads: '156', cpl: '₹769' },
          { name: 'Video Lead - Testimonials', spend: '₹68K', leads: '89', cpl: '₹764' },
          { name: 'Carousel - Case Studies', spend: '₹52K', leads: '67', cpl: '₹776' },
        ],
        [
          <span key="1"><span style={{ fontWeight: 600 }}>Native Lead Forms</span> converting at 22% — significantly outperforming landing page redirects (14%).</span>,
          <span key="2"><span style={{ fontWeight: 600 }}>Testimonial videos</span> generating highest MQL rate at 38%. Scale budget by 25%.</span>,
          <span key="3"><span style={{ fontWeight: 600 }}>Weekend leads</span> show 12% higher SQL rate — test increased weekend delivery.</span>,
        ]
      );

  // Google Campaign Overview data — adapts to business model
  const googleCampaignData = businessModel === 'ecommerce'
    ? buildPlatformCampaignData(
        'google',
        [
          { label: 'Ad Spend', achieved: 1050000, target: 1150000, unit: '₹' },
          { label: 'Revenue', achieved: 2540000, target: 2800000, unit: '₹' },
          { label: 'ROAS', achieved: 2.42, target: 2.50, unit: 'x' },
        ],
        [
          { name: 'Shopping (High Intent)', spend: '₹3.1L', revenue: '₹7.2L', roas: '2.32x' },
          { name: 'Search - Brand Keywords', spend: '₹2.2L', revenue: '₹5.8L', roas: '2.64x' },
          { name: 'Performance Max', spend: '₹2.8L', revenue: '₹6.1L', roas: '2.18x' },
        ],
        [
          <span key="1"><span style={{ fontWeight: 600 }}>Shopping campaigns</span> driving highest volume at ₹3.1L spend with solid 2.32x ROAS.</span>,
          <span key="2"><span style={{ fontWeight: 600 }}>Brand Keywords</span> delivering best ROAS at 2.64x. Protect brand terms against competitor bidding.</span>,
          <span key="3"><span style={{ fontWeight: 600 }}>Performance Max</span> ROAS dipped 0.04 — review asset groups and audience signals for optimization.</span>,
        ]
      )
    : buildPlatformCampaignData(
        'google',
        [
          { label: 'Ad Spend', achieved: 170000, target: 200000, unit: '₹' },
          { label: 'Leads', achieved: 212, target: 250, unit: '' },
          { label: 'CPL', achieved: 802, target: 780, unit: '₹' },
        ],
        [
          { name: 'Search - High Intent Keywords', spend: '₹92K', leads: '89', cpl: '₹1,034' },
          { name: 'Search - Brand + Service', spend: '₹48K', leads: '78', cpl: '₹615' },
          { name: 'Display - Remarketing', spend: '₹32K', leads: '45', cpl: '₹711' },
        ],
        [
          <span key="1"><span style={{ fontWeight: 600 }}>Brand + Service keywords</span> delivering lowest CPL at ₹615. Expand match types to capture more volume.</span>,
          <span key="2"><span style={{ fontWeight: 600 }}>Display Remarketing</span> converting site visitors to leads at ₹711 CPL — 14% below target.</span>,
          <span key="3"><span style={{ fontWeight: 600 }}>High Intent Search</span> CPL above target — review keyword quality scores and landing page relevance.</span>,
        ]
      );

  // Website Audit Data
  const websiteData = {
    content: (
      <div className="space-y-3">
        {/* GA4 + PageSpeed hero metrics */}
        <div className="grid grid-cols-2 gap-3">
          {businessModel === 'ecommerce' ? (
            <>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-[13px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full" style={{ fontWeight: 500 }}>GA4</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Sessions</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>68.5K</p>
                <p className="text-[13px] text-green-600 mt-0.5" style={{ fontWeight: 500 }}>+8.2% vs last month</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-[13px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full" style={{ fontWeight: 500 }}>PSI</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">PageSpeed</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <PerformanceScoreGauge score={72} size={48} strokeWidth={4} />
                    <p className="text-[13px] text-gray-500 mt-1" style={{ fontWeight: 500 }}>Mobile</p>
                  </div>
                  <div className="text-center">
                    <PerformanceScoreGauge score={91} size={48} strokeWidth={4} />
                    <p className="text-[13px] text-gray-500 mt-1" style={{ fontWeight: 500 }}>Desktop</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-[13px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full" style={{ fontWeight: 500 }}>GA4</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Sessions</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>24.8K</p>
                <p className="text-[13px] text-green-600 mt-0.5" style={{ fontWeight: 500 }}>+12.4% vs last month</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-[13px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full" style={{ fontWeight: 500 }}>PSI</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">PageSpeed</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <PerformanceScoreGauge score={72} size={48} strokeWidth={4} />
                    <p className="text-[13px] text-gray-500 mt-1" style={{ fontWeight: 500 }}>Mobile</p>
                  </div>
                  <div className="text-center">
                    <PerformanceScoreGauge score={91} size={48} strokeWidth={4} />
                    <p className="text-[13px] text-gray-500 mt-1" style={{ fontWeight: 500 }}>Desktop</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Key Metrics - Structured with status & trends */}
        <div className="space-y-1">
          {(businessModel === 'ecommerce' ? [
            { label: 'Bounce Rate', value: '42.5%', trend: '-3.1%', isPositive: true, source: 'GA4', status: 'good' as const },
            { label: 'Avg. Session', value: '4m 32s', trend: '+12%', isPositive: true, source: 'GA4', status: 'good' as const },
            { label: 'Page Load Speed (Mobile)', value: '3.1s', trend: '-0.4s', isPositive: true, source: 'PSI', status: 'warning' as const },
            { label: 'Conversion Rate', value: '2.8%', trend: '+0.3%', isPositive: true, source: 'GA4', status: 'good' as const },
          ] : [
            { label: 'Bounce Rate', value: '38.2%', trend: '-2.4%', isPositive: true, source: 'GA4', status: 'good' as const },
            { label: 'Avg. Session', value: '2m 48s', trend: '+8%', isPositive: true, source: 'GA4', status: 'good' as const },
            { label: 'Page Load Speed (Mobile)', value: '3.1s', trend: '-0.4s', isPositive: true, source: 'PSI', status: 'warning' as const },
            { label: 'Form Conversion', value: '18.5%', trend: '+1.2%', isPositive: true, source: 'GA4', status: 'good' as const },
          ]).map((metric, idx, arr) => (
            <div key={idx} className={`flex items-center justify-between py-2.5 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${metric.status === 'good' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${metric.status === 'warning' ? 'text-amber-600' : 'text-gray-900'}`} style={{ fontWeight: 600 }}>{metric.value}</span>
                <span className={`flex items-center gap-0.5 text-[13px] ${metric.isPositive ? 'text-green-600' : 'text-red-500'}`} style={{ fontWeight: 500 }}>
                  {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    insights: businessModel === 'ecommerce' ? [
      <span key="1">Mobile PageSpeed is <span style={{ fontWeight: 600 }}>72 vs Desktop 91</span> — 19-point gap. Optimizing images and deferring JS could recover 1.8s on mobile.</span>,
      <span key="2"><span style={{ fontWeight: 600 }}>Bounce rate dropped 3.1%</span> after recent page speed improvements. Continue monitoring Core Web Vitals.</span>,
      <span key="3">Top pages <span style={{ fontWeight: 600 }}>drive 64% of conversions</span>. Consider replicating their structure across other product pages.</span>
    ] : [
      <span key="1">Mobile PageSpeed is <span style={{ fontWeight: 600 }}>72 vs Desktop 91</span> — optimizing for mobile could improve form conversion rates.</span>,
      <span key="2"><span style={{ fontWeight: 600 }}>Form conversion at 18.5%</span> exceeds industry average (12-15%). Multi-step form working well.</span>,
      <span key="3"><span style={{ fontWeight: 600 }}>Bounce rate at 38.2%</span> is healthy. Blog content drives longest sessions at 4m 42s avg.</span>
    ]
  };

  // Creatives Data
  const creativesData = {
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {businessModel === 'ecommerce' ? (
            <>
              <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Active Ads</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>156</p>
                <p className="text-[13px] text-brand mt-0.5" style={{ fontWeight: 500 }}>+12 new</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Avg. CTR</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>3.2%</p>
                <p className="text-[13px] text-green-600 mt-0.5" style={{ fontWeight: 500 }}>+0.4%</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Active Ads</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>124</p>
                <p className="text-[13px] text-brand mt-0.5" style={{ fontWeight: 500 }}>+8 new</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Avg. CTR</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>2.8%</p>
                <p className="text-[13px] text-green-600 mt-0.5" style={{ fontWeight: 500 }}>+0.6%</p>
              </div>
            </>
          )}
        </div>

        {/* Top Performing Creatives */}
        <div className="space-y-1.5">
          <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Top Performing Creatives</p>
          {businessModel === 'ecommerce' ? (
            <>
              {[
                { name: 'Video - Product Demo (15s)', impressions: '2.4M', ctr: '4.8%', conversions: '892', platform: 'Meta', campaign: 'Summer Sale 2024', adSet: 'Retargeting - Engaged Users' },
                { name: 'PMax - Top Sellers Feed', impressions: '3.1M', ctr: '3.6%', conversions: '748', platform: 'Google', campaign: 'Performance Max', adSet: 'Asset Group - Best Sellers' },
                { name: 'Carousel - Collection Showcase', impressions: '1.8M', ctr: '3.9%', conversions: '654', platform: 'Meta', campaign: 'Product Launch Q2', adSet: 'Prospecting - Lookalike' },
              ].map((creative, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{creative.name}</p>
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[13px] cursor-help whitespace-nowrap flex-shrink-0 ${creative.platform === 'Meta' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                          style={{ fontWeight: 500 }}
                          title={`Campaign: ${creative.campaign} • Ad Set: ${creative.adSet}`}
                        >
                          {creative.platform}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{creative.impressions} impressions • {creative.conversions} conversions</p>
                    </div>
                  </div>
                  <span className="text-sm text-brand ml-3 flex-shrink-0" style={{ fontWeight: 700 }}>{creative.ctr}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { name: 'Lead Form - Case Study Download', impressions: '1.8M', ctr: '3.2%', leads: '124', campaign: 'Lead Magnet Q1', adSet: 'Lookalike - Converted Leads' },
                { name: 'Video - Founder Testimonial (30s)', impressions: '1.2M', ctr: '4.1%', leads: '98', campaign: 'Brand Trust Campaign', adSet: 'Cold Audience - LinkedIn' },
                { name: 'Carousel - Service Showcase', impressions: '2.1M', ctr: '2.4%', leads: '86', campaign: 'Service Awareness', adSet: 'Interest Targeting - B2B' },
              ].map((creative, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{creative.name}</p>
                        <span 
                          className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100 text-[13px] cursor-help whitespace-nowrap flex-shrink-0 max-w-[120px] truncate"
                          style={{ fontWeight: 500 }}
                          title={`Campaign: ${creative.campaign} • Ad Set: ${creative.adSet}`}
                        >
                          {creative.campaign}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{creative.impressions} impressions • {creative.leads} leads</p>
                    </div>
                  </div>
                  <span className="text-sm text-brand ml-3 flex-shrink-0" style={{ fontWeight: 700 }}>{creative.ctr}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    ),
    insights: businessModel === 'ecommerce' ? [
      <span key="1"><span style={{ fontWeight: 600 }}>Video ads driving 2.4x higher CTR</span> than static images. Allocate 40% budget to video formats.</span>,
      <span key="2">User-generated content (UGC) style creatives show <span style={{ fontWeight: 600 }}>32% better engagement</span> than studio shots.</span>,
      <span key="3"><span style={{ fontWeight: 600 }}>Refresh creative fatigue</span> - 18 ads showing declining CTR after 14+ days. Schedule new variants.</span>
    ] : [
      <span key="1"><span style={{ fontWeight: 600 }}>Lead Form ads converting at 22%</span> - significantly higher than landing page redirects (18.5%). Prioritize native forms.</span>,
      <span key="2">Video testimonials with <span style={{ fontWeight: 600 }}>founder credibility drive 28% better lead quality</span> compared to generic service videos.</span>,
      <span key="3"><span style={{ fontWeight: 600 }}>Case study downloads generating highest MQL rate</span> at 58%. Create more industry-specific case studies.</span>
    ]
  };

  // Funnel Data — Recharts horizontal bar with subtle shadcn-style colors
  const funnelChartColors = [
    'hsl(221, 83%, 53%)',
    'hsl(231, 48%, 58%)',
    'hsl(262, 40%, 58%)',
    'hsl(280, 35%, 55%)',
    'hsl(330, 35%, 55%)',
    'hsl(160, 45%, 48%)',
  ];

  const ecommerceFunnelStages = [
    { stage: 'Impressions', value: 2400000, display: '2.4M', dropOff: null as string | null },
    { stage: 'Page Visits', value: 72800, display: '72.8K', dropOff: '97.0%' },
    { stage: 'Product Views', value: 45200, display: '45.2K', dropOff: '37.9%' },
    { stage: 'Add to Cart', value: 12800, display: '12.8K', dropOff: '71.7%' },
    { stage: 'Checkout', value: 6400, display: '6.4K', dropOff: '50.0%' },
    { stage: 'Orders', value: 2100, display: '2.1K', dropOff: '67.2%' },
  ];

  const leadgenFunnelStages = [
    { stage: 'Impressions', value: 1800000, display: '1.8M', dropOff: null as string | null },
    { stage: 'Page Visits', value: 58400, display: '58.4K', dropOff: '96.8%' },
    { stage: 'Form Started', value: 12800, display: '12.8K', dropOff: '78.1%' },
    { stage: 'Submitted', value: 8400, display: '8.4K', dropOff: '34.4%' },
    { stage: 'High-Intent', value: 3500, display: '3.5K', dropOff: '58.3%' },
    { stage: 'Booked', value: 1400, display: '1.4K', dropOff: '60.0%' },
  ];

  const activeFunnelStages = businessModel === 'ecommerce' ? ecommerceFunnelStages : leadgenFunnelStages;

  const [hoveredFunnelIdx, setHoveredFunnelIdx] = useState<number | null>(null);
  const maxFunnelValue = Math.max(...activeFunnelStages.map(s => s.value));

  const funnelData = {
    content: (
      <div className="flex flex-col h-full">
        {/* Pure CSS Horizontal Bar — funnel visualization */}
        <div className="space-y-4 py-1">
          {activeFunnelStages.map((stage, idx) => {
            const barWidth = Math.max((stage.value / maxFunnelValue) * 100, 3);
            return (
              <div
                key={`funnel-stage-${idx}`}
                className="relative flex items-center gap-3 group"
                onMouseEnter={() => setHoveredFunnelIdx(idx)}
                onMouseLeave={() => setHoveredFunnelIdx(null)}
              >
                <span
                  className="w-[80px] flex-shrink-0 text-right text-gray-500"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  {stage.stage}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-gray-50 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-500 ease-out"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: funnelChartColors[idx % funnelChartColors.length],
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span
                    className="flex-shrink-0 text-gray-700"
                    style={{ fontSize: 13, fontWeight: 600, minWidth: 40 }}
                  >
                    {stage.display}
                  </span>
                </div>
                {/* Tooltip on hover */}
                {hoveredFunnelIdx === idx && (
                  <div className="absolute left-[90px] -top-12 z-10 bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)] pointer-events-none">
                    <p className="text-sm text-gray-900 mb-1" style={{ fontWeight: 600 }}>{stage.stage}</p>
                    <p className="text-[13px] text-gray-600" style={{ fontWeight: 400 }}>Volume: {stage.display}</p>
                    {stage.dropOff && (
                      <p className="text-[13px] text-amber-600 mt-0.5" style={{ fontWeight: 500 }}>Drop-off: {stage.dropOff}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Critical Drop-offs — pushed to bottom */}
        <div className="mt-auto pt-3">
          <div className="p-3 bg-gradient-to-r from-amber-50/80 to-orange-50/40 rounded-xl border border-amber-100/60">
            <p className="text-sm text-amber-900 mb-1.5" style={{ fontWeight: 600 }}>Critical Drop-off Points</p>
            {businessModel === 'ecommerce' ? (
              <div className="space-y-1">
                <p className="text-[13px] text-amber-700" style={{ fontWeight: 400 }}>• 71.7% drop from product view → add-to-cart</p>
                <p className="text-[13px] text-amber-700" style={{ fontWeight: 400 }}>• 50% cart abandonment rate at checkout</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[13px] text-amber-700" style={{ fontWeight: 400 }}>• 78.1% visitors not starting form — add social proof</p>
                <p className="text-[13px] text-amber-700" style={{ fontWeight: 400 }}>• 34.4% form abandonment — reduce field count</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    insights: businessModel === 'ecommerce' ? [
      <span key="1"><span style={{ fontWeight: 600 }}>Product to cart conversion at 28%</span> — below industry avg (35%). Test urgency tactics &amp; social proof.</span>,
      <span key="2"><span style={{ fontWeight: 600 }}>Checkout abandonment at 67%</span>. Top reasons: shipping costs surprise &amp; complex checkout form.</span>,
      <span key="3">Mobile funnel conversion <span style={{ fontWeight: 600 }}>22% lower than desktop</span>. Optimize mobile checkout flow urgently.</span>
    ] : [
      <span key="1"><span style={{ fontWeight: 600 }}>Landing to form start at 22%</span> — add trust signals (testimonials, logos) above fold to improve engagement.</span>,
      <span key="2"><span style={{ fontWeight: 600 }}>Form completion at 66%</span> is strong. The 34% drop suggests fields 3-4 are friction points — test removing them.</span>,
      <span key="3"><span style={{ fontWeight: 600 }}>MQL rate at 42%</span> indicates good targeting. Focus on scaling top-of-funnel traffic volume.</span>
    ]
  };

  return (
    <div className="space-y-6">
      {/* KPI Widgets Grid - Responsive grid that adapts to number of KPIs */}
      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5`}>
        {kpis.map((kpi, index) => (
          <KPIWidget key={index} {...kpi} />
        ))}
        {additionalMetrics.map((metricName) => {
          const metricData = ADDITIONAL_METRICS_DATA[metricName];
          if (!metricData) return null;
          return (
            <SimpleMetricWidget
              key={metricName}
              label={metricName}
              value={metricData.value}
              trend={metricData.trend}
              isPositive={metricData.isPositive}
              icon={metricData.icon}
            />
          );
        })}
      </div>

      {/* Summary Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryWidget
          title="Meta Campaign Overview"
          icon={Zap}
          iconBg="bg-brand-light"
          iconColor="text-brand"
          data={metaCampaignData}
          onViewDetails={() => setActiveDrawer('campaigns')}
          showViewDetails={false}
        />

        <SummaryWidget
          title="Google Campaign Overview"
          icon={Zap}
          iconBg="bg-brand-light"
          iconColor="text-brand"
          data={googleCampaignData}
          onViewDetails={() => setActiveDrawer('campaigns')}
          showViewDetails={false}
        />

        <SummaryWidget
          title="Creative Performance"
          icon={Palette}
          iconBg="bg-blue-100"
          iconColor="text-brand"
          data={creativesData}
          onViewDetails={() => setActiveDrawer('creatives')}
        />

        <SummaryWidget
          title="Website Performance"
          icon={Globe}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          data={websiteData}
          onViewDetails={() => setActiveDrawer('website')}
          onCardClick={onNavigateToWebsite}
          showViewDetails={false}
        />
      </div>

      {/* Month-over-Month / Day-over-Day Performance Table */}
      <MoMPerformanceTable businessModel={businessModel} />

      {/* Drawers — dynamically imported, portal-rendered */}
      <CampaignsDrawer isOpen={activeDrawer === 'campaigns'} onClose={() => setActiveDrawer(null)} businessModel={businessModel} />
      <CreativesDrawer isOpen={activeDrawer === 'creatives'} onClose={() => setActiveDrawer(null)} businessModel={businessModel} />
      <WebsiteDrawer isOpen={activeDrawer === 'website'} onClose={() => setActiveDrawer(null)} />
    </div>
  );
}
