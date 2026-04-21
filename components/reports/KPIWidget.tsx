import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPIData {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  status: 'good' | 'warning' | 'bad' | 'neutral';
  format: 'currency' | 'percentage' | 'number' | 'text';
}

interface KPIWidgetProps {
  data: KPIData;
}

export function KPIWidget({ data }: KPIWidgetProps) {
  const statusColors = {
    good: {
      icon: 'text-green-600',
      text: 'text-green-600'
    },
    warning: {
      icon: 'text-yellow-600',
      text: 'text-yellow-600'
    },
    bad: {
      icon: 'text-red-600',
      text: 'text-red-600'
    },
    neutral: {
      icon: 'text-gray-500',
      text: 'text-gray-500'
    }
  } as const;

  const colors = statusColors[data.status] || statusColors.good; // Add fallback to 'good'

  const renderTrendIcon = () => {
    if (data.delta > 0) {
      return <TrendingUp className={`w-3.5 h-3.5 ${colors.icon}`} />;
    } else if (data.delta < 0) {
      return <TrendingDown className={`w-3.5 h-3.5 ${colors.icon}`} />;
    } else {
      return <Minus className={`w-3.5 h-3.5 ${colors.icon}`} />;
    }
  };

  const formatDelta = () => {
    const sign = data.delta > 0 ? '+' : '';
    return `${sign}${data.delta}%`;
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-all">
      {/* Label */}
      <p className="text-sm font-medium text-gray-600 mb-3">{data.label}</p>

      {/* Main Value */}
      <p className="text-2xl font-bold text-gray-900 mb-2">{data.value}</p>

      {/* Delta Change - Simple inline */}
      <div className="flex items-center gap-1.5">
        {renderTrendIcon()}
        <span className={`text-sm font-semibold ${colors.text}`}>
          {formatDelta()}
        </span>
        <span className="text-xs text-gray-500">
          {data.deltaLabel}
        </span>
      </div>
    </div>
  );
}