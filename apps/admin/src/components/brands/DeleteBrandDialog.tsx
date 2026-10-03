import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import type { BrandItem } from '@shared/types/brand';

export interface DeleteBrandDialogProps {
  isOpen: boolean;
  brand: BrandItem | null;
  onClose: () => void;
  onConfirm: (brandId: string) => Promise<void>;
}

export const DeleteBrandDialog: React.FC<DeleteBrandDialogProps> = ({
  isOpen,
  brand,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !brand) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await onConfirm(brand._id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete brand');
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
              Delete Brand &quot;{brand.name}&quot;?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              This action cannot be undone. Removing this brand will dissociate it from catalog products and storefront manufacturer listings.
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

        {/* Brand Summary Card */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-xs font-bold text-slate-400">
                {brand.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{brand.name}</h4>
            <p className="text-xs text-slate-500 font-mono truncate">/brands/{brand.slug}</p>
          </div>
          {brand.countryOfOrigin && (
            <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
              {brand.countryOfOrigin}
            </span>
          )}
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
            Delete Brand
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteBrandDialog;
