'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Target, IndianRupee, Users, BarChart3, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Tooltip Component
function MetricTooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center gap-1 cursor-help"
        type="button"
      >
        {children}
        <Info className="w-3 h-3 text-gray-400 hover:text-brand transition-colors" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 pointer-events-none">
          <div className="relative">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Metrics Comparison Cards Component - REDESIGNED
export function MetricsCardsComponent({ businessModel = 'ecommerce', selectedChannel = 'all' }: { businessModel?: 'ecommerce' | 'leadgen'; selectedChannel?: string }) {
  const metricTooltips = {
    'ROAS': 'Return on Ad Spend - For every ₹1 spent on ads, how much revenue you generate. Industry benchmark: 4.0x for e-commerce.',
    'CAC': 'Customer Acquisition Cost - Average cost to acquire one paying customer through ads.',
    'CTR': 'Click-Through Rate - Percentage of people who click your ad after seeing it. Higher = more engaging ads.',
    'Conv. Rate': 'Conversion Rate - Percentage of visitors who complete a purchase or desired action.',
    'CPL': 'Cost Per Lead - Average cost to generate one lead through your campaigns.',
    'CPM': 'Cost Per Mille - Cost per 1,000 impressions. Lower CPM = more efficient reach.'
  };

  // Channel-specific data for e-commerce
  const channelDataEcommerce: Record<string, any[]> = {
    'all': [
      { label: 'ROAS', current: '3.2x', target: '4.0x', status: 'warning', change: -20, tooltip: metricTooltips['ROAS'] },
      { label: 'CAC', current: '₹850', target: '₹650', status: 'danger', change: -31, tooltip: metricTooltips['CAC'] },
      { label: 'CTR', current: '2.1%', target: '2.8%', status: 'warning', change: -25, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '2.8%', target: '3.5%', status: 'warning', change: -20, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'Meta Ads': [
      { label: 'ROAS', current: '3.8x', target: '4.0x', status: 'warning', change: -5, tooltip: metricTooltips['ROAS'] },
      { label: 'CAC', current: '₹720', target: '₹650', status: 'warning', change: -11, tooltip: metricTooltips['CAC'] },
      { label: 'CTR', current: '2.4%', target: '2.8%', status: 'warning', change: -14, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '3.1%', target: '3.5%', status: 'warning', change: -11, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'Google Ads': [
      { label: 'ROAS', current: '2.9x', target: '4.0x', status: 'danger', change: -28, tooltip: metricTooltips['ROAS'] },
      { label: 'CAC', current: '₹920', target: '₹650', status: 'danger', change: -42, tooltip: metricTooltips['CAC'] },
      { label: 'CTR', current: '1.9%', target: '2.8%', status: 'danger', change: -32, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '2.5%', target: '3.5%', status: 'warning', change: -29, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'Shopify': [
      { label: 'ROAS', current: '4.2x', target: '4.0x', status: 'success', change: 5, tooltip: metricTooltips['ROAS'] },
      { label: 'CAC', current: '₹580', target: '₹650', status: 'success', change: 11, tooltip: metricTooltips['CAC'] },
      { label: 'CTR', current: '3.2%', target: '2.8%', status: 'success', change: 14, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '3.8%', target: '3.5%', status: 'success', change: 9, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'GA4': [
      { label: 'ROAS', current: '3.5x', target: '4.0x', status: 'warning', change: -13, tooltip: metricTooltips['ROAS'] },
      { label: 'CAC', current: '₹790', target: '₹650', status: 'warning', change: -22, tooltip: metricTooltips['CAC'] },
      { label: 'CTR', current: '2.2%', target: '2.8%', status: 'warning', change: -21, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '2.9%', target: '3.5%', status: 'warning', change: -17, tooltip: metricTooltips['Conv. Rate'] },
    ]
  };

  // Channel-specific data for leadgen
  const channelDataLeadgen: Record<string, any[]> = {
    'all': [
      { label: 'CPL', current: '₹428', target: '₹350', status: 'warning', change: -22, tooltip: metricTooltips['CPL'] },
      { label: 'CPM', current: '₹185', target: '₹150', status: 'warning', change: -23, tooltip: metricTooltips['CPM'] },
      { label: 'CTR', current: '1.8%', target: '2.5%', status: 'warning', change: -28, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '3.2%', target: '4.5%', status: 'warning', change: -29, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'LinkedIn Ads': [
      { label: 'CPL', current: '₹385', target: '₹350', status: 'warning', change: -10, tooltip: metricTooltips['CPL'] },
      { label: 'CPM', current: '₹210', target: '₹180', status: 'warning', change: -17, tooltip: metricTooltips['CPM'] },
      { label: 'CTR', current: '2.3%', target: '2.5%', status: 'warning', change: -8, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '4.1%', target: '4.5%', status: 'warning', change: -9, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'Google Ads': [
      { label: 'CPL', current: '₹465', target: '₹350', status: 'danger', change: -33, tooltip: metricTooltips['CPL'] },
      { label: 'CPM', current: '₹165', target: '₹140', status: 'warning', change: -18, tooltip: metricTooltips['CPM'] },
      { label: 'CTR', current: '1.6%', target: '2.5%', status: 'danger', change: -36, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '2.8%', target: '4.5%', status: 'danger', change: -38, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'Meta Ads': [
      { label: 'CPL', current: '₹520', target: '₹350', status: 'danger', change: -49, tooltip: metricTooltips['CPL'] },
      { label: 'CPM', current: '₹142', target: '₹120', status: 'warning', change: -18, tooltip: metricTooltips['CPM'] },
      { label: 'CTR', current: '1.4%', target: '2.5%', status: 'danger', change: -44, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '2.5%', target: '4.5%', status: 'danger', change: -44, tooltip: metricTooltips['Conv. Rate'] },
    ],
    'GA4': [
      { label: 'CPL', current: '₹410', target: '₹350', status: 'warning', change: -17, tooltip: metricTooltips['CPM'] },
      { label: 'CPM', current: '₹158', target: '₹130', status: 'warning', change: -22, tooltip: metricTooltips['CPM'] },
      { label: 'CTR', current: '1.9%', target: '2.5%', status: 'warning', change: -24, tooltip: metricTooltips['CTR'] },
      { label: 'Conv. Rate', current: '3.5%', target: '4.5%', status: 'warning', change: -22, tooltip: metricTooltips['Conv. Rate'] },
    ]
  };

  const channelData = businessModel === 'ecommerce' ? channelDataEcommerce : channelDataLeadgen;
  const metrics = channelData[selectedChannel] || channelData['all'];

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const isDanger = metric.status === 'danger';
        const isSuccess = metric.status === 'success';
        
        return (
          <div 
            key={idx}
            className="group relative bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-0.5"
          >
            {/* Status indicator */}
            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${isDanger ? 'bg-red-400' : isSuccess ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
            
            {/* Label with tooltip */}
            <div className="mb-3">
              <MetricTooltip content={metric.tooltip}>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {metric.label}
                </span>
              </MetricTooltip>
            </div>
            
            {/* Current value */}
            <div className="mb-2">
              <div className="text-2xl font-semibold text-gray-900">
                {metric.current}
              </div>
            </div>
            
            {/* Target and change */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Target: <span className="font-medium text-gray-700">{metric.target}</span>
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${isDanger ? 'text-red-600' : isSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isSuccess ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-red-400' : isSuccess ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.abs(metric.change * 2)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Performance Chart Component - REDESIGNED
export function PerformanceChartComponent({ businessModel = 'ecommerce', selectedChannel = 'all' }: { businessModel?: 'ecommerce' | 'leadgen'; selectedChannel?: string }) {
  const [showInsights, setShowInsights] = useState(false);

  // Channel-specific data for e-commerce
  const ecommerceChannelData: Record<string, any[]> = {
    'all': [
      { month: 'Aug', revenue: 130000, spends: 98000 },
      { month: 'Sep', revenue: 145000, spends: 102000 },
      { month: 'Oct', revenue: 152000, spends: 108000 },
      { month: 'Nov', revenue: 162000, spends: 115000 },
      { month: 'Dec', revenue: 175000, spends: 125000 },
      { month: 'Jan', revenue: 182000, spends: 135000 },
    ],
    'Meta Ads': [
      { month: 'Aug', revenue: 58000, spends: 42000 },
      { month: 'Sep', revenue: 64000, spends: 45000 },
      { month: 'Oct', revenue: 68000, spends: 48000 },
      { month: 'Nov', revenue: 72000, spends: 51000 },
      { month: 'Dec', revenue: 78000, spends: 56000 },
      { month: 'Jan', revenue: 82000, spends: 61000 },
    ],
    'Google Ads': [
      { month: 'Aug', revenue: 52000, spends: 38000 },
      { month: 'Sep', revenue: 56000, spends: 40000 },
      { month: 'Oct', revenue: 58000, spends: 42000 },
      { month: 'Nov', revenue: 61000, spends: 45000 },
      { month: 'Dec', revenue: 64000, spends: 48000 },
      { month: 'Jan', revenue: 66000, spends: 52000 },
    ],
    'Shopify': [
      { month: 'Aug', revenue: 15000, spends: 12000 },
      { month: 'Sep', revenue: 18000, spends: 12000 },
      { month: 'Oct', revenue: 19000, spends: 12000 },
      { month: 'Nov', revenue: 21000, spends: 13000 },
      { month: 'Dec', revenue: 24000, spends: 14000 },
      { month: 'Jan', revenue: 25000, spends: 15000 },
    ],
    'GA4': [
      { month: 'Aug', revenue: 5000, spends: 6000 },
      { month: 'Sep', revenue: 7000, spends: 5000 },
      { month: 'Oct', revenue: 7000, spends: 6000 },
      { month: 'Nov', revenue: 8000, spends: 6000 },
      { month: 'Dec', revenue: 9000, spends: 7000 },
      { month: 'Jan', revenue: 9000, spends: 7000 },
    ]
  };

  // Channel-specific data for leadgen
  const leadgenChannelData: Record<string, any[]> = {
    'all': [
      { month: 'Aug', leads: 980, spends: 420000 },
      { month: 'Sep', leads: 1050, spends: 450000 },
      { month: 'Oct', leads: 1120, spends: 480000 },
      { month: 'Nov', leads: 1180, spends: 510000 },
      { month: 'Dec', leads: 1250, spends: 550000 },
      { month: 'Jan', leads: 1150, spends: 590000 },
    ],
    'LinkedIn Ads': [
      { month: 'Aug', leads: 420, spends: 185000 },
      { month: 'Sep', leads: 450, spends: 195000 },
      { month: 'Oct', leads: 480, spends: 205000 },
      { month: 'Nov', leads: 510, spends: 218000 },
      { month: 'Dec', leads: 540, spends: 235000 },
      { month: 'Jan', leads: 500, spends: 252000 },
    ],
    'Google Ads': [
      { month: 'Aug', leads: 380, spends: 165000 },
      { month: 'Sep', leads: 410, spends: 178000 },
      { month: 'Oct', leads: 430, spends: 190000 },
      { month: 'Nov', leads: 450, spends: 202000 },
      { month: 'Dec', leads: 470, spends: 218000 },
      { month: 'Jan', leads: 430, spends: 235000 },
    ],
    'Meta Ads': [
      { month: 'Aug', leads: 150, spends: 58000 },
      { month: 'Sep', leads: 160, spends: 62000 },
      { month: 'Oct', leads: 170, spends: 68000 },
      { month: 'Nov', leads: 175, spends: 72000 },
      { month: 'Dec', leads: 185, spends: 78000 },
      { month: 'Jan', leads: 170, spends: 82000 },
    ],
    'GA4': [
      { month: 'Aug', leads: 30, spends: 12000 },
      { month: 'Sep', leads: 30, spends: 15000 },
      { month: 'Oct', leads: 40, spends: 17000 },
      { month: 'Nov', leads: 45, spends: 18000 },
      { month: 'Dec', leads: 55, spends: 19000 },
      { month: 'Jan', leads: 50, spends: 21000 },
    ]
  };

  const channelData = businessModel === 'ecommerce' ? ecommerceChannelData : leadgenChannelData;
  const chartData = channelData[selectedChannel] || channelData['all'];

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  const formatLeads = (value: number) => {
    return value.toLocaleString('en-IN');
  };

  // Calculate metrics
  let totalSpends = 0;
  let isAlert = false;

  if (businessModel === 'ecommerce') {
    const ecomData = chartData as Array<{ month: string; revenue: number; spends: number }>;
    totalSpends = ecomData.reduce((sum, month) => sum + month.spends, 0);
    const latestMonth = ecomData[ecomData.length - 1];
    isAlert = !!latestMonth && latestMonth.revenue < latestMonth.spends;
  } else {
    const leadData = chartData as Array<{ month: string; leads: number; spends: number }>;
    totalSpends = leadData.reduce((sum, month) => sum + month.spends, 0);
    const latestMonth = leadData[leadData.length - 1];
    const previousMonth = leadData[leadData.length - 2];
    isAlert = !!latestMonth && !!previousMonth && latestMonth.leads < previousMonth.leads && latestMonth.spends > previousMonth.spends;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header - Minimal */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">6-Month Performance</h3>
              <p className="text-xs text-gray-500 mt-0.5">Trend analysis</p>
            </div>
            {selectedChannel !== 'all' && (
              <span className="text-xs font-medium text-brand bg-brand-light px-3 py-1 rounded-full">
                {selectedChannel}
              </span>
            )}
          </div>
          {isAlert && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              Alert
            </div>
          )}
        </div>
      </div>

      {/* Chart - Clean */}
      <div className="p-6">
        <div className="w-full" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#9ca3af' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#9ca3af' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => businessModel === 'ecommerce' ? formatCurrency(value) : (value >= 1000 ? `${(value/1000).toFixed(1)}K` : value)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px', fontSize: '11px' }}
                itemStyle={{ fontSize: '11px', padding: '2px 0' }}
                formatter={(value: number, name: string) => {
                  if (businessModel === 'ecommerce') {
                    const formatted = formatCurrency(value);
                    return [formatted, name === 'revenue' ? 'Revenue' : 'Ad Spends'];
                  } else {
                    if (name === 'leads') {
                      return [formatLeads(value), 'Leads'];
                    } else {
                      return [formatCurrency(value), 'Ad Spends'];
                    }
                  }
                }}
              />
              {businessModel === 'ecommerce' ? (
                <>
                  <Bar 
                    dataKey="revenue" 
                    fill="#204CC7"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                    opacity={0.9}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spends" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#fff', stroke: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : (
                <>
                  <Bar 
                    dataKey="leads" 
                    fill="#204CC7"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                    opacity={0.9}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spends" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#fff', stroke: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Minimal Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-brand"></div>
            <span>{businessModel === 'ecommerce' ? 'Revenue' : 'Leads'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Ad Spends</span>
          </div>
        </div>
      </div>

      {/* Insights - Collapsible */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          aria-expanded={showInsights}
          aria-controls="report-insights-panel"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Key Insights
          </span>
          {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showInsights && (
          <div id="report-insights-panel" className="px-6 py-4 bg-gray-50 space-y-2">
            {businessModel === 'ecommerce' ? (
              <>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Ad spend increased <span className="font-semibold text-gray-900">38%</span> while revenue grew only <span className="font-semibold text-gray-900">12%</span></p>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>CAC doubled from <span className="font-semibold text-gray-900">₹450 → ₹850</span> in 6 months</p>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Current margin after ad costs is minimal at <span className="font-semibold text-gray-900">₹9.5L revenue vs ₹6.8L spend</span></p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Lead volume declined <span className="font-semibold text-gray-900">8%</span> while spend increased <span className="font-semibold text-gray-900">7%</span></p>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>CPL trending upward, now at <span className="font-semibold text-gray-900">₹513</span> vs target of <span className="font-semibold text-gray-900">₹350</span></p>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>CTR at <span className="font-semibold text-gray-900">1.8%</span> well below industry benchmark of <span className="font-semibold text-gray-900">2.5%</span></p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// What's Working Component - MINIMAL DESIGN
export function WhatsWorkingComponent({ businessModel = 'ecommerce' }: { businessModel?: 'ecommerce' | 'leadgen' }) {
  const ecommerceWorkingItems = [
    {
      channel: 'Meta Ads',
      campaign: 'Summer Sale 2025',
      adSet: 'Lookalike - Purchasers 30D',
      creative: 'UGC Video - Product Demo',
      metric: '4.8x ROAS',
      spend: '₹48K',
      result: '₹2.3L revenue',
      why: 'Strong creative + warm audience = high intent conversions'
    },
    {
      channel: 'Google Ads',
      campaign: 'Brand Search - High Intent',
      adSet: 'Exact Match Keywords',
      creative: 'RSA - Promo 20% Off',
      metric: '₹450 CAC',
      spend: '₹32K',
      result: '71 customers',
      why: 'Branded keywords capture ready-to-buy customers at low cost'
    },
    {
      channel: 'Meta Ads',
      campaign: 'Product Launch - Jan 2025',
      adSet: 'Interest - Beauty Enthusiasts',
      creative: 'Carousel - Before/After',
      metric: '3.2% CTR',
      spend: '₹28K',
      result: '896 clicks',
      why: 'Visual proof resonates with cold audiences exploring solutions'
    }
  ];

  const leadgenWorkingItems = [
    {
      channel: 'LinkedIn Ads',
      campaign: 'Enterprise Demo Request',
      adSet: 'Job Title - VP Marketing',
      creative: 'Case Study Carousel',
      metric: '₹385 CPL',
      spend: '₹54K',
      result: '140 leads at ₹385 CPL',
      why: 'Senior decision-makers engage with proof-based content'
    },
    {
      channel: 'Google Ads',
      campaign: 'Solution Keywords',
      adSet: 'High-Intent Search Terms',
      creative: 'RSA - Free Audit',
      metric: '42% MQL→SQL',
      spend: '₹38K',
      result: '88 SQL from 210 MQL',
      why: 'Search intent + compelling offer = sales-ready leads'
    },
    {
      channel: 'LinkedIn Ads',
      campaign: 'Video Testimonials',
      adSet: 'Company Size - 100-500',
      creative: 'Customer Video - 30s',
      metric: '4.7% CTR',
      spend: '₹42K',
      result: '1,974 clicks',
      why: 'Real customers speaking = credibility for B2B buyers'
    }
  ];

  const workingItems = businessModel === 'ecommerce' ? ecommerceWorkingItems : leadgenWorkingItems;

  return (
    <div className="space-y-3">
      {workingItems.map((item, idx) => (
        <div 
          key={idx} 
          className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-50 rounded-md">
              {item.channel}
            </div>
            <div className="text-base font-bold text-gray-900">{item.metric}</div>
          </div>

          {/* Campaign Hierarchy */}
          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">Campaign:</span>
              <span className="text-xs font-semibold text-gray-900">{item.campaign}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">Ad Set:</span>
              <span className="text-xs text-gray-700">{item.adSet}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">Creative:</span>
              <span className="text-xs text-gray-700">{item.creative}</span>
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center gap-3 mb-3 py-2 px-3 bg-gray-50 rounded-lg">
            <div className="text-xs">
              <span className="text-gray-500">Spend:</span> <span className="font-semibold text-gray-900">{item.spend}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="text-xs">
              <span className="text-gray-500">Result:</span> <span className="font-semibold text-gray-900">{item.result}</span>
            </div>
          </div>

          {/* Why it's working */}
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
            <span className="font-medium text-gray-700">Why it works:</span> {item.why}
          </div>
        </div>
      ))}
    </div>
  );
}

// What's Broken Component - MINIMAL DESIGN
export function WhatsBrokenComponent({ businessModel = 'ecommerce' }: { businessModel?: 'ecommerce' | 'leadgen' }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const ecommerceBrokenItems = [
    {
      channel: 'Meta Ads',
      campaign: 'Holiday Retargeting 2024',
      adSet: 'Website Visitors - 90D',
      creative: 'Static Image #12',
      issue: 'Creative Fatigue',
      severity: 'Critical',
      metric: 'CTR: 0.8% → 0.3%',
      finding: 'Dropped 62% in 10 days',
      why: 'Frequency at 9.2x — audience completely burned out from seeing same creative',
      impact: '₹38K wasted',
      action: 'Pause immediately. Launch 3 new creative variations.'
    },
    {
      channel: 'Google Ads',
      campaign: 'Shopping - All Products',
      adSet: 'Low Performers',
      creative: 'Product Feed',
      issue: 'Budget Waste',
      severity: 'High',
      metric: 'ROAS: 0.9x',
      finding: '₹52K spend, ₹47K revenue',
      why: 'Bidding too high on low-margin products with poor conversion rates',
      impact: '₹52K lost',
      action: 'Restructure campaigns by margin. Exclude low performers.'
    },
    {
      channel: 'Meta Ads',
      campaign: 'Prospecting - Cold Audiences',
      adSet: 'Broad Targeting 25-45',
      creative: 'Video Ad - 15s',
      issue: 'Poor Targeting',
      severity: 'High',
      metric: 'CAC: ₹1,420',
      finding: '76% higher than account avg',
      why: 'Targeting too broad + weak creative = expensive, low-quality customers',
      impact: '₹43K waste',
      action: 'Narrow to engaged shoppers. Test interest stacking.'
    },
    {
      channel: 'Google Ads',
      campaign: 'Display - Remarketing',
      adSet: 'GDN - Auto Placements',
      creative: 'Banner Set #3',
      issue: 'Junk Traffic',
      severity: 'Critical',
      metric: '0.8% CTR',
      finding: '94% bounce rate',
      why: 'Auto-placements serving ads on low-quality sites and games',
      impact: '₹28K wasted',
      action: 'Pause GDN. Move budget to Search + Shopping.'
    }
  ];

  const leadgenBrokenItems = [
    {
      channel: 'LinkedIn Ads',
      campaign: 'Content Download - eBook',
      adSet: 'All Job Functions',
      creative: 'Single Image Ad',
      issue: 'CTR & CVR Collapse',
      severity: 'Critical',
      metric: 'Only 18% CVR',
      finding: '82% drop-off before form submission',
      why: 'Targeting too broad + low-barrier offer = low-intent clicks driving up CPM',
      impact: '₹3.1L wasted',
      action: 'Add job title filters. Raise offer barrier to demo.'
    },
    {
      channel: 'Google Ads',
      campaign: 'Search - Generic Keywords',
      adSet: 'Broad Match',
      creative: 'RSA - Generic Copy',
      issue: 'Wrong Intent',
      severity: 'High',
      metric: 'CPL: ₹680',
      finding: '2.3x account average',
      why: 'Broad match capturing research queries, not buying intent',
      impact: '₹1.8L waste',
      action: 'Switch to phrase match. Focus on solution keywords.'
    },
    {
      channel: 'LinkedIn Ads',
      campaign: 'Sponsored InMail',
      adSet: 'Cold Prospects',
      creative: 'Message Template #4',
      issue: 'Poor Engagement',
      severity: 'High',
      metric: '2.1% open rate',
      finding: '97.9% ignored',
      why: 'Generic messaging to cold audience feels spammy',
      impact: '₹94K wasted',
      action: 'Pause InMail. Redirect budget to Sponsored Content.'
    },
    {
      channel: 'Meta Ads',
      campaign: 'Lead Gen Form',
      adSet: 'Interest Targeting',
      creative: 'Static Image',
      issue: 'Form Abandonment',
      severity: 'Critical',
      metric: '78% drop-off',
      finding: 'Losing 4,200 leads/mo',
      why: 'Form has 8 fields + no trust signals = friction',
      impact: '₹2.4L lost',
      action: 'Reduce to 3 fields. Add social proof above form.'
    }
  ];

  const brokenItems = businessModel === 'ecommerce' ? ecommerceBrokenItems : leadgenBrokenItems;

  return (
    <div className="space-y-3">
      {brokenItems.map((item, idx) => {
        const isExpanded = expandedIndex === idx;
        const isCritical = item.severity === 'Critical';
        
        return (
          <div 
            key={idx}
            className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="w-full p-4 text-left"
              aria-expanded={isExpanded}
            >
              <div className="flex items-start gap-3">
                <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
                  isCritical ? 'bg-red-400' : 'bg-amber-400'
                }`}>
                </div>
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-50 rounded-md">
                        {item.channel}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                        isCritical ? 'bg-gray-900 text-white' : 'bg-gray-700 text-white'
                      }`}>{item.severity}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>

                  {/* Issue */}
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">{item.issue}: {item.finding}</h4>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-medium text-gray-600">{item.metric}</span>
                    <div className="w-px h-3 bg-gray-200"></div>
                    <span className="font-semibold text-gray-900">Impact: {item.impact}</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Expandable Details */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div className="ml-4 space-y-2.5">
                  {/* Campaign Details */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex gap-2">
                      <span className="text-gray-400 font-medium w-20">Campaign:</span>
                      <span className="text-gray-900 font-semibold">{item.campaign}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-400 font-medium w-20">Ad Set:</span>
                      <span className="text-gray-700">{item.adSet}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-400 font-medium w-20">Creative:</span>
                      <span className="text-gray-700">{item.creative}</span>
                    </div>
                  </div>

                  {/* Why it's broken */}
                  <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
                    <span className="font-semibold text-gray-900">Root cause:</span> {item.why}
                  </div>

                  {/* Action */}
                  <div className="text-xs bg-gray-900 text-white rounded-lg p-3 leading-relaxed">
                    <span className="font-semibold">Fix:</span> {item.action}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Risk Flags Component - SIMPLIFIED & CONCISE
export function RiskFlagsComponent({ businessModel = 'ecommerce' }: { businessModel?: 'ecommerce' | 'leadgen' }) {
  const ecommerceRisks = [
    {
      title: 'ROAS declining 2.3% weekly',
      current: '3.2x',
      projected: '1.9x',
      timeline: '4 Weeks',
      severity: 'critical' as const
    },
    {
      title: 'Creative fatigue (9.2x frequency)',
      current: 'CTR 0.8%',
      projected: 'CTR 0.3%',
      timeline: '7-10 Days',
      severity: 'high' as const
    },
    {
      title: 'Single channel risk (82% Google)',
      current: '₹4.8L/mo',
      projected: 'Existential',
      timeline: 'Critical',
      severity: 'critical' as const
    }
  ];

  const leadgenRisks = [
    {
      title: 'CTR declining 3.2%/week',
      current: '1.8%',
      projected: '0.9%',
      timeline: '8-12 Weeks',
      severity: 'critical' as const
    },
    {
      title: 'CPL increasing 4.8% weekly',
      current: '₹428',
      projected: '₹680',
      timeline: '4-6 Weeks',
      severity: 'high' as const
    },
    {
      title: 'CPM rising — reach efficiency dropping',
      current: '₹185',
      projected: '₹290',
      timeline: 'Immediate',
      severity: 'critical' as const
    }
  ];

  const risks = businessModel === 'ecommerce' ? ecommerceRisks : leadgenRisks;

  return (
    <div className="space-y-2">
      {risks.map((risk, idx) => {
        const isCritical = risk.severity === 'critical';
        
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
          >
            {/* Severity indicator */}
            <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
              isCritical ? 'bg-red-400' : 'bg-amber-400'
            }`}></div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-gray-900 mb-1">{risk.title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">{risk.current}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-red-600">{risk.projected}</span>
              </div>
            </div>
            
            {/* Timeline badge */}
            <div className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 ${
              isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {risk.timeline}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Recommendations Component - WORLD-CLASS ACTION PLAN
export function RecommendationsComponent({ businessModel = 'ecommerce' }: { businessModel?: 'ecommerce' | 'leadgen' }) {
  const ecommerceActions = [
    {
      channel: 'Meta Ads',
      priority: 'Critical',
      action: 'Pause Creative - Fatigue Detected',
      campaign: 'Holiday Retargeting 2024',
      adSet: 'Website Visitors - 90D',
      creative: 'Static Image #12',
      issue: 'Frequency 9.2x → CTR dropped 62%',
      fix: 'Launch 3 new UGC video creatives',
      impact: '₹38K',
      impactLabel: 'monthly savings',
      timeline: 'Today'
    },
    {
      channel: 'Google Ads',
      priority: 'High ROI',
      action: 'Restructure Shopping Campaign',
      campaign: 'Shopping - All Products',
      adSet: 'Low Margin SKUs',
      creative: 'Product Feed',
      issue: 'ROAS 0.9x → losing ₹5K/day',
      fix: 'Split by margin tiers, exclude bottom 20%',
      impact: '₹52K',
      impactLabel: 'monthly savings',
      timeline: '2-3 days'
    },
    {
      channel: 'Meta Ads',
      priority: 'High Impact',
      action: 'Scale Top Performer',
      campaign: 'Summer Sale 2025',
      adSet: 'Lookalike - Purchasers 30D',
      creative: 'UGC Video - Product Demo',
      issue: 'Currently 4.8x ROAS but only 12% of budget',
      fix: 'Increase budget from ₹48K → ₹120K/mo',
      impact: '+₹3.4L',
      impactLabel: 'monthly revenue',
      timeline: '3-5 days'
    },
    {
      channel: 'Google Ads',
      priority: 'Quick Win',
      action: 'Fix Brand Search',
      campaign: 'Brand Keywords',
      adSet: 'Exact Match - Brand Terms',
      creative: 'RSA - Generic Template',
      issue: 'Losing 23% impression share to competitors',
      fix: 'Increase bids 30%, add promotion extensions',
      impact: '+₹85K',
      impactLabel: 'monthly revenue',
      timeline: 'Today'
    }
  ];

  const leadgenActions = [
    {
      channel: 'LinkedIn Ads',
      priority: 'Critical',
      action: 'Fix CTR & Conversion Crisis',
      campaign: 'Content Download - eBook',
      adSet: 'All Job Functions',
      creative: 'Single Image Ad',
      issue: 'Only 18% CVR → sales team overload',
      fix: 'Narrow to VP+ titles, switch offer to demo',
      impact: '₹3.1L',
      impactLabel: 'monthly savings',
      timeline: '2-3 days'
    },
    {
      channel: 'Meta Ads',
      priority: 'High Impact',
      action: 'Reduce Form Friction',
      campaign: 'Lead Gen Form',
      adSet: 'Interest Targeting',
      creative: 'Static Image',
      issue: '78% form abandonment → 4,200 leads lost/mo',
      fix: 'Reduce from 8 fields to 3, add trust badges',
      impact: '+3,200',
      impactLabel: 'leads/month',
      timeline: '1-2 days'
    },
    {
      channel: 'Google Ads',
      priority: 'High ROI',
      action: 'Fix Search Intent Mismatch',
      campaign: 'Search - Generic Keywords',
      adSet: 'Broad Match',
      creative: 'RSA - Generic Copy',
      issue: 'CPL ₹680 (2.3x account avg) → wrong intent',
      fix: 'Switch to phrase match + solution keywords',
      impact: '₹1.8L',
      impactLabel: 'monthly savings',
      timeline: '2-3 days'
    },
    {
      channel: 'LinkedIn Ads',
      priority: 'Quick Win',
      action: 'Scale Video Testimonials',
      campaign: 'Video Testimonials',
      adSet: 'Company Size - 100-500',
      creative: 'Customer Video - 30s',
      issue: '4.7% CTR but only 15% of budget',
      fix: 'Double budget + expand to 500-1000 size',
      impact: '+280',
      impactLabel: 'leads/mo at lower CPL',
      timeline: '3-4 days'
    }
  ];

  const actions = businessModel === 'ecommerce' ? ecommerceActions : leadgenActions;

  const priorityConfig = {
    'Critical': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'High ROI': { bg: 'bg-brand-light', text: 'text-brand', border: 'border-brand/20' },
    'High Impact': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Quick Win': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
  };

  const channelConfig = {
    'Meta Ads': { bg: 'bg-brand-light', text: 'text-brand', icon: '📘' },
    'Google Ads': { bg: 'bg-red-50', text: 'text-red-700', icon: '🔍' },
    'LinkedIn Ads': { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: '💼' }
  };

  return (
    <div className="space-y-4">
      {actions.map((action, idx) => {
        const priority = priorityConfig[action.priority as keyof typeof priorityConfig];
        const channel = channelConfig[action.channel as keyof typeof channelConfig];
        
        return (
          <div 
            key={idx} 
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${channel.bg} ${channel.text}`}>
                  {channel.icon} {action.channel}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${priority.bg} ${priority.text}`}>
                  {action.priority}
                </span>
              </div>
              <div className="text-xs font-medium text-gray-500">{action.timeline}</div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Action Title */}
              <h4 className="text-sm font-bold text-gray-900 mb-3">{action.action}</h4>

              {/* Campaign Hierarchy */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-medium w-16 flex-shrink-0">Campaign:</span>
                  <span className="text-gray-900 font-semibold">{action.campaign}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-medium w-16 flex-shrink-0">Ad Set:</span>
                  <span className="text-gray-700">{action.adSet}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-medium w-16 flex-shrink-0">Creative:</span>
                  <span className="text-gray-700">{action.creative}</span>
                </div>
              </div>

              {/* Issue & Fix */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-red-600 w-12 flex-shrink-0">Issue:</span>
                  <span className="text-gray-700">{action.issue}</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-emerald-600 w-12 flex-shrink-0">Fix:</span>
                  <span className="text-gray-900">{action.fix}</span>
                </div>
              </div>

              {/* Impact */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg px-4 py-2.5 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Projected Impact:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-emerald-700">{action.impact}</span>
                    <span className="text-xs text-gray-600">{action.impactLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <div className="text-center space-y-1 pt-2">
        <h4 className="text-sm font-semibold text-gray-900">Ready to Execute?</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          These actions can save you {businessModel === 'ecommerce' ? '₹1.2L+' : '₹5L+'} monthly. Our team at Brego has executed similar fixes for 200+ brands.
        </p>
      </div>
    </div>
  );
}

// Warning Footer Component - REDESIGNED
export function WarningFooterComponent({ businessModel = 'ecommerce' }: { businessModel?: 'ecommerce' | 'leadgen' }) {
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-5 text-white shadow-lg shadow-red-500/20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold mb-1.5 text-sm">Critical Action Required</h4>
          {businessModel === 'ecommerce' ? (
            <p className="text-xs text-white/90 leading-relaxed">
              Without immediate intervention, declining ROAS and rising CAC will compound into a performance collapse. 
              Address <span className="font-semibold">scaling + efficiency risks first</span>, then tackle channel diversification. 
              Time-sensitive to prevent ₹2.5L+ quarterly losses.
            </p>
          ) : (
            <p className="text-xs text-white/90 leading-relaxed">
              CTR declining (1.8% → 0.9%), CPL exploding (₹428 → ₹680), and CPM rising fast indicating audience fatigue. 
              Implement <span className="font-semibold">targeting refinement + creative refresh</span> immediately to prevent further spend waste.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
