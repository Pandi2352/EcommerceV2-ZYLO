import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../utils/cn';

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  /** One line of context: what the number is made of or what to do about it */
  context?: React.ReactNode;
  /** Where to act on this number */
  to?: string;
  /** Optional ratio meter (0–1) shown under the value */
  meter?: number;
  /** Marks a number that needs attention (e.g. locked accounts > 0) */
  attention?: boolean;
}

/** Headline number with context, optionally linking to the filtered list behind it. */
export const StatTile: React.FC<StatTileProps> = ({ label, value, context, to, meter, attention }) => {
  const body = (
    <>
      <p className="flex items-center justify-between text-xs font-medium text-zinc-500">
        {label}
        {to && <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 transition-colors group-hover:text-zinc-600" />}
      </p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums tracking-tight', attention ? 'text-rose-600' : 'text-zinc-900')}>{value}</p>
      {meter !== undefined && (
        <div className="mt-1.5 h-1.5 rounded-full" style={{ background: 'var(--viz-track)' }} aria-hidden="true">
          <div className="h-1.5 rounded-full" style={{ width: `${Math.round(Math.min(1, Math.max(0, meter)) * 100)}%`, background: 'var(--viz-1)' }} />
        </div>
      )}
      {context && <p className="mt-1.5 text-xs text-zinc-500">{context}</p>}
    </>
  );

  const className = 'group block px-4 py-3.5';
  return to ? (
    <Link to={to} className={cn(className, 'transition-colors hover:bg-zinc-50')}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
};

export default StatTile;
