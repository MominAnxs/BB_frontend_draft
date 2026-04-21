import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPIMetric {
  label: string;
  value: string;
  delta: number;
  status: 'green' | 'red' | 'yellow';
  prefix?: string;
  suffix?: string;
}

interface KPIWidgetsProps {
  businessModel: 'ecommerce' | 'leadgen';
  data?: {
    adSpend: number;
    revenue?: number;
    leads?: number;
    roas?: number;
    cpl?: number;
    cac?: number;
    ctr?: number;
    cpm?: number;
    spendVsPlanPercent: number;
    orders?: number;
    aov?: number;
    revenuePerVisitor?: number;
  };
}

export function KPIWidgets({ businessModel, data }: KPIWidgetsProps) {
  // Default data if not provided
  const defaultData = {
    adSpend: businessModel === 'ecommerce' ? 380000 : 275000,
    revenue: 1216000,
    leads: 845,
    roas: 3.2,
    cpl: 325,
    cac: 850,
    ctr: 2.8,
    cpm: 185,
    spendVsPlanPercent: 95,
    orders: 428,
    aov: 2841,
    revenuePerVisitor: 185
  };

  const metricsData = { ...defaultData, ...data };

  // Build metrics based on business model
  const metrics: KPIMetric[] = businessModel === 'ecommerce' 
    ? [
        {
          label: 'Ad Spend',
          value: `₹${(metricsData.adSpend / 1000).toFixed(0)}K`,
          delta: 12.5,
          status: 'yellow',
          prefix: '₹'
        },
        {
          label: 'Revenue',
          value: `₹${(metricsData.revenue! / 100000).toFixed(1)}L`,
          delta: 18.3,
          status: 'green',
          prefix: '₹'
        },
        {
          label: 'ROAS',
          value: `${metricsData.roas!.toFixed(1)}x`,
          delta: 5.2,
          status: 'green',
          suffix: 'x'
        },
        {
          label: 'Orders',
          value: metricsData.orders!.toString(),
          delta: 15.2,
          status: 'green'
        },
        {
          label: 'AOV',
          value: `₹${metricsData.aov?.toLocaleString('en-IN')}`,
          delta: 3.8,
          status: 'green',
          prefix: '₹'
        }
      ]
    : [
        {
          label: 'Ad Spend',
          value: `₹${(metricsData.adSpend / 1000).toFixed(0)}K`,
          delta: 8.3,
          status: 'yellow',
          prefix: '₹'
        },
        {
          label: 'Leads',
          value: metricsData.leads!.toString(),
          delta: 22.4,
          status: 'green'
        },
        {
          label: 'CPL',
          value: `₹${metricsData.cpl}`,
          delta: -12.5,
          status: 'green',
          prefix: '₹'
        },
        {
          label: 'CTR',
          value: `${metricsData.ctr?.toFixed(1) || '2.8'}%`,
          delta: 12.0,
          status: 'green',
          suffix: '%'
        },
        {
          label: 'CPM',
          value: `₹${metricsData.cpm || 185}`,
          delta: -6.2,
          status: 'green',
          prefix: '₹'
        }
      ];

  const getStatusColor = (status: 'green' | 'red' | 'yellow') => {
    switch (status) {
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-600';
    if (delta < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-3 h-3" />;
    if (delta < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`
            bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all duration-200
            ${getStatusColor(metric.status)}
          `}
        >
          {/* Label */}
          <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            {metric.label}
          </p>

          {/* Value */}
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900">
              {metric.value}
            </p>
          </div>

          {/* Delta Change */}
          <div className={`flex items-center gap-1 text-xs font-semibold ${getDeltaColor(metric.delta)}`}>
            {renderDeltaIcon(metric.delta)}
            <span>
              {Math.abs(metric.delta)}% vs last period
            </span>
          </div>

          {/* Status Indicator Dot */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`
              w-2 h-2 rounded-full
              ${metric.status === 'green' ? 'bg-green-500' : ''}
              ${metric.status === 'red' ? 'bg-red-500' : ''}
              ${metric.status === 'yellow' ? 'bg-yellow-500' : ''}
            `}></div>
            <span className="text-xs text-gray-500">
              {metric.status === 'green' ? 'On Track' : ''}
              {metric.status === 'red' ? 'Needs Attention' : ''}
              {metric.status === 'yellow' ? 'Monitor' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}