import React from 'react';
import { MessageSquare, Clock, CheckCircle2, Star } from 'lucide-react';
import type { AdminReviewStats } from '@shared/types/review';

interface Props {
  stats: AdminReviewStats | null;
  loading: boolean;
}

export const ReviewMetricsCards: React.FC<Props> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Reviews',
      value: stats?.totalReviews ?? 0,
      subtext: 'Lifetime customer feedbacks',
      icon: MessageSquare,
      colorText: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Pending Moderation',
      value: stats?.pendingReviews ?? 0,
      subtext: (stats?.pendingReviews ?? 0) > 0 ? 'Requires attention' : 'Queue cleared',
      icon: Clock,
      colorText: (stats?.pendingReviews ?? 0) > 0 ? 'text-amber-600' : 'text-slate-600',
      badgeBg: (stats?.pendingReviews ?? 0) > 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100',
    },
    {
      title: 'Approved & Public',
      value: stats?.approvedReviews ?? 0,
      subtext: `${stats?.rejectedReviews ?? 0} rejected submissions`,
      icon: CheckCircle2,
      colorText: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Average Store Rating',
      value: stats?.averageRating ? `${stats.averageRating.toFixed(1)} / 5.0` : '0.0 / 5.0',
      subtext: 'Across all verified ratings',
      icon: Star,
      colorText: 'text-amber-500',
      badgeBg: 'bg-amber-50 border-amber-100',
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
                    {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
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
