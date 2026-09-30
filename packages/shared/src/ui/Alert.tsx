import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertTone = 'error' | 'success' | 'warning' | 'info';

const TONES: Record<AlertTone, { box: string; icon: string; Icon: typeof Info }> = {
  error: { box: 'bg-rose-50 border-rose-200 text-rose-800', icon: 'text-rose-600', Icon: AlertCircle },
  success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: 'text-emerald-600', Icon: CheckCircle2 },
  warning: { box: 'bg-amber-50 border-amber-200 text-amber-800', icon: 'text-amber-600', Icon: AlertTriangle },
  info: { box: 'bg-sky-50 border-sky-200 text-sky-800', icon: 'text-sky-600', Icon: Info },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/** Inline feedback banner for form errors, confirmations and notices. */
export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, action, onDismiss, className = '' }) => {
  const { box, icon, Icon } = TONES[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`p-3.5 rounded-md border text-xs flex items-start gap-2.5 ${box} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${icon}`} />
      <div className="flex-1 min-w-0 leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : 'font-medium'}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
