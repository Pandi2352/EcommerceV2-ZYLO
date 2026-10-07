import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { formatPrice } from '@shared/utils/currency';
import type { InventorySummaryMetrics } from '@shared/types/inventory';

interface Props {
  metrics: InventorySummaryMetrics | null;
  currencySymbol: string;
  loading: boolean;
}

export const InventoryMetricsCards: React.FC<Props> = ({
  metrics,
  currencySymbol,
  loading,
}) => {
  const cards = [
    {
      title: 'Total Stock Units',
      value: metrics ? metrics.totalStockUnits.toLocaleString() : '0',
      subtext: `${metrics?.totalProducts ?? 0} active catalog products`,
      icon: Package,
      colorText: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Healthy Stock',
      value: metrics ? metrics.inStockCount.toLocaleString() : '0',
      subtext: 'Above reorder threshold',
      icon: CheckCircle2,
      colorText: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Low Stock Items',
      value: metrics ? metrics.lowStockCount.toLocaleString() : '0',
      subtext: 'At or below alert threshold',
      icon: AlertTriangle,
      colorText: 'text-amber-600',
      badgeBg: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'Out of Stock',
      value: metrics ? metrics.outOfStockCount.toLocaleString() : '0',
      subtext: 'Requires immediate replenishment',
      icon: XCircle,
      colorText: 'text-rose-600',
      badgeBg: 'bg-rose-50 border-rose-100',
    },
    {
      title: 'Total Inventory Valuation',
      value: metrics ? formatPrice(metrics.totalValuation, { currencySymbol }) : '$0.00',
      subtext: 'Cost basis of current units',
      icon: DollarSign,
      colorText: 'text-purple-600',
      badgeBg: 'bg-purple-50 border-purple-100',
      isPrice: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 select-none">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-md p-4 flex items-center justify-between transition-colors hover:border-slate-300"
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {c.title}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                {loading ? (
                  <div className="h-7 w-20 bg-slate-100 animate-pulse rounded-md" />
                ) : (
                  <span
                    className={`text-xl font-bold tracking-tight ${c.colorText} ${
                      c.isPrice ? 'font-mono' : ''
                    }`}
                  >
                    {c.value}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{c.subtext}</p>
            </div>
            <div className={`p-2 rounded-md border ${c.badgeBg}`}>
              <Icon className={`w-4 h-4 ${c.colorText}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryMetricsCards;
