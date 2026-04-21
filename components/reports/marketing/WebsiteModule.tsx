'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
  Timer,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  ChevronDown,
  Smartphone,
  Monitor,
  Zap,
  Target
} from 'lucide-react';
import { GA4PieChartsSection, TrafficSourcesSection, PageSpeedTab } from './OverviewDrawers';

interface WebsiteModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
}

// KPI Widget
function KPIWidget({ 
  label, value, change, isPositive, icon: Icon, status 
}: { 
  label: string; value: string; change: string; isPositive: boolean; icon: any; status: 'good' | 'warning' | 'bad';
}) {
  const statusConfig = {
    good: { icon: CheckCircle, iconColor: 'text-green-500', bgColor: 'bg-green-50', ringColor: 'ring-green-500/20', trendBg: 'bg-green-50', trendText: 'text-green-700' },
    warning: { icon: AlertCircle, iconColor: 'text-amber-500', bgColor: 'bg-amber-50', ringColor: 'ring-amber-500/20', trendBg: 'bg-amber-50', trendText: 'text-amber-700' },
    bad: { icon: AlertCircle, iconColor: 'text-red-500', bgColor: 'bg-red-50', ringColor: 'ring-red-500/20', trendBg: 'bg-red-50', trendText: 'text-red-700' },
  };
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-soft-md hover:shadow-soft-xl transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 ${config.bgColor} rounded-xl flex items-center justify-center ring-4 ${config.ringColor} transition-all duration-300 group-hover:scale-110`}>
          <Icon className="w-4.5 h-4.5 text-gray-700" />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1" style={{ fontWeight: 500 }}>{label}</p>
      <p className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>{value}</p>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 ${config.trendBg} rounded-full`}>
        {isPositive ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-amber-600" />}
        <span className={`text-[13px] ${isPositive ? 'text-green-700' : 'text-amber-700'}`} style={{ fontWeight: 600 }}>{change}</span>
      </div>
    </div>
  );
}

