import React, { useSyncExternalStore, useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { toastStore, type ToastItem, type ToastType } from './toastStore';

export interface ToasterProps {
  position?: 'top-right' | 'top-center' | 'bottom-right';
}

const TOAST_THEMES: Record<
  ToastType,
  {
    icon: typeof Info;
    iconColor: string;
    borderAccent: string;
    badgeBg: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    borderAccent: 'border-l-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-800',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-rose-600',
    borderAccent: 'border-l-rose-500',
    badgeBg: 'bg-rose-50 text-rose-800',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    borderAccent: 'border-l-amber-500',
    badgeBg: 'bg-amber-50 text-amber-800',
  },
  info: {
    icon: Info,
    iconColor: 'text-sky-600',
    borderAccent: 'border-l-sky-500',
    badgeBg: 'bg-sky-50 text-sky-800',
  },
};

const POSITION_CLASSES: Record<NonNullable<ToasterProps['position']>, string> = {
  'top-right': 'top-5 right-5',
  'top-center': 'top-5 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-5 right-5',
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const theme = TOAST_THEMES[toast.type];
  const Icon = theme.icon;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef<number>(toast.duration);
  const startTimeRef = useRef<number>(0);

  const startTimer = React.useCallback(() => {
    if (toast.duration <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingTimeRef.current);
  }, [toast.duration, toast.id, onDismiss]);

  const pauseTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className={`pointer-events-auto w-full max-w-sm bg-white rounded-md border border-slate-200 border-l-4 ${theme.borderAccent} p-3.5 flex items-start gap-3 transition-all duration-150 animate-in fade-in slide-in-from-top-2 select-none`}
    >
      {/* Status Icon */}
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${theme.iconColor}`} />

      {/* Message and optional title */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-[13px] font-bold text-slate-900 leading-tight mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-slate-700 font-medium leading-relaxed break-words">
          {toast.message}
        </p>

        {/* Action Button */}
        {toast.action && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss toast"
        className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const Toaster: React.FC<ToasterProps> = ({ position = 'top-right' }) => {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className={`fixed ${POSITION_CLASSES[position]} z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none`}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={toastStore.dismiss} />
      ))}
    </aside>
  );
};

export default Toaster;
