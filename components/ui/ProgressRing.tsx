'use client';

/**
 * ProgressRing
 * ────────────
 * A single-layer circular progress indicator. Replaces the older
 * double-layered "pale bubble + tiny inner ring" pattern that was used in
 * the payment processing modals — this version scales the ring to fill the
 * footprint and centres the percentage cleanly inside it.
 *
 * Values are clamped to 0–100. If you render multiple rings on the same page
 * pass a unique `gradientId` per instance so their SVG gradients don't
 * collide (Chrome / Safari share defs across inline SVGs).
 */

interface ProgressRingProps {
  /** 0–100. Values outside this range are clamped. */
  value: number;
  /** Overall width/height in px. Default: 80. */
  size?: number;
  /** Stroke weight of track + progress arcs. Default: 3. */
  strokeWidth?: number;
  /** Custom centre label. Defaults to `${rounded(value)}%`. */
  label?: React.ReactNode;
  /** Unique id for the linearGradient. Collide-prone across multiple rings
   *  on the same route — pass a stable unique value when needed. */
  gradientId?: string;
  /** Extra className for the outer wrapper (useful for spacing / alignment). */
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 3,
  label,
  gradientId = 'progress-ring-gradient',
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (clamped / 100) * circumference;

  // Size the label proportionally so 72 / 80 / 96 px rings all stay legible.
  const labelFontSize = Math.round(size * 0.19);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block', transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="#eef2f6"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.2s ease' }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 600,
          fontSize: `${labelFontSize}px`,
          letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
          color: '#1d4ed8',
        }}
      >
        {label ?? `${Math.round(clamped)}%`}
      </div>
    </div>
  );
}
