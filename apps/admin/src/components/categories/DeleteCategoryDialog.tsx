import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import Dropdown from '@shared/ui/Dropdown';
import type { CategoryItem } from '@shared/types/catalog';

export interface DeleteCategoryDialogProps {
  isOpen: boolean;
  category: CategoryItem | null;
  allCategories: CategoryItem[];
  onClose: () => void;
  onConfirm: (categoryId: string, reassignToId?: string) => Promise<void>;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  category,
  allCategories,
  onClose,
  onConfirm,
}) => {
  const [reassignTo, setReassignTo] = useState<string>('root');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !category) return null;

  const hasChildren = (category.subcategoryCount ?? 0) > 0;
  const availableParents = allCategories.filter((c) => c._id !== category._id);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await onConfirm(category._id, hasChildren ? reassignTo : undefined);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category');
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
              Delete Category &quot;{category.name}&quot;?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              This action cannot be undone. Slugs associated with this category will become unassigned.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Subcategory Reassignment Warning */}
        {hasChildren && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-2">
            <p className="font-semibold">
              Warning: This category contains {category.subcategoryCount} nested subcategories!
            </p>
            <p className="text-amber-800">
              To avoid leaving orphaned child categories, please choose where to move them:
            </p>
            <div className="mt-1">
              <Dropdown
                value={reassignTo}
                onChange={(val) => setReassignTo(val || 'root')}
                size="sm"
                searchable={availableParents.length > 5}
                options={[
                  { value: 'root', label: 'Promote to Top-Level (Root Departments)' },
                  ...availableParents.map((p) => ({
                    value: p._id,
                    label: `Move under: ${p.name}`,
                  })),
                ]}
              />
            </div>
          </div>
        )}

        {/* Product count notice */}
        {(category.productCount ?? 0) > 0 && (
          <div className="mt-3 text-xs text-slate-500">
            Note: {category.productCount} products are currently assigned to this category.
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            {hasChildren ? 'Reassign & Delete' : 'Delete Category'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteCategoryDialog;
