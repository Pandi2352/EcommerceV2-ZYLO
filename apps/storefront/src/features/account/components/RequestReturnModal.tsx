import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import type { Order } from '@shared/types/order';
import {
  ReturnReason,
  RETURN_REASON_LABELS,
} from '@shared/types/return';
import { returnsService } from '@shared/api/returns.service';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { useSettings } from '../../../features/settings/context/SettingsContext';

interface RequestReturnModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestReturnModal: React.FC<RequestReturnModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { formatPrice } = useSettings();

  // Selected items mapping: orderItemId -> quantity to return
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(() => {
    // Default select first item
    if (order.items && order.items.length > 0) {
      const firstId = order.items[0]._id || order.items[0].id || '';
      return { [firstId]: 1 };
    }
    return {};
  });

  const [reason, setReason] = useState<ReturnReason>(ReturnReason.DAMAGED_ITEM);
  const [customerNote, setCustomerNote] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = 1;
      }
      return next;
    });
  };

  const handleQuantityChange = (itemId: string, qty: number, maxQty: number) => {
    const validQty = Math.max(1, Math.min(maxQty, qty));
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: validQty,
    }));
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = newImageUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setProofImages((prev) => [...prev, url]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Sample quick photo templates for user convenience
  const handleAddSampleProof = () => {
    const sample = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600';
    if (!proofImages.includes(sample)) {
      setProofImages((prev) => [...prev, sample]);
    }
  };

  // Calculate estimated refund total
  const estimatedRefund = Object.entries(selectedItems).reduce((sum, [itemId, qty]) => {
    const item = order.items.find(
      (i) => (i._id || i.id) === itemId,
    );
    if (!item) return sum;
    return sum + item.unitPrice * qty;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const returnItemsPayload = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([orderItemId, quantity]) => ({
        orderItemId,
        quantity,
      }));

    if (returnItemsPayload.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    try {
      setIsSubmitting(true);
      await returnsService.createReturnRequest({
        orderId: order._id,
        items: returnItemsPayload,
        reason,
        customerNote: customerNote.trim(),
        proofImages,
      });

      toast.success('Return request submitted successfully! Our support team will review it.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 max-w-xl w-full my-8 p-6 shadow-xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 rounded text-amber-600">
                <RotateCcw className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Request Return / Refund
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Order #{order.orderNumber} · Delivered on{' '}
              {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Step 1: Select Items */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. Select Item(s) to Return
            </label>
            <div className="space-y-2 border border-slate-200 rounded-md p-2 bg-slate-50/50">
              {order.items.map((item) => {
                const itemId = item._id || item.id || '';
                const isChecked = Boolean(selectedItems[itemId]);
                const selectedQty = selectedItems[itemId] || 1;

                return (
                  <div
                    key={itemId}
                    className={`flex items-center justify-between p-2.5 rounded-md border transition-all ${
                      isChecked
                        ? 'border-amber-400 bg-amber-50/40'
                        : 'border-slate-200 bg-white opacity-80'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleItem(itemId)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <img
                        src={item.image || 'https://placehold.co/100?text=Product'}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatPrice(item.unitPrice)} each · Ordered: {item.quantity}
                        </p>
                      </div>
                    </label>

                    {/* Quantity Picker if checked */}
                    {isChecked && (
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[11px] font-medium text-slate-500">Qty:</span>
                        <select
                          value={selectedQty}
                          onChange={(e) =>
                            handleQuantityChange(itemId, parseInt(e.target.value, 10), item.quantity)
                          }
                          className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium focus:border-amber-500 focus:outline-none"
                        >
                          {Array.from({ length: item.quantity }, (_, i) => i + 1).map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Reason for Return */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Reason for Return
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReturnReason)}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:border-amber-500 bg-white font-medium"
            >
              {Object.entries(RETURN_REASON_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Explanation / Customer Note */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Details / Comments
            </label>
            <textarea
              rows={3}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Describe the issue with the item (e.g. damaged on arrival, defective part, wrong color)..."
              className="w-full text-xs p-3 border border-slate-300 rounded-md focus:outline-none focus:border-amber-500 bg-white resize-none"
            />
          </div>

          {/* Step 4: Proof Photos Upload / Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Proof Photos (Recommended)
              </label>
              <button
                type="button"
                onClick={handleAddSampleProof}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
              >
                + Add sample proof photo
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste proof photo image URL (https://...)"
                className="flex-1 text-xs py-1.5 px-3 border border-slate-300 rounded-md focus:outline-none focus:border-amber-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImageUrl}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Photo
              </Button>
            </div>

            {proofImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 border border-slate-200 rounded-md p-2 bg-slate-50">
                {proofImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded overflow-hidden aspect-square border border-slate-200 bg-white">
                    <img
                      src={img}
                      alt={`Proof ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-md p-3.5 flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 rounded text-amber-700 mt-0.5">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-xs text-amber-900 flex-1">
              <div className="flex justify-between items-center font-bold">
                <span>Estimated Refund Amount:</span>
                <span className="text-sm font-black text-amber-700">
                  {formatPrice(estimatedRefund)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700 leading-relaxed">
                Upon inspection and approval, the amount will be refunded directly to your original payment method. Inventory will be automatically restored.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || Object.keys(selectedItems).length === 0}
              isLoading={isSubmitting}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Submit Return Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
