import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import Button from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'danger',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const toneConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-rose-100 text-rose-600',
      btnVariant: 'danger' as const,
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-amber-100 text-amber-600',
      btnVariant: 'primary' as const,
    },
    primary: {
      icon: Info,
      iconBg: 'bg-indigo-100 text-indigo-600',
      btnVariant: 'primary' as const,
    },
  }[tone];

  const IconComponent = toneConfig.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => !isLoading && onClose()}
        />

        <div className="relative transform overflow-hidden rounded-md bg-white text-left border border-slate-200 transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="sm:flex sm:items-start gap-4">
              <div
                className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-md sm:mx-0 sm:h-10 sm:w-10 ${toneConfig.iconBg}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:text-left flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold leading-6 text-slate-900">{title}</h3>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-slate-500 p-1 -mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {description && (
                  <div className="mt-2">
                    <div className="text-sm text-slate-600 leading-relaxed">{description}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-slate-50/80 px-6 py-3.5 sm:flex sm:flex-row-reverse sm:gap-3 border-t border-slate-100">
            <Button
              variant={toneConfig.btnVariant}
              onClick={onConfirm}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 sm:mt-0 w-full sm:w-auto"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
