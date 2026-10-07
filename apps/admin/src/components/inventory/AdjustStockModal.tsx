import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, RotateCcw } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { inventoryService } from '@shared/api/inventory.service';
import type { AdminInventoryItem } from '@shared/types/inventory';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: AdminInventoryItem | null;
  onStockUpdated: () => void;
}

export const AdjustStockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  product,
  onStockUpdated,
}) => {
  const [type, setType] = useState<'INCREMENT' | 'DECREMENT' | 'SET'>('INCREMENT');
  const [quantity, setQuantity] = useState<number>(10);
  const [selectedVariantSku, setSelectedVariantSku] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [trackInventory, setTrackInventory] = useState<boolean>(true);
  const [allowBackorders, setAllowBackorders] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setType('INCREMENT');
      setQuantity(10);
      setSelectedVariantSku(product.variants?.length ? product.variants[0].sku : '');
      setLowStockThreshold(product.lowStockThreshold ?? 5);
      setTrackInventory(product.trackInventory !== false);
      setAllowBackorders(Boolean(product.allowBackorders));
      setReason('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Compute active item stock
  const activeVariant = product.variants?.find((v) => v.sku === selectedVariantSku);
  const currentStock = activeVariant ? activeVariant.stockQuantity : product.stockQuantity;

  let resultingStock = currentStock;
  if (type === 'SET') {
    resultingStock = Math.max(0, quantity);
  } else if (type === 'INCREMENT') {
    resultingStock = currentStock + Math.max(0, quantity);
  } else if (type === 'DECREMENT') {
    resultingStock = Math.max(0, currentStock - Math.max(0, quantity));
  }

  const handleApplyPreset = (val: number) => {
    setQuantity(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 0) {
      toast.error('Quantity must be greater than or equal to 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryService.adjustStock(product._id, {
        type,
        quantity,
        variantSku: selectedVariantSku || undefined,
        lowStockThreshold,
        trackInventory,
        allowBackorders,
        reason: reason.trim() || undefined,
      });

      toast.success(
        `Updated stock for "${product.name}"${
          selectedVariantSku ? ` (${selectedVariantSku})` : ''
        } to ${resultingStock} units`,
      );
      onStockUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-md border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Adjust Inventory Stock</h3>
              <p className="text-xs text-slate-400">
                Update unit counts, thresholds, and replenishment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Target Product Summary Box */}
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate">{product.name}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                SKU: {product.sku}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">Current Stock</span>
              <span className="font-bold font-mono text-sm text-slate-900">
                {currentStock} units
              </span>
            </div>
          </div>

          {/* Variant Selector (if product has variants) */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Variant to Adjust
              </label>
              <select
                value={selectedVariantSku}
                onChange={(e) => setSelectedVariantSku(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
              >
                {product.variants.map((v) => (
                  <option key={v.sku} value={v.sku}>
                    {v.title || v.sku} ({v.sku}) — {v.stockQuantity} in stock
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Adjustment Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Adjustment Operation
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('INCREMENT')}
                className={`py-2 px-3 rounded-md border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  type === 'INCREMENT'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Restock (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('DECREMENT')}
                className={`py-2 px-3 rounded-md border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  type === 'DECREMENT'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Deduct (-)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('SET')}
                className={`py-2 px-3 rounded-md border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  type === 'SET'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Set Exact</span>
              </button>
            </div>
          </div>

          {/* Quantity Input + Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                {type === 'SET' ? 'New Total Stock' : 'Units to Adjust'}
              </label>
              <div className="flex items-center gap-1">
                {[5, 10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition-colors cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          {/* Calculation Preview Banner */}
          <div className="p-3 rounded-md bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Resulting Stock Level:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono line-through">{currentStock}</span>
              <span className="text-slate-400">&rarr;</span>
              <span
                className={`font-mono font-bold text-sm ${
                  resultingStock <= 0
                    ? 'text-rose-600'
                    : resultingStock <= lowStockThreshold
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {resultingStock} units
              </span>
            </div>
          </div>

          {/* Low Stock Alert Threshold & Policies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Triggers low-stock warnings</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Backorders Policy
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={allowBackorders}
                  onChange={(e) => setAllowBackorders(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span>Allow orders when stock is 0</span>
              </label>
            </div>
          </div>

          {/* Reason / Audit Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjustment Justification (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Received shipment PO-8492, damaged in handling, audit count"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              isLoading={isSubmitting}
            >
              Apply Adjustment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
