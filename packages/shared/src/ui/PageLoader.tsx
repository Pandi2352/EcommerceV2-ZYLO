import React from 'react';

export interface PageLoaderProps {
  /**
   * 'mascot': Exact animated vector bot inspired by the reference UI with antenna, visor, and bouncing navy dots
   * '3d': Uses the newly generated 3D high-res ZYLO robot mascot artwork
   */
  variant?: 'mascot' | '3d';
  /**
   * Scale size of the loader
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional loading caption text
   */
  text?: string | boolean;
  /**
   * Whether to display as an absolute/fixed full-page overlay or inline container
   */
  fullScreen?: boolean;
  /**
   * Custom additional container classes
   */
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  variant = 'mascot',
  size = 'md',
  text,
  fullScreen = true,
  className = '',
}) => {
  // Dimensions map
  const sizeMap = {
    sm: {
      botWidth: 54,
      botHeight: 46,
      dotSize: 'w-2.5 h-2.5',
      imageSize: 'w-16 h-16',
      textSize: 'text-xs',
      spacing: 'space-y-3',
    },
    md: {
      botWidth: 78,
      botHeight: 66,
      dotSize: 'w-3.5 h-3.5',
      imageSize: 'w-24 h-24',
      textSize: 'text-sm',
      spacing: 'space-y-4',
    },
    lg: {
      botWidth: 104,
      botHeight: 88,
      dotSize: 'w-4 h-4',
      imageSize: 'w-32 h-32',
      textSize: 'text-base',
      spacing: 'space-y-5',
    },
  };

  const current = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center ${current.spacing} select-none ${className}`}>
      {/* Animated Keyframes CSS */}
      <style>{`
        @keyframes zyloFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-9px);
          }
        }
        @keyframes zyloShadowScale {
          0%, 100% {
            transform: scale(1);
            opacity: 0.25;
          }
          50% {
            transform: scale(0.75);
            opacity: 0.12;
          }
        }
        @keyframes zyloDotBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes zyloAntennaGlow {
          0%, 100% {
            opacity: 0.8;
            filter: drop-shadow(0 0 2px rgba(249, 115, 22, 0.4));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.9));
          }
        }
        .animate-zylo-float {
          animation: zyloFloat 2.2s ease-in-out infinite;
        }
        .animate-zylo-shadow {
          animation: zyloShadowScale 2.2s ease-in-out infinite;
        }
        .animate-zylo-dot-1 {
          animation: zyloDotBounce 1.1s ease-in-out infinite;
          animation-delay: 0s;
        }
        .animate-zylo-dot-2 {
          animation: zyloDotBounce 1.1s ease-in-out infinite;
          animation-delay: 0.22s;
        }
        .animate-zylo-dot-3 {
          animation: zyloDotBounce 1.1s ease-in-out infinite;
          animation-delay: 0.44s;
        }
        .animate-zylo-antenna {
          animation: zyloAntennaGlow 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Mascot / Icon Container */}
      <div className="relative flex flex-col items-center">
        {variant === 'mascot' ? (
          /* Vector Animated Zylo Mascot matching the user's reference UI */
          <div className="animate-zylo-float">
            <svg
              width={current.botWidth}
              height={current.botHeight}
              viewBox="0 0 100 84"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              {/* Left Antenna */}
              <line x1="38" y1="20" x2="33" y2="8" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
              <circle cx="32" cy="7" r="4.5" fill="#38BDF8" className="animate-zylo-antenna" />
              <circle cx="32" cy="7" r="2.5" fill="#FB923C" />

              {/* Right Antenna */}
              <line x1="62" y1="20" x2="67" y2="8" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
              <circle cx="68" cy="7" r="4.5" fill="#38BDF8" className="animate-zylo-antenna" />
              <circle cx="68" cy="7" r="2.5" fill="#FB923C" />

              {/* Side Ears / Headphone Cushions */}
              <rect x="14" y="36" width="7" height="18" rx="3.5" fill="#38BDF8" />
              <rect x="79" y="36" width="7" height="18" rx="3.5" fill="#38BDF8" />

              {/* Main Robot Head (Cyan/Blue) */}
              <ellipse cx="50" cy="44" rx="33" ry="24" fill="#38BDF8" />

              {/* Head Gradient highlight for 3D depth */}
              <ellipse cx="50" cy="38" rx="27" ry="17" fill="#7DD3FC" opacity="0.4" />

              {/* Face Visor Plate (Orange/Amber) */}
              <rect x="29" y="35" width="42" height="19" rx="9" fill="#FB923C" />

              {/* Eyes */}
              <ellipse cx="40" cy="44" rx="2.5" ry="3" fill="#1E293B" />
              <ellipse cx="60" cy="44" rx="2.5" ry="3" fill="#1E293B" />

              {/* Friendly Smile */}
              <path
                d="M46 47 C48 50, 52 50, 54 47"
                stroke="#1E293B"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Neck Base / Collar */}
              <path
                d="M40 68 C40 68, 44 73, 50 73 C56 73, 60 68, 60 68"
                stroke="#FB923C"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          /* 3D Generated Mascot Artwork with Floating Animation */
          <div className="animate-zylo-float">
            <img
              src="/zylo-loader.jpg"
              alt="ZYLO Loading"
              className={`${current.imageSize} object-contain rounded-2xl drop-shadow-md`}
            />
          </div>
        )}

        {/* Soft Ground Shadow pulsating in sync */}
        <div className="w-10 h-2 bg-slate-400 rounded-full animate-zylo-shadow mt-1 blur-[1px]" />
      </div>

      {/* Animated Bouncing Navy Dots (exact match to reference screenshot) */}
      <div className="flex items-center gap-3 pt-2">
        <span className={`${current.dotSize} rounded-full bg-[#2A3B5C] animate-zylo-dot-1`} />
        <span className={`${current.dotSize} rounded-full bg-[#2A3B5C] animate-zylo-dot-2`} />
        <span className={`${current.dotSize} rounded-full bg-[#2A3B5C] animate-zylo-dot-3`} />
      </div>

      {/* Optional Brand Text / Status */}
      {text && (
        <div className="flex flex-col items-center pt-1">
          <span className={`font-bold tracking-tight text-slate-700 ${current.textSize}`}>
            {typeof text === 'string' ? text : 'ZYLO'}
          </span>
          <span className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">
            Loading storefront...
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9FAFB]/90 backdrop-blur-xs transition-opacity duration-300">
        {content}
      </div>
    );
  }

  return content;
};

export default PageLoader;
