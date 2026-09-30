import React from 'react';

export interface ZyloLogoProps {
  /**
   * 'full': Icon mark + ZYLO typography
   * 'mark': Icon mark only (for compact sidebars or mobile)
   */
  variant?: 'full' | 'mark';
  /**
   * Visual size of the emblem
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Color theme adaptation
   */
  theme?: 'light' | 'dark';
  /**
   * Optional badge / subtitle e.g. 'ADMIN', 'STORE'
   */
  badge?: string;
  /**
   * Additional custom class names
   */
  className?: string;
}

export const ZyloLogo: React.FC<ZyloLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'light',
  badge,
  className = '',
}) => {
  // Dimensions
  const sizeMap = {
    sm: { iconSize: 28, text: 'text-base', badgeText: 'text-[9px] px-1.5 py-0.2' },
    md: { iconSize: 36, text: 'text-xl', badgeText: 'text-[10px] px-2 py-0.5' },
    lg: { iconSize: 44, text: 'text-2xl', badgeText: 'text-xs px-2.5 py-0.5' },
    xl: { iconSize: 56, text: 'text-3xl', badgeText: 'text-xs px-3 py-1' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Emblem: Isometric Z Shopping Bag with Upward Growth Arrow */}
      <svg
        width={currentSize.iconSize}
        height={currentSize.iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="zylo-main-grad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="zylo-handle-grad" x1="24" y1="6" x2="40" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container Plate */}
        <rect width="64" height="64" rx="14" fill="#0F172A" />

        {/* Bag Handle */}
        <path
          d="M25 18 V13 C25 9.5 28 7 32 7 C36 7 39 9.5 39 13 V18"
          stroke="url(#zylo-handle-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Geometric Z Bag Body */}
        {/* Top shelf */}
        <path d="M17 19 H47 L41 27 H17 L17 19 Z" fill="url(#zylo-main-grad)" />

        {/* Diagonal forward arrow slash */}
        <path d="M17 40 L37 20 H47 L27 48 H17 V40 Z" fill="url(#zylo-main-grad)" opacity="0.95" />

        {/* Forward Arrow Fold */}
        <polygon points="36,19 47,19 47,30 42,26 40,24" fill="#22D3EE" />

        {/* Base foundation */}
        <path d="M23 40 H47 L42 48 H23 V40 Z" fill="url(#zylo-main-grad)" />
      </svg>

      {/* Wordmark Typography */}
      {variant === 'full' && (
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight leading-none ${currentSize.text} ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            ZYLO
          </span>

          {badge && (
            <span
              className={`font-semibold uppercase tracking-wider rounded-md border ${
                currentSize.badgeText
              } ${
                theme === 'dark'
                  ? 'bg-slate-800 text-cyan-400 border-slate-700'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default ZyloLogo;
