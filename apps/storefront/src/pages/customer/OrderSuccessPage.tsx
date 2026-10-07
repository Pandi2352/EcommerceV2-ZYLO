import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Copy,
  Calendar,
  Home,
  CreditCard,
  Banknote,
  Loader2,
  Check,
} from 'lucide-react';
import { ordersService } from '@shared/api/orders.service';
import type { Order } from '@shared/types/order';
import { ROUTES } from '../../routes/routePaths';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    ordersService
      .getOrder(orderNumber)
      .then((res) => setOrder(res.order))
      .catch((err) => console.error('Failed to load order confirmation:', err))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const handleCopyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success('Order number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-slate-500 font-medium">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  const deliveryDateFormatted = order?.estimatedDeliveryDate
    ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : 'In 3–5 business days';

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 text-center shadow-none">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 stroke-[2]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Thank you for shopping with ZYLO. We have sent confirmation details and tracking updates to{' '}
            <strong className="text-slate-800">{order?.customerEmail}</strong>.
          </p>

          {/* Order Number Badge */}
          <div className="mt-6 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 py-2 px-4 rounded-md">
            <span className="text-xs text-slate-500">Order Number:</span>
            <span className="text-xs font-mono font-bold text-slate-900 tracking-wider">
              {order?.orderNumber || orderNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
              title="Copy Order Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="bg-white border border-slate-200 rounded-md p-6 space-y-6 shadow-none">
            {/* 3-Col Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100 text-xs">
              <div className="flex items-start gap-3 p-3 rounded bg-slate-50">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated Delivery</span>
                  <span className="font-bold text-slate-900">{deliveryDateFormatted}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded bg-slate-50">
                <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Delivery Speed</span>
                  <span className="font-bold text-slate-900">
                    {order.deliveryMethod === 'EXPRESS' ? 'Express Priority' : 'Standard Delivery'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded bg-slate-50">
                {order.paymentMethod === 'COD' ? (
                  <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <CreditCard className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-slate-500 block text-[11px]">Payment Method</span>
                  <span className="font-bold text-slate-900">
                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="text-xs">
              <h2 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>Shipping Address</span>
              </h2>
              <p className="text-slate-600 leading-snug">
                {order.customerName} · {order.shippingAddress.street},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-slate-500 text-[11px] mt-0.5">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>

            {/* Purchased Items List */}
            <div>
              <h2 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Items Purchased ({order.items.length})</span>
              </h2>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden">
                {order.items.map((item) => (
                  <div key={item._id || item.id} className="p-3 flex items-center justify-between gap-3 text-xs bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded border border-slate-200 p-1 bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="font-medium text-slate-900 hover:text-amber-600 truncate block transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.variantTitle && (
                          <span className="text-[11px] text-slate-400 block truncate">
                            Variant: {item.variantTitle}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ${item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
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
                  <span>Discount ({order.appliedCoupon || 'Promo'})</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Paid</span>
                <span className="text-lg font-black text-slate-900">${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link to={ROUTES.CUSTOMER.SHOP} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
              <Link to={ROUTES.CUSTOMER.HOME} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;
