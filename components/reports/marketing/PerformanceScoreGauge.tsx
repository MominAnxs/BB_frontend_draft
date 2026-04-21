/**
 * PerformanceScoreGauge — Google-style SVG circular score gauge
 * Used across PageSpeed Insights touchpoints: OverviewDrawers, WebsiteDrawers, WebsiteModule
 */

interface PerformanceScoreGaugeProps {
  score: number;
  size?: number;       // outer diameter in px
  strokeWidth?: number;
  showLabel?: boolean; // show "/ 100" below score
}

export function PerformanceScoreGauge({
  score,
  size = 80,
  strokeWidth = 6,
  showLabel = false,
}: PerformanceScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const dashOffset = circumference - (progress / 100) * circumference;

  // Color thresholds matching Google PSI
  const getColor = (s: number) => {
    if (s >= 90) return { stroke: '#22c55e', text: 'text-green-600', bg: '#f0fdf4' }; // green
    if (s >= 50) return { stroke: '#f59e0b', text: 'text-amber-600', bg: '#fffbeb' }; // amber
    return { stroke: '#ef4444', text: 'text-red-600', bg: '#fef2f2' };                 // red
  };

  const color = getColor(score);
  const center = size / 2;
  const fontSize = size >= 72 ? (size * 0.35) : (size * 0.38);
  const subFontSize = size * 0.14;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={color.text} style={{ fontSize, fontWeight: 700, lineHeight: 1.1 }}>
          {score}
        </span>
        {showLabel && (
          <span className="text-gray-400" style={{ fontSize: subFontSize, fontWeight: 500, lineHeight: 1 }}>
            / 100
          </span>
        )}
      </div>
    </div>
  );
}
