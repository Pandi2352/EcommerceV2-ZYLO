import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import type { ProductItem } from '@shared/types/product';

export interface DeleteProductDialogProps {
  isOpen: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onConfirm: (productId: string) => Promise<void>;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const isAlreadyArchived = product.status === 'ARCHIVED';

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await onConfirm(product._id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-md p-6 shadow-none">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900">
              {isAlreadyArchived ? 'Permanently Delete' : 'Archive Product'} &quot;{product.name}&quot;?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isAlreadyArchived
                ? 'This action cannot be undone. All variants, specifications, and SKU data will be permanently wiped.'
                : 'This will remove the product from active storefront listings and move it to archived state.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Product Summary Card */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
            {product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="max-w-full max-h-full object-cover rounded"
              />
            ) : (
              <span className="text-xs font-bold text-slate-400">
                {product.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{product.name}</h4>
            <p className="text-xs text-slate-500 font-mono truncate">SKU: {product.sku}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-slate-900">${product.basePrice}</p>
            <p className="text-[11px] text-slate-500">{product.stockQuantity} in stock</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md shadow-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={handleConfirm}
            className="rounded-md shadow-none"
          >
            {isAlreadyArchived ? 'Delete Permanently' : 'Archive Product'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteProductDialog;
