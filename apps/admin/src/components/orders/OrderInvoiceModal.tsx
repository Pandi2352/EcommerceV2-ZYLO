import React, { useRef } from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import type { Order } from '@shared/types/order';
import { Button } from '@shared/ui/Button';
import { formatPrice } from '@shared/utils/currency';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  currencySymbol = '$',
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar (hidden on print) */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              Tax Invoice & Packing Slip — {order.orderNumber}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Invoice
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close invoice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div ref={printableRef} className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* 1. Invoice Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black tracking-tight text-slate-900">ZYLO</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                  COMMERCE
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Zylo Global Retail Inc.<br />
                5171 W Campbell Ave, San Jose, CA 95124<br />
                support@zylo.com | +1 800 900 2956
              </p>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-slate-900 block font-mono">
                INVOICE #{order.orderNumber}
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Date: {formattedDate}</span>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment: {order.paymentStatus} ({order.paymentMethod})</span>
              </div>
            </div>
          </div>

          {/* 2. Customer & Shipping Addresses */}
          <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-slate-900 text-sm mb-1">{order.customerName}</p>
              <p className="text-slate-600 leading-relaxed text-xs">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}<br />
                <span className="text-slate-500">Phone:</span> {order.shippingAddress.phone || 'N/A'}<br />
                <span className="text-slate-500">Email:</span> {order.customerEmail}
              </p>
            </div>

            <div className="text-right sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Fulfillment Details:
              </span>
              <p className="text-slate-600 leading-relaxed text-xs">
                <strong className="text-slate-800">Fulfillment Status:</strong> {order.orderStatus}<br />
                <strong className="text-slate-800">Delivery Method:</strong> {order.deliveryMethod} Delivery<br />
                <strong className="text-slate-800">Courier:</strong> {order.courierName || 'Standard Dispatch'}<br />
                <strong className="text-slate-800">Tracking Number:</strong> {order.trackingNumber || 'Pending'}<br />
                {order.notes && (
                  <span className="block mt-1 text-slate-500 italic">
                    Note: {order.notes}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 3. Items Table */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Item & Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.variantTitle && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Variant: {item.variantTitle}
                        </div>
                      )}
                      {item.variantSku && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.variantSku}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatPrice(item.unitPrice, { currencySymbol })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                      {formatPrice(item.lineTotal, { currencySymbol })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Calculations Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{formatPrice(order.subtotal, { currencySymbol })}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount:</span>
                  <span className="font-mono font-medium">-{formatPrice(order.discount, { currencySymbol })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee:</span>
                <span className="font-mono font-medium">{formatPrice(order.shippingFee, { currencySymbol })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (GST):</span>
                <span className="font-mono font-medium">{formatPrice(order.tax, { currencySymbol })}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-700 font-extrabold">
                  {formatPrice(order.grandTotal, { currencySymbol })}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Terms / Return Policy Footer */}
          <div className="border-t border-slate-200 pt-6 text-[10px] text-slate-400 text-center leading-relaxed">
            Thank you for shopping with ZYLO Commerce. For questions, warranty claims, or returns, please contact{' '}
            <span className="text-slate-600 font-medium">support@zylo.com</span> with order #{order.orderNumber}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;
