import React from 'react';
import { ShoppingBag, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import type { AdminOrderMetrics } from '@shared/types/order';
import { formatPrice } from '@shared/utils/currency';

interface OrderMetricsCardsProps {
  metrics: AdminOrderMetrics;
  currencySymbol?: string;
}

export const OrderMetricsCards: React.FC<OrderMetricsCardsProps> = ({
  metrics,
  currencySymbol = '$',
}) => {
  const inFulfillmentCount = metrics.pendingCount + metrics.processingCount + metrics.shippedCount;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Orders */}
      <div className="p-4 rounded-md bg-white border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Orders
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {metrics.totalOrders.toLocaleString()}
          </span>
        </div>
        <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Total Gross Sales */}
      <div className="p-4 rounded-md bg-white border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Gross Sales
          </span>
          <span className="text-xl font-bold text-emerald-600 font-mono mt-1 block">
            {formatPrice(metrics.totalRevenue, { currencySymbol, decimalPlaces: 2 })}
          </span>
        </div>
        <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* 3. In Fulfillment */}
      <div className="p-4 rounded-md bg-white border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            In Fulfillment
          </span>
          <span className="text-xl font-bold text-amber-600 mt-1 block">
            {inFulfillmentCount.toLocaleString()}
          </span>
        </div>
        <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Delivered Orders */}
      <div className="p-4 rounded-md bg-white border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Completed / Delivered
          </span>
          <span className="text-xl font-bold text-sky-600 mt-1 block">
            {metrics.deliveredCount.toLocaleString()}
          </span>
        </div>
        <div className="w-9 h-9 rounded-md bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default OrderMetricsCards;
