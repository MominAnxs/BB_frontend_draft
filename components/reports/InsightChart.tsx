import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface InsightChartProps {
  businessModel: 'ecommerce' | 'leadgen';
}

export function InsightChart({ businessModel }: InsightChartProps) {
  // Generate mock data for the charts
  const ecommerceData = [
    { month: 'Jan', orders: 287, revenue: 8.2 },
    { month: 'Feb', orders: 334, revenue: 9.5 },
    { month: 'Mar', orders: 380, revenue: 10.8 },
    { month: 'Apr', orders: 394, revenue: 11.2 },
    { month: 'May', orders: 428, revenue: 12.1 },
    { month: 'Jun', orders: 415, revenue: 11.8 },
  ];

  const leadGenData = [
    { month: 'Jan', leads: 520, spend: 1.8 },
    { month: 'Feb', leads: 615, spend: 2.1 },
    { month: 'Mar', leads: 720, spend: 2.3 },
    { month: 'Apr', leads: 780, spend: 2.5 },
    { month: 'May', leads: 845, spend: 2.7 },
    { month: 'Jun', leads: 810, spend: 3.1 },
  ];

  const chartData = businessModel === 'ecommerce' ? ecommerceData : leadGenData;
  const mainMetricKey = businessModel === 'ecommerce' ? 'orders' : 'leads';
  const mainMetricLabel = businessModel === 'ecommerce' ? 'Orders' : 'Leads';
  const mainMetricColor = businessModel === 'ecommerce' ? '#204CC7' : '#204CC7';
  const secondaryMetricKey = businessModel === 'ecommerce' ? 'revenue' : 'spend';
  const secondaryMetricLabel = businessModel === 'ecommerce' ? 'Revenue (₹L)' : 'Spend (₹L)';
  const secondaryMetricColor = businessModel === 'ecommerce' ? '#10b981' : '#ef4444';

  // Insight data based on business model
  const insights = businessModel === 'ecommerce' 
    ? [
        {
          icon: TrendingUp,
          type: 'success' as const,
          text: 'Order volume surged 49% (287→428) Jan-May, while revenue grew 48% (₹8.2L→₹12.1L)—AOV holding steady at ₹2,826 indicates healthy scaling without margin erosion'
        },
        {
          icon: CheckCircle,
          type: 'success' as const,
          text: 'Jun revenue sustained at ₹11.8L despite 3% order dip (428→415), suggesting higher-value purchases or improved upsell/cross-sell efficiency'
        },
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'May-to-Jun order decline breaks 5-month growth streak—investigate traffic drops, conversion rate changes, or seasonal factors before Q3 planning'
        },
        {
          icon: TrendingUp,
          type: 'info' as const,
          text: 'Strongest MoM growth in Feb-Mar (+14% orders, +14% revenue)—analyze channel mix and creative strategies from this period for replication'
        },
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'Revenue/order efficiency plateaued Apr-Jun (₹11.2L-₹12.1L range)—consider product bundling, loyalty programs, or premium SKU expansion to boost AOV'
        }
      ]
    : [
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'Lead volume grew 56% (520→810) but spend increased 72% (₹1.8L→₹3.1L)—CPL inflated from ₹346 to ₹383 (+11%), signaling diminishing returns or audience saturation'
        },
        {
          icon: TrendingUp,
          type: 'info' as const,
          text: 'May delivered peak performance (845 leads at ₹2.7L spend, ₹320 CPL)—Jun dropped 4% in volume despite 15% higher spend, indicating campaign fatigue or targeting issues'
        },
        {
          icon: CheckCircle,
          type: 'success' as const,
          text: 'Q1 efficiency (Jan-Mar) averaged ₹333 CPL vs Q2 (Apr-Jun) at ₹367 CPL—10% degradation suggests need for creative refresh or channel rebalancing'
        },
        {
          icon: AlertTriangle,
          type: 'warning' as const,
          text: 'Jun shows worst efficiency: 810 leads at ₹3.1L (₹383 CPL), 20% higher than May—pause underperforming campaigns and reallocate ₹40K+ monthly to proven channels'
        },
        {
          icon: TrendingUp,
          type: 'info' as const,
          text: 'Consistent MoM lead growth Jan-May (+18% avg) demonstrates strong demand—scale budget strategically with focus on maintaining sub-₹350 CPL for profitability'
        },
        {
          icon: CheckCircle,
          type: 'success' as const,
          text: 'Total H1 performance: 4,290 leads at ₹14.5L investment (₹338 avg CPL)—if SQL conversion >25%, CAC remains viable for B2B growth targets'
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
    <div className="mb-6">
      {/* Chart Container with Integrated Key Insights */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {businessModel === 'ecommerce' ? 'Order vs Revenue Trends' : 'Leads vs Spend Trends'}
          </h3>
          <p className="text-sm text-gray-500">
            {businessModel === 'ecommerce' 
              ? 'Track order volume growth alongside revenue performance to understand AOV trends' 
              : 'Last 6 months performance comparison'}
          </p>
        </div>

        <div className="w-full" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height={320} minWidth={0}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: mainMetricLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: '#6b7280' }
                }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: secondaryMetricLabel, 
                  angle: 90, 
                  position: 'insideRight',
                  style: { fontSize: 12, fill: '#6b7280' }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey={mainMetricKey} 
                stroke={mainMetricColor}
                strokeWidth={3}
                dot={{ fill: mainMetricColor, r: 5 }}
                activeDot={{ r: 7 }}
                name={mainMetricLabel}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={secondaryMetricKey} 
                stroke={secondaryMetricColor}
                strokeWidth={3}
                dot={{ fill: secondaryMetricColor, r: 5 }}
                activeDot={{ r: 7 }}
                name={secondaryMetricLabel}
                strokeDasharray="5 5"
              />
            </ComposedChart>
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
                    flex items-start gap-2 p-3 rounded-lg border
                    ${getInsightStyles(insight.type)}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${getIconColor(insight.type)}`} />
                  <p className="text-sm leading-snug">
                    {insight.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}