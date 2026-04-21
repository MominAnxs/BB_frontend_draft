import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Share2 } from 'lucide-react';

interface RevenueVsSpendChartProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
}

export function RevenueVsSpendChart({ businessModel, selectedChannel }: RevenueVsSpendChartProps) {
  // Realistic month-on-month data for e-commerce business
  const ecommerceData = [
    { month: 'Jul', spend: 850000, revenue: 1450000 },
    { month: 'Aug', spend: 920000, revenue: 1680000 },
    { month: 'Sep', spend: 980000, revenue: 1820000 },
    { month: 'Oct', spend: 1050000, revenue: 2150000 },
    { month: 'Nov', spend: 1280000, revenue: 2420000 },
    { month: 'Dec', spend: 1620000, revenue: 2680000 }
  ];

  // Lead generation data with leads and CTR
  const leadgenData = [
    { month: 'Jul', spend: 450000, leads: 712, ctr: 2.1 },
    { month: 'Aug', spend: 520000, leads: 865, ctr: 2.3 },
    { month: 'Sep', spend: 580000, leads: 945, ctr: 2.5 },
    { month: 'Oct', spend: 620000, leads: 1021, ctr: 2.4 },
    { month: 'Nov', spend: 720000, leads: 1150, ctr: 2.7 },
    { month: 'Dec', spend: 850000, leads: 1248, ctr: 2.8 }
  ];

  const data = businessModel === 'ecommerce' ? ecommerceData : leadgenData;

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
  };

  const formatLeads = (value: number) => {
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label} 2025</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {entry.dataKey === 'leads' ? formatLeads(entry.value) : formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          {payload.length === 2 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between gap-4">
                {businessModel === 'ecommerce' ? (
                  <>
                    <span className="text-xs text-gray-500">ROAS:</span>
                    <span className="text-sm font-bold text-brand">
                      {(payload[0].value / payload[1].value).toFixed(2)}x
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-gray-500">CTR:</span>
                    <span className="text-sm font-bold text-brand">
                      {payload[0].payload.ctr}%
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Insight data based on business model
  const insights = businessModel === 'ecommerce' 
    ? [
        {
          icon: TrendingUp,
          type: 'success' as const,
          text: 'Revenue surged 85% (₹14.5L→₹26.8L) Jul-Dec, while spend grew 90% (₹8.5L→₹16.2L)—ROAS compressed from 1.71x to 1.65x, indicating scaling at slight efficiency cost'
        },
        {
          icon: CheckCircle,
          type: 'success' as const,
          text: 'Oct-Nov delivered strongest revenue acceleration (+13% MoM avg)—replicate Q4 campaign strategies and holiday season tactics for 2026 planning'
        },
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'Dec saw highest spend spike (+27% vs Nov at ₹16.2L) with only 11% revenue lift—post-holiday fatigue or audience saturation requires January optimization'
        },
        {
          icon: TrendingUp,
          type: 'info' as const,
          text: 'Best efficiency period: Jul-Sep averaged 1.82x ROAS vs Oct-Dec at 1.73x—seasonal demand shifts justify higher Q4 spend despite margin compression'
        },
        {
          icon: CheckCircle,
          type: 'success' as const,
          text: 'Consistent MoM revenue growth (no negative months) demonstrates strong product-market fit—focus on customer retention to compound LTV gains'
        },
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'H2 2025 total: ₹128.8L revenue at ₹72L spend (1.79x ROAS)—if target is 2.0x+ ROAS, need ₹15L monthly cost reduction or 17% AOV improvement'
        }
      ]
    : [
        {
          icon: TrendingUp,
          type: 'success' as const,
          text: 'Lead volume grew 75% (712→1,248) Jul-Dec, but spend increased 89% (₹4.5L→₹8.5L)—CPL rose from ₹632 to ₹681 (+8%), manageable if SQL quality holds'
        },
        {
          icon: CheckCircle,
          type: 'success' as const,
          text: 'Nov achieved peak qualification rate (33% SQL) despite high volume (1,150 leads)—analyze targeting, creative, and landing page strategies from this period'
        },
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'Dec SQL rate dropped to 32% from Nov\'s 33% despite 18% higher spend—pause underperforming campaigns and reallocate ₹1.3L+ monthly to Nov winners'
        },
        {
          icon: TrendingUp,
          type: 'info' as const,
          text: 'Q3 (Jul-Sep) averaged ₹618 CPL vs Q4 (Oct-Dec) at ₹693 CPL—12% degradation suggests creative refresh needed or competitive pressure intensifying'
        },
        {
          icon: CheckCircle,
          type: 'success' as const,
          text: 'Oct delivered best efficiency: 1,021 leads at ₹6.2L spend (₹607 CPL) with 29% SQL—scale Oct\'s channel mix for Q1 2026 if CAC targets permit'
        },
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'H2 2025 performance: 5,941 total leads at ₹36.9L investment (₹621 avg CPL)—if target CAC <₹2,000, current 30% SQL rate requires sub-₹600 CPL maintenance'
        }
      ];

  const getInsightStyles = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-brand-light border-brand/20 text-brand';
    }
  };

  const getIconColor = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-brand';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {businessModel === 'ecommerce' ? 'Revenue vs Spend Trends' : 'Leads vs Spend Trends'}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Last 6 months performance comparison
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {businessModel === 'ecommerce' ? 'Revenue' : 'Leads'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Ad Spend</span>
          </div>
        </div>
      </div>

      <div className="w-full" style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height={320} minWidth={0}>
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickFormatter={businessModel === 'ecommerce' ? formatCurrency : formatLeads}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={businessModel === 'ecommerce' ? 'revenue' : 'leads'}
              stroke="#2563eb" 
              strokeWidth={3}
              name={businessModel === 'ecommerce' ? 'Revenue' : 'Leads'}
              dot={{ fill: '#2563eb', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="spend" 
              stroke="#f97316" 
              strokeWidth={3}
              name="Ad Spend"
              dot={{ fill: '#f97316', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Integrated Key Insights Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Key Insights</h3>
          <span className="text-xs text-gray-500">Critical observations from your data</span>
        </div>

        <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`
                  flex items-start gap-2 p-3 rounded-lg border relative group
                  ${getInsightStyles(insight.type)}
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${getIconColor(insight.type)}`} />
                <p className="text-sm leading-snug flex-1 pr-6">
                  {insight.text}
                </p>
                <button 
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                  aria-label="Share insight"
                >
                  <Share2 className={`w-3.5 h-3.5 ${getIconColor(insight.type)}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}