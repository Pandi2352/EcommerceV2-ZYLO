import React from 'react';
import { cn } from '../utils/cn';

export interface PageHeaderProps {
  title: string;
  /** Total shown next to the title (e.g. number of users) */
  count?: number;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Page title block: title with count, one-line description, actions. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, count, description, actions, className }) => (
  <header className={cn('mb-4', className)}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex items-baseline gap-2 text-xl font-semibold tracking-tight text-zinc-900">
          {title}
          {count !== undefined && <span className="text-[13px] font-medium tabular-nums text-zinc-400">{count.toLocaleString()}</span>}
        </h1>
        {description && <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;
