import React from 'react';
import { cn } from '../utils/cn';

export interface KpiCardItem {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
}

export interface KpiMetricsGridProps {
  cards: KpiCardItem[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Reusable KPI count cards grid adhering to:
 * - Zero shadows (shadow-none)
 * - Uniform rounded-md
 * - Flat color icon presentation (react-icons/fc)
 * - Skeleton / loading fallback
 */
export const KpiMetricsGrid: React.FC<KpiMetricsGridProps> = ({
  cards,
  isLoading = false,
  columns = 4,
  className = '',
}) => {
  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 3
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={cn(`grid grid-cols-1 ${colClass} gap-4 mb-6`, className)}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-md p-4 shadow-none flex items-center justify-between transition-colors hover:border-slate-300"
        >
          <div className="min-w-0 pr-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {card.title}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {isLoading ? (
                <span className="inline-block w-12 h-6 bg-slate-100 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </h3>
            {card.subtext && (
              <p className="text-xs text-slate-500 mt-1 truncate">{card.subtext}</p>
            )}
          </div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiMetricsGrid;
