import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  Eye,
  Printer,
  Package,
} from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import { Button } from '@shared/ui/Button';
import { Pagination } from '@shared/ui/Pagination';
import { toast } from '@shared/ui/Toast';
import { ordersService } from '@shared/api/orders.service';
import { settingsService } from '@shared/api/settings.service';
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  AdminOrderMetrics,
} from '@shared/types/order';
import { formatPrice } from '@shared/utils/currency';

import OrderMetricsCards from '../components/orders/OrderMetricsCards';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer';
import OrderInvoiceModal from '../components/orders/OrderInvoiceModal';

export const OrdersPage: React.FC = () => {
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminOrderMetrics>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingCount: 0,
    processingCount: 0,
    shippedCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
  });

  // Store Currency State
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Order for Drawer / Invoice
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Load Currency settings
  useEffect(() => {
    settingsService
      .getPublicSettings()
      .then((settings) => {
        if (settings?.currencySymbol) {
          setCurrencySymbol(settings.currencySymbol);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ordersService.getAdminOrders({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
        paymentMethod: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
      });

      setOrders(res.orders || []);
      setTotal(res.total || 0);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch {
      toast.error('Failed to load customer orders');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, paymentStatusFilter, paymentMethodFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Export orders handler
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      const res = await ordersService.exportAdminOrders(format);
      const blob =
        format === 'csv'
          ? new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
          : new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported orders as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export orders');
    } finally {
      setIsExporting(false);
    }
  };

  // Open drawer
  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Open invoice
  const handleOpenInvoice = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceOpen(true);
  };

  // Callback on order updated from drawer
  const handleOrderUpdated = (updatedOrder: Order) => {
    setSelectedOrder(updatedOrder);
    setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    // Also refresh metrics
    ordersService.getAdminMetrics().then(setMetrics).catch(() => {});
  };

  // Order status badge visual helper
  const getStatusBadge = (status: OrderStatus) => {
    const map = {
      CONFIRMED: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
      PROCESSING: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
      PACKED: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
      SHIPPED: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
      OUT_FOR_DELIVERY: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
      DELIVERED: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      CANCELLED: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
      PENDING: { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
    }[status] || { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };

    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${map.bg} ${map.text} ${map.border}`}>
        {status}
      </span>
    );
  };

  // Payment badge helper
  const getPaymentBadge = (status: PaymentStatus) => {
    const map = {
      PAID: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      PENDING: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
      REFUNDED: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
      FAILED: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    }[status] || { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };

    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${map.bg} ${map.text} ${map.border}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Page Header */}
      <PageHeader
        title="Orders & Sales"
        count={total}
        description="Fulfill customer orders, assign courier tracking numbers, issue invoices, and manage shipment statuses."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* 2. Top KPI Metric Cards */}
      <OrderMetricsCards metrics={metrics} currencySymbol={currencySymbol} />

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order #, customer name, email, or tracking #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-400 focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 focus:border-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Payment: All</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 focus:border-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Method: All</option>
              <option value="COD">Cash on Delivery</option>
              <option value="ONLINE">Online Payment</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs (Horizontal) */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-2.5 no-scrollbar">
          {(
            [
              { id: 'ALL', label: 'All Orders', count: metrics.totalOrders },
              { id: 'CONFIRMED', label: 'Confirmed', count: metrics.pendingCount },
              { id: 'PROCESSING', label: 'Processing', count: metrics.processingCount },
              { id: 'SHIPPED', label: 'Shipped', count: metrics.shippedCount },
              { id: 'DELIVERED', label: 'Delivered', count: metrics.deliveredCount },
              { id: 'CANCELLED', label: 'Cancelled', count: metrics.cancelledCount },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                    : 'bg-white text-slate-600 border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-indigo-200/60 text-indigo-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Orders Data Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-md bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Orders Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL' || paymentStatusFilter !== 'ALL'
                ? 'No customer orders match your current filter criteria. Try resetting filters.'
                : 'Customer orders placed on the storefront will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Courier / Tracking</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order Number */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(o)}
                        className="hover:underline cursor-pointer text-left font-bold"
                      >
                        {o.orderNumber}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      <span className="block text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{o.customerName}</div>
                      <div className="text-[11px] text-slate-400">{o.customerEmail}</div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">
                        {(o.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)} items
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[130px]">
                        {o.items?.[0]?.name}
                        {(o.items?.length || 0) > 1 ? ` +${o.items.length - 1} more` : ''}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 font-bold font-mono text-slate-900 whitespace-nowrap">
                      {formatPrice(o.grandTotal, { currencySymbol })}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        {getPaymentBadge(o.paymentStatus)}
                        <span className="block text-[10px] text-slate-400">
                          {o.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}
                        </span>
                      </div>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(o.orderStatus)}
                    </td>

                    {/* Courier / Tracking */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {o.courierName ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">{o.courierName}</span>
                          <span className="text-[10px] font-mono text-sky-600 font-bold block">
                            {o.trackingNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleOpenDrawer(o)}
                          leftIcon={<Eye className="w-3 h-3" />}
                        >
                          View
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(o)}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {total > 0 && (
          <div className="p-3 border-t border-slate-200">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </div>

      {/* 6. Order Details Slide-over Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOrderUpdated={handleOrderUpdated}
        onOpenInvoice={(o) => {
          setIsDrawerOpen(false);
          handleOpenInvoice(o);
        }}
        currencySymbol={currencySymbol}
      />

      {/* 7. Printable Invoice Modal */}
      <OrderInvoiceModal
        order={selectedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};

export default OrdersPage;
