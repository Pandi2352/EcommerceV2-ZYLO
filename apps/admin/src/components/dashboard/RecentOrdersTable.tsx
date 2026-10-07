import React from 'react';
import { ShoppingBag, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { formatPrice } from '@shared/utils/currency';
import type { DashboardRecentOrder } from '@shared/types/analytics';

interface Props {
  orders: DashboardRecentOrder[];
  currencySymbol: string;
  loading: boolean;
}

export const RecentOrdersTable: React.FC<Props> = ({
  orders,
  currencySymbol,
  loading,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PROCESSING':
      case 'PACKED':
      case 'CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700';
      case 'REFUNDED':
        return 'bg-slate-100 text-slate-700';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Customer Orders</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest 10 order transactions placed across your store
          </p>
        </div>
        <Link
          to={ROUTES.ORDERS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Order #</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Items</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Fulfillment</th>
              <th className="py-2.5 px-3">Payment</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading recent orders...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No orders placed yet</p>
                  <p className="text-xs text-slate-400">New customer orders will appear here in real-time.</p>
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {o.customerName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {o.customerEmail}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {o.itemsCount} item{o.itemsCount !== 1 ? 's' : ''}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatPrice(o.grandTotal, { currencySymbol })}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(
                        o.orderStatus,
                      )}`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${getPaymentBadge(
                        o.paymentStatus,
                      )}`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <Link
                      to={ROUTES.ORDERS}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      title="View Order Details"
                    >
                      <Eye className="w-3 h-3 text-slate-600" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
