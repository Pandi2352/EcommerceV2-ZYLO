import React from 'react';
import { Truck, Zap, Gift, CheckCircle2, Sparkles } from 'lucide-react';
import { useSettings } from '../../settings/context/SettingsContext';

interface FreeShippingProgressBarProps {
  subtotal: number;
  className?: string;
}

export const FreeShippingProgressBar: React.FC<FreeShippingProgressBarProps> = ({
  subtotal,
  className = '',
}) => {
  const { formatPrice } = useSettings();

  // Tier Milestones
  const TIERS = [
    { threshold: 50, label: 'Free Shipping', icon: Truck },
    { threshold: 100, label: 'Express Delivery', icon: Zap },
    { threshold: 150, label: 'Mystery Gift', icon: Gift },
  ];

  const maxThreshold = TIERS[TIERS.length - 1].threshold;
  const progressPercent = Math.min(100, Math.round((subtotal / maxThreshold) * 100));

  // Determine current active milestone target
  const nextTier = TIERS.find((t) => subtotal < t.threshold);
  const allUnlocked = !nextTier;

  return (
    <div className={`p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border-b border-amber-200/40 select-none ${className}`}>
      {/* Dynamic Motivational Header */}
      <div className="flex items-center justify-between text-xs mb-2">
        {allUnlocked ? (
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>VIP Status! All Free Shipping & Perks Unlocked!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
            {nextTier?.threshold === 50 ? (
              <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : nextTier?.threshold === 100 ? (
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span>
              Add <strong className="text-amber-700 font-bold">{formatPrice(+(nextTier.threshold - subtotal).toFixed(2))}</strong> more to unlock <strong className="text-slate-900">{nextTier.label}</strong>!
            </span>
          </div>
        )}
        <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative w-full bg-slate-200/90 rounded-full h-2 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Tier Badges */}
      <div className="grid grid-cols-3 gap-1 mt-2.5 pt-1 text-center">
        {TIERS.map((tier) => {
          const unlocked = subtotal >= tier.threshold;
          const Icon = tier.icon;
          return (
            <div
              key={tier.threshold}
              className={`flex flex-col items-center p-1 rounded-md transition-all ${
                unlocked
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800'
                  : 'bg-white/60 border border-slate-200/70 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1">
                {unlocked ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : (
                  <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <span className="text-[10px] font-bold">
                  {formatPrice(tier.threshold)}
                </span>
              </div>
              <span className="text-[9px] font-medium leading-none mt-0.5 truncate w-full">
                {tier.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FreeShippingProgressBar;
