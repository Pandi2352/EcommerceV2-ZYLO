import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Mail,
  Phone,
  ExternalLink,
  Save,
  Ban,
} from 'lucide-react';
import type { Order, OrderStatus } from '@shared/types/order';
import { Drawer } from '@shared/ui/Drawer';
import { Button } from '@shared/ui/Button';
import InputField from '@shared/ui/InputField';
import { toast } from '@shared/ui/Toast';
import { ordersService } from '@shared/api/orders.service';
import { formatPrice } from '@shared/utils/currency';

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
  onOpenInvoice: (order: Order) => void;
  currencySymbol?: string;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
  onOpenInvoice,
  currencySymbol = '$',
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  // Courier state
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  // Cancellation state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Sync inputs on open
  React.useEffect(() => {
    if (order) {
      setCourierName(order.courierName || '');
      setTrackingNumber(order.trackingNumber || '');
      setTrackingUrl(order.trackingUrl || '');
      setStatusNote('');
      setCancelReason('');
      setIsCancelModalOpen(false);
    }
  }, [order]);

  if (!order) return null;

  // Copy address helper
  const handleCopyAddress = () => {
    const text = `${order.customerName}\n${order.shippingAddress.street}\n${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}\n${order.shippingAddress.country}\nPhone: ${order.shippingAddress.phone}`;
    navigator.clipboard.writeText(text);
    toast.success('Shipping address copied to clipboard');
  };

  // Status progression
  const handleStatusChange = async (nextStatus: OrderStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await ordersService.updateAdminOrderStatus(order._id, {
        status: nextStatus,
        note: statusNote.trim() || undefined,
      });
      toast.success(res.message || `Order marked as ${nextStatus}`);
      onOrderUpdated(res.order);
      setStatusNote('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save tracking
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim() || !trackingNumber.trim()) {
      toast.error('Please enter both courier name and tracking number');
      return;
    }
    try {
      setIsSavingTracking(true);
      const res = await ordersService.updateAdminOrderTracking(order._id, {
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim() || undefined,
        status: order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PROCESSING' ? 'SHIPPED' : undefined,
      });
      toast.success(res.message || 'Tracking information saved');
      onOrderUpdated(res.order);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update tracking');
    } finally {
      setIsSavingTracking(false);
    }
  };

  // Payment status toggle
  const handlePaymentStatusChange = async (paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED') => {
    try {
      const res = await ordersService.updateAdminOrderPayment(order._id, {
        paymentStatus,
      });
      toast.success(res.message || `Payment marked as ${paymentStatus}`);
      onOrderUpdated(res.order);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update payment status');
    }
  };

  // Cancel order
  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      const res = await ordersService.cancelAdminOrder(order._id, cancelReason.trim() || 'Cancelled by staff');
      toast.success(res.message || 'Order cancelled and inventory restored');
      onOrderUpdated(res.order);
      setIsCancelModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  // Status badge config
  const statusConfig = {
    CONFIRMED: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    PROCESSING: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    PACKED: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    SHIPPED: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
    OUT_FOR_DELIVERY: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
    DELIVERED: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    CANCELLED: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    PENDING: { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
  }[order.orderStatus] || { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-base font-bold text-slate-900">
            {order.orderNumber}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
            {order.orderStatus}
          </span>
        </div>
      }
      description={`Placed on ${new Date(order.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`}
      headerExtra={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenInvoice(order)}
          leftIcon={<Printer className="w-3.5 h-3.5" />}
        >
          Invoice
        </Button>
      }
    >
      <div className="space-y-5 text-xs text-slate-800">
        {/* 1. Fulfillment Workflow Progression Stepper Card */}
        {order.orderStatus !== 'CANCELLED' && (
          <div className="p-4 rounded-md bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Fulfillment Workflow Stepper
              </span>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {order.orderStatus === 'CONFIRMED' && (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isUpdatingStatus}
                  onClick={() => handleStatusChange('PROCESSING')}
                  leftIcon={<Package className="w-3.5 h-3.5" />}
                >
                  Start Processing & Packing
                </Button>
              )}

              {order.orderStatus === 'PROCESSING' && (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isUpdatingStatus}
                  onClick={() => handleStatusChange('SHIPPED')}
                  leftIcon={<Truck className="w-3.5 h-3.5" />}
                >
                  Mark as Shipped
                </Button>
              )}

              {(order.orderStatus === 'SHIPPED' || order.orderStatus === 'OUT_FOR_DELIVERY') && (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isUpdatingStatus}
                  onClick={() => handleStatusChange('DELIVERED')}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirm Customer Delivery
                </Button>
              )}

              {order.orderStatus === 'DELIVERED' && (
                <div className="text-emerald-700 font-bold flex items-center gap-1.5 py-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Order is fully delivered and completed</span>
                </div>
              )}
            </div>

            {/* Note input for next status update */}
            {order.orderStatus !== 'DELIVERED' && (
              <div className="pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Add optional note for status log (e.g. Handed to pickup driver)..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-400 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* 2. Customer & Shipping Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Customer Card */}
          <div className="p-4 rounded-md bg-white border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Info
            </span>
            <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
            <div className="space-y-1 text-slate-600">
              <a
                href={`mailto:${order.customerEmail}`}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{order.customerEmail}</span>
              </a>
              {order.shippingAddress.phone && (
                <a
                  href={`tel:${order.shippingAddress.phone}`}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{order.shippingAddress.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="p-4 rounded-md bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Shipping Destination
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer text-[11px]"
                title="Copy Address"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
        </div>

        {/* 3. Courier & Shipping Tracking */}
        <form onSubmit={handleSaveTracking} className="p-4 rounded-md bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-600" />
              <span>Courier & Tracking Assignment</span>
            </span>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold text-xs"
              >
                <span>Track on Carrier</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Courier / Carrier"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g. FedEx, BlueDart, DHL"
              fieldSize="sm"
            />
            <InputField
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TRK-89218941"
              fieldSize="sm"
              className="font-mono"
            />
            <div className="sm:col-span-2">
              <InputField
                label="Tracking Link URL (Optional)"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://carrier.com/track?id=..."
                fieldSize="sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              isLoading={isSavingTracking}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Tracking Details
            </Button>
          </div>
        </form>

        {/* 4. Payment Management Card */}
        <div className="p-4 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Payment Method & Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-slate-900 text-xs">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : order.paymentStatus === 'REFUNDED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.paymentStatus !== 'PAID' && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => handlePaymentStatusChange('PAID')}
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                Mark as Paid
              </Button>
            )}
            {order.paymentStatus === 'PAID' && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => handlePaymentStatusChange('REFUNDED')}
                className="text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Mark as Refunded
              </Button>
            )}
          </div>
        </div>

        {/* 5. Purchased Items List */}
        <div className="p-4 rounded-md bg-white border border-slate-200 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Purchased Line Items ({order.items.length})
          </span>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-md bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.variantTitle && <span className="mr-2">Variant: {item.variantTitle}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 font-mono">
                    {formatPrice(item.lineTotal, { currencySymbol })}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {formatPrice(item.unitPrice, { currencySymbol })} each
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatPrice(order.subtotal, { currencySymbol })}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({order.appliedCoupon || 'Promo'}):</span>
                <span className="font-mono">-{formatPrice(order.discount, { currencySymbol })}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee:</span>
              <span className="font-mono">{formatPrice(order.shippingFee, { currencySymbol })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax / GST:</span>
              <span className="font-mono">{formatPrice(order.tax, { currencySymbol })}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
              <span>Grand Total:</span>
              <span className="font-mono text-indigo-700 font-extrabold">
                {formatPrice(order.grandTotal, { currencySymbol })}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Status History Timeline */}
        <div className="p-4 rounded-md bg-white border border-slate-200 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Status Audit Timeline ({order.statusHistory.length})
          </span>

          <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {order.statusHistory.map((hist, i) => (
              <div key={i} className="flex items-start gap-3 relative pl-6">
                <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-50 border border-indigo-400 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{hist.status}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(hist.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {hist.note && <p className="text-[11px] text-slate-500 mt-0.5">{hist.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Sub-Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white border border-slate-200 rounded-md p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Order {order.orderNumber}?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cancelling this order will automatically restore reserved stock to inventory and mark any paid funds for refund.
            </p>
            <input
              type="text"
              placeholder="Reason for cancellation (e.g. Out of stock, customer requested)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-200 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(false)}
              >
                Keep Order
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isCancelling}
                onClick={handleConfirmCancel}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default OrderDetailsDrawer;
