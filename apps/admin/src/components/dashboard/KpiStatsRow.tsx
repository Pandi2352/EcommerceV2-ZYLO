import React from 'react';
import { DollarSign, ShoppingBag, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';

interface KpiCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean | null; // true = green, false = red, null = neutral
  linkText: string;
  linkTo: string;
  icon: typeof DollarSign;
  iconBg: string;
}

const KPI_METRICS: KpiCardData[] = [
  {
    id: 'earnings',
    title: 'TOTAL EARNINGS',
    value: '$559.25k',
    change: '+16.24 %',
    isPositive: true,
    linkText: 'View net earnings',
    linkTo: ROUTES.DASHBOARDS_ANALYTICS,
    icon: DollarSign,
    iconBg: 'bg-[#0ab39c] text-white',
  },
  {
    id: 'orders',
    title: 'ORDERS',
    value: '36,894',
    change: '-3.57 %',
    isPositive: false,
    linkText: 'View all orders',
    linkTo: ROUTES.ORDERS,
    icon: ShoppingBag,
    iconBg: 'bg-[#299cdb] text-white',
  },
  {
    id: 'customers',
    title: 'CUSTOMERS',
    value: '183.35M',
    change: '+29.08 %',
    isPositive: true,
    linkText: 'See details',
    linkTo: ROUTES.CUSTOMERS,
    icon: Users,
    iconBg: 'bg-[#f7b84b] text-white',
  },
  {
    id: 'balance',
    title: 'MY BALANCE',
    value: '$165.89k',
    change: '+0.00 %',
    isPositive: null,
    linkText: 'Withdraw money',
    linkTo: ROUTES.SETTINGS,
    icon: Wallet,
    iconBg: 'bg-[#f06548] text-white',
  },
];

export const KpiStatsRow: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 select-none">
      {KPI_METRICS.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-white border border-slate-200 rounded-md p-4 transition-colors hover:border-slate-300"
          >
            {/* Top Row: Title & Percentage Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 ${
                  kpi.isPositive === true
                    ? 'text-emerald-600 bg-emerald-50'
                    : kpi.isPositive === false
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-500 bg-slate-50'
                }`}
              >
                {kpi.isPositive === true && '↗ '}
                {kpi.isPositive === false && '↘ '}
                {kpi.change}
              </span>
            </div>

            {/* Middle Row: Large Value + Icon Badge */}
            <div className="mt-3.5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {kpi.value}
              </h3>
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${kpi.iconBg}`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* Bottom Row: Detail Action Link */}
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <Link
                to={kpi.linkTo}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 underline transition-colors"
              >
                {kpi.linkText}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiStatsRow;
