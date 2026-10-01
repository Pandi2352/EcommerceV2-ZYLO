import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<DrawerProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  '2xl': 'max-w-3xl',
};

/** Side panel for create/edit forms, keeping the list it came from visible. */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="fixed inset-0 animate-fade-in bg-zinc-900/40" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'flex w-screen animate-slide-in-right flex-col border-l border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10',
            SIZE_CLASSES[size],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold text-zinc-900">{title}</h2>}
              {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="-mr-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50/60 px-5 py-3">{footer}</div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Drawer;
