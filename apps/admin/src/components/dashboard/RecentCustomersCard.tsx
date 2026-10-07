import React from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { formatPrice } from '@shared/utils/currency';
import type { DashboardRecentCustomer } from '@shared/types/analytics';

interface Props {
  customers: DashboardRecentCustomer[];
  currencySymbol: string;
  loading: boolean;
}

export const RecentCustomersCard: React.FC<Props> = ({
  customers,
  currencySymbol,
  loading,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recently Joined Customers
          </h3>
          <p className="text-[11px] text-slate-400">
            Latest store shoppers registered on your portal
          </p>
        </div>

        <Link
          to={ROUTES.CUSTOMERS}
          className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="mt-3.5 divide-y divide-slate-100">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Loading customer accounts...
          </div>
        ) : customers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Users className="w-8 h-8 text-slate-200 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-700">No customers registered yet</p>
          </div>
        ) : (
          customers.slice(0, 5).map((cust) => (
            <div key={cust._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                  {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{cust.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{cust.email}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-900 block font-mono">
                  {cust.totalOrders > 0
                    ? formatPrice(cust.lifetimeSpend, { currencySymbol })
                    : 'No orders yet'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {cust.totalOrders} order{cust.totalOrders !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentCustomersCard;
