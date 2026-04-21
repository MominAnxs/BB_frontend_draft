import svgPaths from "../imports/svg-sa7sej66k4";

interface BregoLogoProps {
  size?: number;
  className?: string;
  /** 
   * 'full' = circle bg + white icon (use on white/light backgrounds)
   * 'icon' = white icon only, no circle (use when container already has blue bg)
   * 'blue-icon' = blue icon only, no circle (use on white bg without container)
   */
  variant?: 'full' | 'icon' | 'blue-icon';
}

export function BregoLogo({ size = 40, className = '', variant = 'full' }: BregoLogoProps) {
  const iconFill = variant === 'blue-icon' ? '#204CC7' : 'white';

  if (variant === 'icon' || variant === 'blue-icon') {
    // Render only the inner shuttlecock paths (no circle background)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 42 42"
        fill="none"
        className={className}
      >
        <path d={svgPaths.p3563000} fill={iconFill} />
        <path d={svgPaths.p226fe980} fill={iconFill} />
        <path d={svgPaths.p2e462480} fill={iconFill} />
        <path d={svgPaths.p36211980} fill={iconFill} />
        <path d={svgPaths.p1e8d5d00} fill={iconFill} />
        <path d={svgPaths.p28022a00} fill={iconFill} />
        <path d={svgPaths.p8aa5f80} fill={iconFill} />
        <path d={svgPaths.p12f8ce00} fill={iconFill} />
      </svg>
    );
  }

  // Full logo with blue circle background
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      className={className}
    >
      <path d={svgPaths.p99cfc00} fill="#204CC7" />
      <path d={svgPaths.p3563000} fill="white" />
      <path d={svgPaths.p226fe980} fill="white" />
      <path d={svgPaths.p2e462480} fill="white" />
      <path d={svgPaths.p36211980} fill="white" />
      <path d={svgPaths.p1e8d5d00} fill="white" />
      <path d={svgPaths.p28022a00} fill="white" />
      <path d={svgPaths.p8aa5f80} fill="white" />
      <path d={svgPaths.p12f8ce00} fill="white" />
    </svg>
  );
}
