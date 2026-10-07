import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react';
import { ordersService } from '@shared/api/orders.service';
import type { Order } from '@shared/types/order';
import { OrderStatus } from '@shared/types/order';
import { ROUTES } from '../../routes/routePaths';
import AccountLayout from '../../features/account/components/AccountLayout';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { useCart } from '../../features/cart/context/CartContext';
import { useSettings } from '../../features/settings/context/SettingsContext';

type FilterTab = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cancellation Modal state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Found a better price');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersService.getOrders({ limit: 50 });
      setOrders(res.orders || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      setSubmittingCancel(true);
      await ordersService.cancelOrder(cancellingOrder._id, cancelReason);
      toast.success(`Order #${cancellingOrder.orderNumber} has been cancelled`);
      setCancellingOrder(null);
      await fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel order');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleBuyAgain = async (item: any) => {
    await addToCart(
      {
        id: item.productId,
        _id: item.productId,
        name: item.name,
        slug: item.productSlug,
        basePrice: item.unitPrice,
        salePrice: item.unitPrice,
        thumbnailUrl: item.image,
        stockQuantity: 10,
        trackInventory: true,
      },
      item.variantSku,
      1,
    );
    toast.success(`Added "${item.name}" to cart`);
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // 1. Tab filter
    if (activeTab === 'ACTIVE') {
      if (
        order.orderStatus === OrderStatus.DELIVERED ||
        order.orderStatus === OrderStatus.CANCELLED
      ) {
        return false;
      }
    } else if (activeTab === 'DELIVERED') {
      if (order.orderStatus !== OrderStatus.DELIVERED) return false;
    } else if (activeTab === 'CANCELLED') {
      if (order.orderStatus !== OrderStatus.CANCELLED) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNumber && !matchItem) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Confirmed
          </span>
        );
      case OrderStatus.PROCESSING:
      case OrderStatus.PACKED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Package className="w-3 h-3" /> Processing
          </span>
        );
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3 h-3" /> In Transit
          </span>
        );
      case OrderStatus.DELIVERED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Orders & Tracking</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track packages, view receipts, and review past orders ({total} total)
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by order # or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2 pl-8 pr-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'ACTIVE', label: 'In Progress / Active' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`pb-3 relative transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-amber-600 font-bold border-b-2 border-amber-500'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs font-medium">Loading your orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-md p-6">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No orders found</h3>
            <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
              {searchQuery
                ? `No orders match "${searchQuery}". Try a different keyword.`
                : 'You have not placed any orders under this category yet.'}
            </p>
            <Link to={ROUTES.CUSTOMER.SHOP}>
              <Button variant="primary" size="sm">
                Explore Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              const canCancel =
                order.orderStatus === OrderStatus.CONFIRMED ||
                order.orderStatus === OrderStatus.PENDING;

              return (
                <div
                  key={order._id}
                  className="bg-white border border-slate-200 rounded-md overflow-hidden transition-all shadow-none"
                >
                  {/* Order Card Header */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Order Placed</span>
                        <span className="font-semibold text-slate-800">{orderDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Total Amount</span>
                        <span className="font-bold text-slate-900">{formatPrice(order.grandTotal)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Ship To</span>
                        <span className="font-medium text-slate-800 truncate max-w-[150px] block">
                          {order.customerName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-slate-400 text-[11px] block text-right">Order Number</span>
                        <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                      </div>
                      <div>{getStatusBadge(order.orderStatus)}</div>
                    </div>
                  </div>

                  {/* Order Card Body */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Items List */}
                    <div className="flex-1 space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id || item.id} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-contain rounded border border-slate-200 p-1 bg-white shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <Link
                              to={`/products/${item.productSlug}`}
                              className="font-semibold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            {item.variantTitle && (
                              <p className="text-[11px] text-slate-400">{item.variantTitle}</p>
                            )}
                            <p className="text-[11px] text-slate-500">
                              Qty: {item.quantity} · {formatPrice(item.unitPrice)} each
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBuyAgain(item)}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer hidden sm:flex items-center gap-1 shrink-0"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Buy Again</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Actions Right */}
                    <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/account/orders/${order.orderNumber}`)}
                        leftIcon={<Truck className="w-3.5 h-3.5" />}
                      >
                        Track Package
                      </Button>

                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancellingOrder(order)}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-100">
            <div className="bg-white rounded-md border border-slate-200 max-w-md w-full p-6 shadow-none space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Cancel Order Confirmation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to cancel Order{' '}
                <strong className="text-slate-900 font-mono">{cancellingOrder.orderNumber}</strong>?
                The reserved items will be returned to stock, and your order will be voided.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Found a better price">Found a better price</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Need to change shipping address">Need to change shipping address</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={submittingCancel}
                  onClick={() => setCancellingOrder(null)}
                >
                  Keep Order
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={submittingCancel}
                  isLoading={submittingCancel}
                  onClick={handleCancelOrder}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default CustomerOrdersPage;
