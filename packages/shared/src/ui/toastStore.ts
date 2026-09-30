export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  duration?: number; // Duration in ms. Default 4000ms. Set to 0 to prevent auto-dismiss.
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  action?: ToastAction;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();
let idCounter = 0;

function notify() {
  const current = [...toasts];
  listeners.forEach((listener) => listener(current));
}

function generateId(): string {
  idCounter += 1;
  return `toast-${Date.now()}-${idCounter}`;
}

export const toastStore = {
  subscribe(listener: ToastListener): () => void {
    listeners.add(listener);
    listener([...toasts]);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): ToastItem[] {
    return toasts;
  },

  add(type: ToastType, message: string, options?: ToastOptions): string {
    const id = generateId();
    const duration = options?.duration !== undefined ? options.duration : 4000;

    const newItem: ToastItem = {
      id,
      type,
      message,
      title: options?.title,
      duration,
      action: options?.action,
      createdAt: Date.now(),
    };

    // Keep max 5 visible toasts at any time
    toasts = [newItem, ...toasts.slice(0, 4)];
    notify();

    return id;
  },

  dismiss(id: string): void {
    const prevLen = toasts.length;
    toasts = toasts.filter((t) => t.id !== id);
    if (toasts.length !== prevLen) {
      notify();
    }
  },

  clear(): void {
    if (toasts.length > 0) {
      toasts = [];
      notify();
    }
  },
};

export const toast = {
  success: (message: string, options?: ToastOptions): string =>
    toastStore.add('success', message, options),
  error: (message: string, options?: ToastOptions): string =>
    toastStore.add('error', message, options),
  warning: (message: string, options?: ToastOptions): string =>
    toastStore.add('warning', message, options),
  info: (message: string, options?: ToastOptions): string =>
    toastStore.add('info', message, options),
  dismiss: (id: string): void => toastStore.dismiss(id),
  clear: (): void => toastStore.clear(),
};
