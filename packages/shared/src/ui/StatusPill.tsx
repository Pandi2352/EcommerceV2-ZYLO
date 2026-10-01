import React from 'react';
import { cn } from '../utils/cn';

export type StatusTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

const DOT: Record<StatusTone, string> = {
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
  neutral: 'bg-zinc-400',
};

export interface StatusPillProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

/** Record state ("• Active", "• Inactive"): the dot colour carries the state. */
export const StatusPill: React.FC<StatusPillProps> = ({ tone, children, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-xs font-medium text-zinc-700',
      className,
    )}
  >
    <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', DOT[tone])} />
    {children}
  </span>
);

export default StatusPill;
