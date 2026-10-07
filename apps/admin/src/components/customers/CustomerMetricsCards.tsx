import React from 'react';
import { Users, UserCheck, ShoppingCart, DollarSign } from 'lucide-react';
import type { AdminCustomerStats } from '@shared/types/customer';
import { formatPrice } from '@shared/utils/currency';

interface Props {
  stats: AdminCustomerStats | null;
  loading: boolean;
  currencySymbol?: string;
}

export const CustomerMetricsCards: React.FC<Props> = ({
  stats,
  loading,
  currencySymbol = '$',
}) => {
  const cards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      subtext: 'Registered store accounts',
      icon: Users,
      colorText: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Active Shoppers',
      value: stats?.activeCustomers ?? 0,
      subtext: `${stats?.suspendedCustomers ?? 0} suspended accounts`,
      icon: UserCheck,
      colorText: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Buyers with Orders',
      value: stats?.customersWithOrders ?? 0,
      subtext: 'Placed 1+ store orders',
      icon: ShoppingCart,
      colorText: 'text-sky-600',
      badgeBg: 'bg-sky-50 border-sky-100',
    },
    {
      title: 'Total Customer Spend',
      value: formatPrice(stats?.totalCustomerSpend ?? 0, { currencySymbol }),
      subtext: 'Lifetime customer gross value',
      icon: DollarSign,
      colorText: 'text-amber-600',
      badgeBg: 'bg-amber-50 border-amber-100',
      isPrice: true,
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
                  <span className={`text-2xl font-bold tracking-tight ${c.colorText} ${c.isPrice ? 'font-mono' : ''}`}>
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
