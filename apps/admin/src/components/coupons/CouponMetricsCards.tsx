import React from 'react';
import { Tag, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import type { CouponStats } from '@shared/types/coupon';

interface Props {
  stats: CouponStats | null;
  loading: boolean;
}

export const CouponMetricsCards: React.FC<Props> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Coupons',
      value: stats?.totalCoupons ?? 0,
      subtext: 'Created promo campaigns',
      icon: Tag,
      colorText: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Active Campaigns',
      value: stats?.activeCoupons ?? 0,
      subtext: 'Ready for storefront checkout',
      icon: CheckCircle2,
      colorText: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Total Redemptions',
      value: stats?.totalRedemptions ?? 0,
      subtext: 'Lifetime customer uses',
      icon: TrendingUp,
      colorText: 'text-amber-600',
      badgeBg: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'Inactive / Expired',
      value: (stats?.expiredCoupons ?? 0) + (stats?.inactiveCoupons ?? 0),
      subtext: `${stats?.expiredCoupons ?? 0} expired, ${stats?.inactiveCoupons ?? 0} paused`,
      icon: AlertCircle,
      colorText: 'text-rose-600',
      badgeBg: 'bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-md p-4 flex items-center justify-between transition-colors hover:border-slate-300"
          >
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{c.title}</p>
              <div className="mt-1 flex items-baseline gap-2">
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 animate-pulse rounded-md" />
                ) : (
                  <span className={`text-2xl font-bold tracking-tight ${c.colorText}`}>
                    {c.value.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{c.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-md border ${c.badgeBg}`}>
              <Icon className={`w-5 h-5 ${c.colorText}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
