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
   * Multi-color stylish typography for the brand name (default: true)
   */
  multiColor?: boolean;
  /**
   * Optional badge / subtitle (e.g. 'STOREFRONT') - leave undefined if no badge wanted
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
  multiColor = true,
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
      {/* SVG Emblem: Dynamic Z Shopping Bag with White/Light Plate and Growth Arrow */}
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
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="zylo-handle-grad" x1="24" y1="6" x2="40" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="zylo-arrow-grad" x1="36" y1="18" x2="52" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>

        {/* Clean Light Background Container */}
        {theme === 'dark' ? (
          <>
            <rect width="64" height="64" rx="14" fill="#1E293B" />
            <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.25" stroke="#334155" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <rect width="64" height="64" rx="14" fill="#FFFFFF" />
            <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.25" stroke="#E2E8F0" strokeWidth="1.5" />
          </>
        )}

        {/* Bag Handle */}
        <path
          d="M25 18 V12 C25 8.5 28 6 32 6 C36 6 39 8.5 39 12 V18"
          stroke="url(#zylo-handle-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Geometric Z Bag Body */}
        {/* Top shelf */}
        <path d="M17 19 H47 L41 27 H17 L17 19 Z" fill="url(#zylo-main-grad)" />

        {/* Diagonal forward arrow slash */}
        <path d="M17 42 L38 20 H48 L27 50 H17 V42 Z" fill="url(#zylo-main-grad)" />

        {/* Dynamic Forward Orange Arrow Accent */}
        <polygon points="38,18 52,18 52,32 46,26 42,23" fill="url(#zylo-arrow-grad)" />

        {/* Base foundation */}
        <path d="M23 42 H47 L42 50 H23 V42 Z" fill="url(#zylo-main-grad)" />
      </svg>

      {/* Wordmark Typography */}
      {variant === 'full' && (
        <div className="flex items-center gap-2">
          {multiColor ? (
            /* Stylish Multi-Color Brand Typography */
            <span
              className={`font-black tracking-tight leading-none ${currentSize.text} bg-gradient-to-r from-[#0284C7] via-[#2563EB] to-[#EA580C] bg-clip-text text-transparent drop-shadow-xs`}
            >
              ZYLO
            </span>
          ) : (
            <span
              className={`font-black tracking-tight leading-none ${currentSize.text} ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              ZYLO
            </span>
          )}

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
