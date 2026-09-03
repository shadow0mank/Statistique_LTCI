interface LottoBallProps {
  number: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emerald' | 'amber' | 'cyan' | 'neutral' | 'auto';
  label?: string;
  isHot?: boolean;
  score?: number;
  onClick?: () => void;
  className?: string;
  key?: any;
}

export default function LottoBall({
  number,
  size = 'md',
  variant = 'auto',
  label,
  isHot,
  score,
  onClick,
  className = '',
}: LottoBallProps) {
  // Determine variant automatically if 'auto'
  const resolvedVariant = (() => {
    if (variant !== 'auto') return variant;
    if (isHot || (score && score >= 90) || number === 27 || number === 12) return 'amber';
    if (score && score < 50) return 'cyan';
    return 'emerald';
  })();

  const sizeClasses = {
    xs: 'w-7 h-7 text-[11px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm md:text-base',
    lg: 'w-14 h-14 text-lg sm:text-xl',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl',
  }[size];

  const variantStyles = {
    emerald: {
      bg: 'bg-gradient-to-br from-[#6ffbbe] via-[#10b981] to-[#003824] text-[#002113]',
      shadow: 'shadow-[0_8px_20px_-4px_rgba(16,185,129,0.45),inset_2px_2px_4px_rgba(255,255,255,0.45)]',
    },
    amber: {
      bg: 'bg-gradient-to-br from-[#ffb690] via-[#ec6a06] to-[#552100] text-[#ffdbca]',
      shadow: 'shadow-[0_8px_22px_-4px_rgba(236,106,6,0.55),inset_2px_2px_4px_rgba(255,255,255,0.45)]',
    },
    cyan: {
      bg: 'bg-gradient-to-br from-[#c4e7ff] via-[#19aee8] to-[#00354a] text-[#001e2c]',
      shadow: 'shadow-[0_8px_20px_-4px_rgba(25,174,232,0.45),inset_2px_2px_4px_rgba(255,255,255,0.45)]',
    },
    neutral: {
      bg: 'bg-gradient-to-br from-[#2d3449] via-[#222a3d] to-[#131b2e] text-[#dae2fd]',
      shadow: 'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.2)]',
    },
  }[resolvedVariant];

  const formattedNum = number < 10 ? `0${number}` : `${number}`;

  return (
    <div className={`flex flex-col items-center group select-none ${className}`}>
      <div
        onClick={onClick}
        className={`relative rounded-full font-mono font-black tracking-tighter flex items-center justify-center transition-all duration-200 ${sizeClasses} ${variantStyles.bg} ${variantStyles.shadow} ${
          onClick ? 'cursor-pointer group-hover:scale-110 active:scale-95' : ''
        }`}
      >
        {/* Specular 3D highlight bulb */}
        <div
          className={`absolute rounded-full bg-white/45 blur-[0.6px] pointer-events-none ${
            size === 'xl'
              ? 'top-2.5 left-3 w-4 h-4'
              : size === 'lg'
              ? 'top-2 left-2.5 w-3 h-3'
              : size === 'md'
              ? 'top-1.5 left-2 w-2.5 h-2.5'
              : 'top-1 left-1.5 w-1.5 h-1.5'
          }`}
        />
        <span>{formattedNum}</span>
      </div>
      {label && (
        <span
          className={`mt-1.5 font-mono text-[10px] font-medium tracking-tight ${
            resolvedVariant === 'amber' ? 'text-[#ffb690] font-bold' : 'text-[#bbcabf]'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
