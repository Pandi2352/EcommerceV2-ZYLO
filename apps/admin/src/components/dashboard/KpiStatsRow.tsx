import React from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { formatPrice } from '@shared/utils/currency';
import type { DashboardSummaryResponse } from '@shared/types/analytics';

interface Props {
  kpis: DashboardSummaryResponse['kpis'] | null;
  currencySymbol: string;
  loading: boolean;
}

export const KpiStatsRow: React.FC<Props> = ({ kpis, currencySymbol, loading }) => {
  const cards = [
    {
      id: 'revenue',
      title: 'TOTAL GROSS REVENUE',
      value: kpis ? formatPrice(kpis.revenue.value, { currencySymbol }) : '$0.00',
      periodText: kpis ? `${formatPrice(kpis.revenue.periodValue, { currencySymbol })} in period` : '',
      growth: kpis?.revenue.changePercentage ?? null,
      isPositive: kpis?.revenue.isPositive ?? null,
      linkText: 'View sales orders',
      linkTo: ROUTES.ORDERS,
      icon: DollarSign,
      colorText: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 border-indigo-100',
    },
    {
      id: 'orders',
      title: 'TOTAL ORDERS',
      value: kpis ? kpis.orders.value.toLocaleString() : '0',
      periodText: kpis ? `${kpis.orders.periodValue.toLocaleString()} in period` : '',
      growth: kpis?.orders.changePercentage ?? null,
      isPositive: kpis?.orders.isPositive ?? null,
      linkText: 'Manage customer orders',
      linkTo: ROUTES.ORDERS,
      icon: ShoppingBag,
      colorText: 'text-sky-600',
      badgeBg: 'bg-sky-50 border-sky-100',
    },
    {
      id: 'customers',
      title: 'CUSTOMERS DIRECTORY',
      value: kpis ? kpis.customers.value.toLocaleString() : '0',
      periodText: kpis ? `${kpis.customers.periodValue.toLocaleString()} new in period` : '',
      growth: kpis?.customers.changePercentage ?? null,
      isPositive: kpis?.customers.isPositive ?? null,
      linkText: 'View customer accounts',
      linkTo: ROUTES.CUSTOMERS,
      icon: Users,
      colorText: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      id: 'products',
      title: 'PUBLISHED PRODUCTS',
      value: kpis ? kpis.products.value.toLocaleString() : '0',
      periodText: kpis ? `${kpis.products.totalCatalog} total items in catalog` : '',
      growth: null,
      isPositive: null,
      linkText: 'Manage store catalog',
      linkTo: ROUTES.PRODUCTS,
      icon: Package,
      colorText: 'text-amber-600',
      badgeBg: 'bg-amber-50 border-amber-100',
    },
    {
      id: 'aov',
      title: 'AVG ORDER VALUE (AOV)',
      value: kpis ? formatPrice(kpis.aov.value || kpis.aov.totalAov, { currencySymbol }) : '$0.00',
      periodText: 'Avg spend per transaction',
      growth: null,
      isPositive: null,
      linkText: 'Explore order metrics',
      linkTo: ROUTES.ORDERS,
      icon: Layers,
      colorText: 'text-purple-600',
      badgeBg: 'bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-between transition-colors hover:border-slate-300"
          >
            {/* Header: Title + Icon */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div className={`p-2 rounded-md border ${card.badgeBg}`}>
                  <Icon className={`w-4 h-4 ${card.colorText}`} />
                </div>
              </div>

              {/* Metric Value */}
              <div className="mt-2.5">
                {loading ? (
                  <div className="h-7 w-24 bg-slate-100 animate-pulse rounded-md" />
                ) : (
                  <h3 className={`text-xl font-bold tracking-tight text-slate-900 ${card.id === 'revenue' || card.id === 'aov' ? 'font-mono' : ''}`}>
                    {card.value}
                  </h3>
                )}
              </div>

              {/* Subtext & Growth Pill */}
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                {card.growth !== null && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      card.isPositive === true
                        ? 'bg-emerald-50 text-emerald-700'
                        : card.isPositive === false
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {card.isPositive === true && <TrendingUp className="w-2.5 h-2.5" />}
                    {card.isPositive === false && <TrendingDown className="w-2.5 h-2.5" />}
                    {card.growth > 0 ? `+${card.growth}%` : `${card.growth}%`}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 truncate">{card.periodText}</span>
              </div>
            </div>

            {/* Bottom Nav Link */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to={card.linkTo}
                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                {card.linkText}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiStatsRow;
