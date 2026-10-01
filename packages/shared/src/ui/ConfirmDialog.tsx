import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils/cn';
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

const TONES = {
  danger: { icon: AlertTriangle, iconClass: 'bg-rose-50 text-rose-600', button: 'danger' as const },
  warning: { icon: AlertCircle, iconClass: 'bg-amber-50 text-amber-600', button: 'primary' as const },
  primary: { icon: Info, iconClass: 'bg-zinc-100 text-zinc-700', button: 'primary' as const },
};

/** Confirmation for consequential actions. Escape / backdrop cancel unless the action is running. */
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
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && !isLoading && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const { icon: Icon, iconClass, button } = TONES[tone];

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="fixed inset-0 animate-fade-in bg-zinc-900/40" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-md animate-pop-in rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15">
        <div className="flex gap-3 p-5">
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconClass)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="confirm-title" className="text-[15px] font-semibold text-zinc-900">
              {title}
            </h3>
            {description && <div className="mt-1 text-[13px] leading-relaxed text-zinc-600">{description}</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button size="sm" variant={button} onClick={onConfirm} isLoading={isLoading} autoFocus>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
