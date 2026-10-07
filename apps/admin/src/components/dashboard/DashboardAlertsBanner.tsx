import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import type { DashboardAlerts } from '@shared/types/analytics';

interface Props {
  alerts: DashboardAlerts | null;
  loading: boolean;
}

export const DashboardAlertsBanner: React.FC<Props> = ({ alerts, loading }) => {
  if (loading || !alerts) return null;

  const hasPendingFulfillment = alerts.pendingFulfillmentCount > 0;
  const hasLowStock = alerts.lowStockCount > 0 || alerts.outOfStockCount > 0;
  const hasRefunds = (alerts.pendingRefundsCount ?? 0) > 0;

  if (!hasPendingFulfillment && !hasLowStock && !hasRefunds) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {hasPendingFulfillment && (
        <div className="flex items-center justify-between p-3.5 rounded-md bg-amber-50/80 border border-amber-200/80 text-amber-900 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-md bg-amber-100/90 text-amber-700 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-950">
                {alerts.pendingFulfillmentCount} Order{alerts.pendingFulfillmentCount !== 1 ? 's' : ''} Awaiting Fulfillment
              </p>
              <p className="text-[11px] text-amber-700 truncate">
                {alerts.pendingOrdersCount} pending, {alerts.processingOrdersCount} in processing queue
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.ORDERS}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline shrink-0 ml-3"
          >
            <span>Fulfill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {hasLowStock && (
        <div className="flex items-center justify-between p-3.5 rounded-md bg-rose-50/80 border border-rose-200/80 text-rose-900 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-md bg-rose-100/90 text-rose-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-950">
                {alerts.lowStockCount + alerts.outOfStockCount} Inventory Alert{alerts.lowStockCount + alerts.outOfStockCount !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-rose-700 truncate">
                {alerts.outOfStockCount > 0 ? `${alerts.outOfStockCount} out of stock, ` : ''}
                {alerts.lowStockCount} items at or below reorder threshold
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:text-rose-950 hover:underline shrink-0 ml-3"
          >
            <span>Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {hasRefunds && (
        <div className="flex items-center justify-between p-3.5 rounded-md bg-purple-50/80 border border-purple-200/80 text-purple-900 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-md bg-purple-100/90 text-purple-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-purple-950">
                {alerts.pendingRefundsCount} Refund{alerts.pendingRefundsCount !== 1 ? 's' : ''} Logged
              </p>
              <p className="text-[11px] text-purple-700 truncate">
                Orders with refunded payments
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.ORDERS}
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-800 hover:text-purple-950 hover:underline shrink-0 ml-3"
          >
            <span>Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardAlertsBanner;
