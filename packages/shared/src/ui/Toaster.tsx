import React, { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { toastStore, type ToastItem, type ToastType } from './toastStore';

export interface ToasterProps {
  position?: 'top-right' | 'top-center' | 'bottom-right';
}

const ICONS: Record<ToastType, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-400' },
  error: { icon: AlertCircle, color: 'text-rose-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  info: { icon: Info, color: 'text-sky-400' },
};

const POSITION_CLASSES: Record<NonNullable<ToasterProps['position']>, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const { icon: Icon, color } = ICONS[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(toast.duration);
  const startedRef = useRef(0);

  const start = useCallback(() => {
    if (toast.duration <= 0) return;
    startedRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(toast.id), remainingRef.current);
  }, [toast.duration, toast.id, onDismiss]);

  // Hovering pauses the countdown so actions stay reachable
  const pause = useCallback(() => {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedRef.current));
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [start]);

  const heading = toast.title ?? toast.message;
  const detail = toast.title ? toast.message : undefined;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
      // Floating layer above page content: the elevation is the point, so it carries the shadow
      className="pointer-events-auto flex w-full max-w-[360px] animate-toast-in items-start gap-2.5 rounded-lg bg-zinc-900 px-3.5 py-3 text-white shadow-xl shadow-zinc-900/20"
    >
      <Icon className={`mt-px h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-5 break-words">{heading}</p>
        {detail && <p className="mt-0.5 text-xs leading-4 text-zinc-400 break-words">{detail}</p>}
        {toast.actions.length > 0 && (
          <div className="mt-2 flex items-center gap-3">
            {toast.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  action.onClick();
                  onDismiss(toast.id);
                }}
                className="text-xs font-semibold text-white underline-offset-2 hover:underline"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-0.5 shrink-0 rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

/** Renders the toast stack. Mount once per app. */
export const Toaster: React.FC<ToasterProps> = ({ position = 'top-right' }) => {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className={`pointer-events-none fixed z-[99999] flex w-[calc(100vw-2rem)] max-w-[360px] flex-col gap-2 ${POSITION_CLASSES[position]}`}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={toastStore.dismiss} />
      ))}
    </aside>
  );
};

export default Toaster;
