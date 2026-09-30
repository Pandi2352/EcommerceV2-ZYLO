import React from 'react';

export interface CornerDotsProps {
  className?: string;
}

/**
 * CornerDots: Subtle, modern decorative dot matrix clusters
 * positioned strictly at the Top-Left and Bottom-Right corners.
 */
export const CornerDots: React.FC<CornerDotsProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none ${className}`}
    >
      {/* Top-Left Corner Dot Grid */}
      <div className="absolute -top-6 -left-6 w-72 h-72 opacity-35">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="corner-dots-tl"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3" cy="3" r="1.5" fill="#94A3B8" />
            </pattern>
            <radialGradient id="fade-tl" cx="0%" cy="0%" r="85%" fx="0%" fy="0%">
              <stop offset="0%" stopColor="white" />
              <stop offset="65%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="mask-tl">
              <rect width="280" height="280" fill="url(#fade-tl)" />
            </mask>
          </defs>
          <rect width="280" height="280" fill="url(#corner-dots-tl)" mask="url(#mask-tl)" />
        </svg>
      </div>

      {/* Bottom-Right Corner Dot Grid */}
      <div className="absolute -bottom-6 -right-6 w-72 h-72 opacity-35">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="corner-dots-br"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3" cy="3" r="1.5" fill="#94A3B8" />
            </pattern>
            <radialGradient id="fade-br" cx="100%" cy="100%" r="85%" fx="100%" fy="100%">
              <stop offset="0%" stopColor="white" />
              <stop offset="65%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="mask-br">
              <rect width="280" height="280" fill="url(#fade-br)" />
            </mask>
          </defs>
          <rect width="280" height="280" fill="url(#corner-dots-br)" mask="url(#mask-br)" />
        </svg>
      </div>
    </div>
  );
};

export default CornerDots;
