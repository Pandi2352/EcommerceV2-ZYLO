import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  RotateCcw,
  Home,
  CreditCard,
  Banknote,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { ordersService } from '@shared/api/orders.service';
import type { Order } from '@shared/types/order';
import { OrderStatus } from '@shared/types/order';
import { ROUTES } from '../../routes/routePaths';
import AccountLayout from '../../features/account/components/AccountLayout';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { useCart } from '../../features/cart/context/CartContext';

export const CustomerOrderDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { addToCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a better price');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchOrder = async () => {
    if (!orderNumber) return;
    try {
      setLoading(true);
      const res = await ordersService.getOrder(orderNumber);
      setOrder(res.order);
    } catch (err: any) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setSubmittingCancel(true);
      await ordersService.cancelOrder(order._id, cancelReason);
      toast.success(`Order #${order.orderNumber} has been cancelled`);
      setIsCancelModalOpen(false);
      await fetchOrder();
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AccountLayout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-xs font-medium">Loading order tracking details...</span>
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout>
        <div className="py-16 text-center bg-white border border-slate-200 rounded-md p-6">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Order Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">
            Could not retrieve details for Order #{orderNumber}.
          </p>
          <Link to={ROUTES.CUSTOMER.ORDERS}>
            <Button variant="primary" size="sm">
              Back to My Orders
            </Button>
          </Link>
        </div>
      </AccountLayout>
    );
  }

  const isCancelled = order.orderStatus === OrderStatus.CANCELLED;
  const canCancel =
    order.orderStatus === OrderStatus.CONFIRMED || order.orderStatus === OrderStatus.PENDING;

  // Milestone mapping
  const milestones = [
    {
      id: OrderStatus.CONFIRMED,
      label: 'Order Placed',
      description: 'Order confirmed and registered',
      icon: CheckCircle2,
    },
    {
      id: OrderStatus.PROCESSING,
      label: 'Processing / Packed',
      description: 'Items packaged at fulfillment center',
      icon: Package,
    },
    {
      id: OrderStatus.SHIPPED,
      label: 'Shipped',
      description: 'In transit with delivery carrier',
      icon: Truck,
    },
    {
      id: OrderStatus.OUT_FOR_DELIVERY,
      label: 'Out for Delivery',
      description: 'Courier out for final destination drop-off',
      icon: Clock,
    },
    {
      id: OrderStatus.DELIVERED,
      label: 'Delivered',
      description: 'Package delivered to address',
      icon: Home,
    },
  ];

  // Resolve current active step index (0 to 4)
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
      case OrderStatus.PENDING:
        return 0;
      case OrderStatus.PROCESSING:
      case OrderStatus.PACKED:
        return 1;
      case OrderStatus.SHIPPED:
        return 2;
      case OrderStatus.OUT_FOR_DELIVERY:
        return 3;
      case OrderStatus.DELIVERED:
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.orderStatus);

  const formattedOrderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDeliveryDate = order.estimatedDeliveryDate
    ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : 'In 3–5 business days';

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <Link
              to={ROUTES.CUSTOMER.ORDERS}
              className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold mb-2 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back to all orders</span>
            </Link>
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-mono">
                Order #{order.orderNumber}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Placed on {formattedOrderDate}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Receipt
            </Button>

            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Visual Tracking Progress Timeline */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delivery Status</h3>
              <p className="text-xs text-slate-500">
                {isCancelled
                  ? 'This order has been cancelled.'
                  : `Estimated Delivery: ${formattedDeliveryDate}`}
              </p>
            </div>
            {isCancelled ? (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Cancelled
              </span>
            ) : order.orderStatus === OrderStatus.DELIVERED ? (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Delivered
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> In Progress
              </span>
            )}
          </div>

          {/* Cancelled Alert Banner */}
          {isCancelled ? (
            <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Order was cancelled on {new Date(order.cancelledAt || order.updatedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-[11px] text-rose-700 pl-6">
                Reason: {order.cancellationReason || 'Cancelled by customer'}
              </p>
            </div>
          ) : (
            /* Amazon-style 5-Step Visual Timeline */
            <div className="relative pt-2 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {milestones.map((milestone, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const MilestoneIcon = milestone.icon;

                  return (
                    <div key={milestone.id} className="relative flex flex-col items-center text-center group">
                      {/* Connector Line for Desktop */}
                      {idx < milestones.length - 1 && (
                        <div
                          className={`hidden md:block absolute top-4 left-1/2 w-full h-[2.5px] z-0 transition-colors ${
                            idx < currentStepIndex ? 'bg-amber-500' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      {/* Icon Circle */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all ${
                          isCompleted
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        <MilestoneIcon className="w-4 h-4 stroke-[2.5]" />
                      </div>

                      {/* Label & Description */}
                      <div className="mt-2 text-xs">
                        <span
                          className={`block font-bold leading-tight ${
                            isCurrent
                              ? 'text-amber-800 font-extrabold'
                              : isCompleted
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {milestone.label}
                        </span>
                        <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5 leading-snug">
                          {milestone.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Details */}
          <div className="bg-white border border-slate-200 rounded-md p-5 text-xs shadow-none space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Home className="w-4 h-4 text-slate-500" />
              <span>Delivery Information</span>
            </h3>
            <p className="text-slate-700 font-semibold">{order.customerName}</p>
            <p className="text-slate-600 leading-snug">{order.shippingAddress.street}</p>
            <p className="text-slate-600 leading-snug">
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-slate-500 flex items-center gap-1.5 pt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{order.shippingAddress.phone}</span>
              </p>
            )}
            <div className="pt-2 text-[11px] text-slate-500">
              <span>Speed: </span>
              <strong className="text-slate-800">
                {order.deliveryMethod === 'EXPRESS' ? 'Express Air (1–2 Days)' : 'Standard Ground (3–5 Days)'}
              </strong>
            </div>
          </div>

          {/* Payment & Billing Details */}
          <div className="bg-white border border-slate-200 rounded-md p-5 text-xs shadow-none space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              {order.paymentMethod === 'COD' ? (
                <Banknote className="w-4 h-4 text-emerald-600" />
              ) : (
                <CreditCard className="w-4 h-4 text-indigo-600" />
              )}
              <span>Payment Details</span>
            </h3>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold text-slate-900">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Paid Online'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Payment Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700'
                    : order.paymentStatus === 'REFUNDED'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Security Guarantee:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Buyer Protected
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Order Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Purchased Items ({order.items.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item) => (
              <div key={item._id || item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain rounded border border-slate-200 p-1 bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.variantTitle && (
                      <p className="text-[11px] text-slate-400">{item.variantTitle}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Qty: {item.quantity} · ${item.unitPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-bold text-slate-900 text-sm">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBuyAgain(item)}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Buy Again</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {order.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${order.shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-base font-black text-slate-900">
                  ${order.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-100">
            <div className="bg-white rounded-md border border-slate-200 max-w-md w-full p-6 shadow-none space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Cancel Order #{order.orderNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Cancelling this order will release all items back into stock and void your transaction.
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
                  onClick={() => setIsCancelModalOpen(false)}
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

export default CustomerOrderDetailPage;
