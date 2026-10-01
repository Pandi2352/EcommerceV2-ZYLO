import React from 'react';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  /** Why it's empty */
  description?: React.ReactNode;
  /** The one action that fills it */
  action?: React.ReactNode;
  className?: string;
}

/** Empty list state that names the cause and offers the next step. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
    {icon && (
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>
    )}
    <p className="text-[13px] font-medium text-zinc-900">{title}</p>
    {description && <p className="mt-1 max-w-sm text-xs text-zinc-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
