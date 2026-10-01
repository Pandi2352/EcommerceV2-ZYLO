import React from 'react';
import { cn } from '../utils/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'highlight';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-zinc-100 text-zinc-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  info: 'bg-sky-50 text-sky-700',
  // Strong marker for a positive security state (e.g. "2FA Enabled")
  highlight: 'bg-amber-100 text-amber-900',
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

/** Small label for categories and attributes. For record state with a dot, use StatusPill. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', children, className = '' }) => (
  <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium', TONES[tone], className)}>
    {children}
  </span>
);

export default Badge;
