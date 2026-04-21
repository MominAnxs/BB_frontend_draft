import { TrendingUp, TrendingDown, Target, CheckCircle2, AlertCircle } from 'lucide-react';

interface TargetVsAchievedData {
  label: string;
  achieved: number;
  target: number;
  unit: 'currency' | 'number' | 'multiplier';
}

interface TargetVsAchievedWidgetProps {
  data: TargetVsAchievedData;
}

export function TargetVsAchievedWidget({ data }: TargetVsAchievedWidgetProps) {
  const { label, achieved, target, unit } = data;
  
  // Calculate percentage of achievement
  const percentage = Math.min((achieved / target) * 100, 100);
  const isOverAchieved = achieved > target;
  const isOnTrack = percentage >= 90 && percentage <= 110;
  const isUnderAchieved = percentage < 90;
  
  // Determine status color and gradients
  let statusColor = '#10b981';
  let statusGradient = 'from-emerald-500 to-green-600';
  let bgGradient = 'from-white to-green-50/30';
  let ringGradient = 'url(#greenGradient)';
  let statusText = 'On Track';
  let statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
  
  if (isOverAchieved) {
    statusColor = '#059669';
    statusGradient = 'from-emerald-500 to-green-600';
    bgGradient = 'from-white to-green-50/30';
    ringGradient = 'url(#greenGradient)';
    statusText = 'Exceeded';
    statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
  } else if (isUnderAchieved) {
    statusColor = '#ef4444';
    statusGradient = 'from-red-500 to-orange-500';
    bgGradient = 'from-white to-red-50/30';
    ringGradient = 'url(#redGradient)';
    statusText = 'Below Target';
    statusIcon = <AlertCircle className="w-3.5 h-3.5" />;
  }
  
  // Format value based on unit
  const formatValue = (value: number) => {
    if (unit === 'currency') {
      if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(1)}Cr`;
      } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
      }
      return `₹${(value / 1000).toFixed(0)}K`;
    } else if (unit === 'multiplier') {
      return `${value.toFixed(2)}x`;
    }
    return value.toLocaleString('en-IN');
  };
  
  // SVG Circle Progress - Reduced size
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={`group relative bg-gradient-to-br ${bgGradient} backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100/40 to-transparent rounded-full blur-2xl -z-10"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">{label}</h3>
        <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold bg-gradient-to-r ${statusGradient} text-white shadow-sm`}>
          {statusIcon}
          <span>{statusText}</span>
        </div>
      </div>
      
      {/* Circular Progress Ring - Compact */}
      <div className="flex items-center justify-center mb-3">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Define gradients */}
            <defs>
              <linearGradient id={`greenGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id={`redGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
              className="opacity-30"
            />
            
            {/* Progress circle with gradient */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isUnderAchieved ? `url(#redGradient-${label})` : `url(#greenGradient-${label})`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {percentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Values Section - Compact */}
      <div className="space-y-2">
        {/* Achieved & Target in one row */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Achieved</span>
          <span className="font-bold text-gray-900">{formatValue(achieved)}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Target</span>
          <span className="font-semibold text-gray-700">{formatValue(target)}</span>
        </div>
        
        {/* Variance - Compact */}
        <div className={`flex items-center justify-between pt-2 border-t ${isOverAchieved ? 'border-green-200' : 'border-red-200'}`}>
          <span className="text-xs font-semibold text-gray-700">Variance</span>
          <div className="flex items-center gap-1">
            {isOverAchieved ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs font-bold ${isOverAchieved ? 'text-green-700' : 'text-red-700'}`}>
              {isOverAchieved ? '+' : ''}{formatValue(achieved - target)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TargetVsAchievedPanelProps {
  businessModel: 'ecommerce' | 'leadgen';
}

export function TargetVsAchievedPanel({ businessModel }: TargetVsAchievedPanelProps) {
  // Only show for ecommerce
  if (businessModel !== 'ecommerce') {
    return null;
  }
  
  const targets: TargetVsAchievedData[] = [
    {
      label: 'Ad Spend',
      achieved: 1620000,
      target: 1800000,
      unit: 'currency'
    },
    {
      label: 'Revenue',
      achieved: 2680000,
      target: 3600000,
      unit: 'currency'
    },
    {
      label: 'ROAS',
      achieved: 1.65,
      target: 2.50,
      unit: 'multiplier'
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Target vs Achieved</h2>
        <span className="text-xs text-gray-500">Current Month Performance</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {targets.map((target, index) => (
          <TargetVsAchievedWidget key={index} data={target} />
        ))}
      </div>
    </div>
  );
}