export function WebsiteModule({ businessModel, selectedChannel }: WebsiteModuleProps) {
  const [speedDevice, setSpeedDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [websiteTab, setWebsiteTab] = useState<'ga4' | 'pagespeed'>('pagespeed');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSourceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sourceOptions = [
    { id: 'pagespeed' as const, label: 'PageSpeed Insights', icon: Zap },
    { id: 'ga4' as const, label: 'Google Analytics 4', icon: BarChart3 },
  ];
  const activeSource = sourceOptions.find(s => s.id === websiteTab)!;

  // KPI widgets data
  const kpis = businessModel === 'ecommerce' ? [
    { label: 'Total Users', value: '68,524', change: '+8.2%', isPositive: true, icon: Users, status: 'good' as const },
    { label: 'Sessions', value: '92,840', change: '+12.4%', isPositive: true, icon: Activity, status: 'good' as const },
    { label: 'Bounce Rate', value: '42.5%', change: '-3.1%', isPositive: true, icon: ArrowUpRight, status: 'good' as const },
    { label: 'Conversion %', value: '3.42%', change: '+0.18%', isPositive: true, icon: Target, status: 'good' as const },
    { label: 'Avg. Session Duration', value: '4m 32s', change: '-12s', isPositive: false, icon: Clock, status: 'warning' as const },
    { label: 'Avg. Engagement Time', value: '1m 48s', change: '+14s', isPositive: true, icon: Timer, status: 'good' as const },
  ] : [
    { label: 'Total Users', value: '24,850', change: '+12.4%', isPositive: true, icon: Users, status: 'good' as const },
    { label: 'Sessions', value: '34,740', change: '+15.2%', isPositive: true, icon: Activity, status: 'good' as const },
    { label: 'Bounce Rate', value: '38.2%', change: '-4.5%', isPositive: true, icon: ArrowUpRight, status: 'good' as const },
    { label: 'Avg. Session Duration', value: '2m 48s', change: '+18s', isPositive: true, icon: Clock, status: 'good' as const },
    { label: 'Avg. Engagement Time', value: '1m 24s', change: '+8s', isPositive: true, icon: Timer, status: 'good' as const },
  ];

  // PageSpeed data for PageSpeedTab
  const pagespeedData = {
    mobile: {
      score: 72,
      lcp: { value: '3.1s', status: 'warning', target: '≤ 2.5s' },
      fid: { value: '120ms', status: 'warning', target: '≤ 100ms' },
      cls: { value: '0.12', status: 'warning', target: '≤ 0.1' },
      fcp: { value: '2.4s', status: 'warning', target: '≤ 1.8s' },
      si: { value: '4.2s', status: 'warning', target: '≤ 3.4s' },
      tti: { value: '4.8s', status: 'bad', target: '≤ 3.8s' },
    },
    desktop: {
      score: 91,
      lcp: { value: '1.8s', status: 'good', target: '≤ 2.5s' },
      fid: { value: '45ms', status: 'good', target: '≤ 100ms' },
      cls: { value: '0.04', status: 'good', target: '≤ 0.1' },
      fcp: { value: '1.2s', status: 'good', target: '≤ 1.8s' },
      si: { value: '1.8s', status: 'good', target: '≤ 3.4s' },
      tti: { value: '2.1s', status: 'good', target: '≤ 3.8s' },
    }
  };

  const activeData = pagespeedData[speedDevice];
  const getScoreColor = (score: number) => score >= 90 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  const getScoreBorder = (score: number) => score >= 90 ? 'border-green-500' : score >= 50 ? 'border-amber-500' : 'border-red-500';
  const getScoreBg = (score: number) => score >= 90 ? 'bg-green-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50';
  const getStatusDot = (status: string) => status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500';
  const getStatusText = (status: string) => status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-amber-600' : 'text-red-600';

  // GA4 Top Pages data
  const topPages = businessModel === 'ecommerce' ? [
    { page: '/products/bestsellers', views: '18,245', duration: '5m 24s', bounce: '32.4%', convRate: '4.6%' },
    { page: '/summer-collection', views: '14,856', duration: '4m 18s', bounce: '38.2%', convRate: '4.4%' },
    { page: '/products/new-arrivals', views: '10,645', duration: '3m 54s', bounce: '42.1%', convRate: '4.8%' },
    { page: '/blog/style-guide-2026', views: '8,420', duration: '6m 12s', bounce: '28.6%', convRate: '1.2%' },
    { page: '/checkout', views: '6,840', duration: '2m 36s', bounce: '68.2%', convRate: '38.5%' },
  ] : [
    { page: '/services', views: '8,420', duration: '3m 12s', bounce: '35.4%', convRate: '12.8%' },
    { page: '/contact', views: '6,240', duration: '2m 48s', bounce: '28.5%', convRate: '22.4%' },
    { page: '/landing/consultation', views: '5,680', duration: '2m 06s', bounce: '32.2%', convRate: '18.5%' },
    { page: '/about', views: '4,120', duration: '1m 54s', bounce: '52.8%', convRate: '4.2%' },
    { page: '/blog/tax-planning-tips', views: '3,450', duration: '4m 42s', bounce: '24.6%', convRate: '6.8%' },
  ];

  return (
    <div className="space-y-6">
      {/* 5 KPI Widgets */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${kpis.length > 5 ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4`}>
        {kpis.map((kpi, index) => (
          <KPIWidget key={index} {...kpi} />
        ))}
      </div>

      {/* Data Source Dropdown + Mobile/Desktop Toggle Row */}
      <div className="flex items-center justify-between">
        {/* Left: Data Source Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200/60 rounded-xl text-sm hover:bg-gray-50 transition-all shadow-soft"
            style={{ fontWeight: 500 }}
          >
            {(() => { const SourceIcon = activeSource.icon; return <SourceIcon className="w-4 h-4 text-gray-600" />; })()}
            <span className="text-gray-900" style={{ fontWeight: 600 }}>{activeSource.label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showSourceDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-gray-200/60 rounded-xl shadow-dropdown py-1.5 z-20">
              {sourceOptions.map((option) => {
                const OptionIcon = option.icon;
                const isActive = websiteTab === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => { setWebsiteTab(option.id); setShowSourceDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                      isActive ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={{ fontWeight: isActive ? 600 : 400 }}
                  >
                    <OptionIcon className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                    {option.label}
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Mobile/Desktop Toggle (PageSpeed only) */}
        {websiteTab === 'pagespeed' && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setSpeedDevice('mobile')}
              className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm transition-all ${
                speedDevice === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ fontWeight: speedDevice === 'mobile' ? 600 : 400 }}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
            <button
              onClick={() => setSpeedDevice('desktop')}
              className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm transition-all ${
                speedDevice === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ fontWeight: speedDevice === 'desktop' ? 600 : 400 }}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {websiteTab === 'ga4' ? (
        <div className="space-y-6">
          {/* New vs Returning Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>New vs Returning Users</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/60 rounded-xl">
                <p className="text-[13px] text-gray-600 mb-1" style={{ fontWeight: 400 }}>New Users</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{businessModel === 'ecommerce' ? '42,856' : '16,420'}</p>
                <p className="text-[13px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{businessModel === 'ecommerce' ? '62.5%' : '66.1%'} of total</p>
              </div>
              <div className="p-4 bg-indigo-50/60 rounded-xl">
                <p className="text-[13px] text-gray-600 mb-1" style={{ fontWeight: 400 }}>Returning Users</p>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{businessModel === 'ecommerce' ? '25,668' : '8,430'}</p>
                <p className="text-[13px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{businessModel === 'ecommerce' ? '37.5%' : '33.9%'} of total</p>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Top Pages</h3>
            <div className="space-y-2">
              {topPages.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[13px] text-gray-400" style={{ fontWeight: 700 }}>#{idx + 1}</span>
                    <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{page.page}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-[13px] text-right ml-4">
                    <div>
                      <p className="text-gray-500" style={{ fontWeight: 400 }}>Views</p>
                      <p className="text-gray-900" style={{ fontWeight: 600 }}>{page.views}</p>
                    </div>
                    <div>
                      <p className="text-gray-500" style={{ fontWeight: 400 }}>Duration</p>
                      <p className="text-gray-900" style={{ fontWeight: 600 }}>{page.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500" style={{ fontWeight: 400 }}>Bounce</p>
                      <p className={`${parseFloat(page.bounce) > 50 ? 'text-amber-600' : 'text-gray-900'}`} style={{ fontWeight: 600 }}>{page.bounce}</p>
                    </div>
                    <div>
                      <p className="text-gray-500" style={{ fontWeight: 400 }}>{businessModel === 'ecommerce' ? 'Conv.' : 'Form Rate'}</p>
                      <p className="text-green-600" style={{ fontWeight: 600 }}>{page.convRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown & Top Locations */}
          <GA4PieChartsSection />

          {/* Traffic Sources */}
          <TrafficSourcesSection />
        </div>
      ) : (
        <PageSpeedTab
          speedDevice={speedDevice}
          setSpeedDevice={setSpeedDevice}
          activeData={activeData}
          getScoreColor={getScoreColor}
          getScoreBorder={getScoreBorder}
          getScoreBg={getScoreBg}
          getStatusDot={getStatusDot}
          getStatusText={getStatusText}
          hideDeviceToggle={true}
        />
      )}
    </div>
  );
}
