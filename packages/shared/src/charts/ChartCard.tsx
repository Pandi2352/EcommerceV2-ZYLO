import React, { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { cn } from '../utils/cn';

export interface ChartCardProps {
  /** Phrase the title as the question the chart answers */
  title: string;
  subtitle?: React.ReactNode;
  /** Accessible table version of the same data; adds a Chart/Table toggle */
  table?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Bordered card for one chart, with an optional table view of the same data. */
export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, table, actions, className, children }) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <section className={cn('flex flex-col rounded-lg border border-zinc-200 bg-white', className)}>
      <header className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {table && (
            <div role="group" aria-label="View" className="flex rounded-md border border-zinc-200 p-0.5">
              {(['chart', 'table'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={v === 'chart' ? 'Show chart' : 'Show table'}
                  onClick={() => setView(v)}
                  className={cn('rounded p-1 text-zinc-500 transition-colors', view === v ? 'bg-zinc-100 text-zinc-900' : 'hover:text-zinc-900')}
                >
                  {v === 'chart' ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <div className="flex-1 px-4 pb-4 pt-3">{view === 'table' && table ? table : children}</div>
    </section>
  );
};

/** Minimal data table used as a chart's table view. */
export const ChartTable: React.FC<{ columns: string[]; rows: (string | number)[][] }> = ({ columns, rows }) => (
  <div className="max-h-64 overflow-auto custom-scrollbar">
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
          {columns.map((c, i) => (
            <th key={c} scope="col" className={cn('py-1.5 font-medium', i > 0 && 'text-right')}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className="border-b border-zinc-100 last:border-0">
            {row.map((cell, i) => (
              <td key={i} className={cn('py-1.5 text-zinc-700', i > 0 && 'text-right tabular-nums')}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ChartCard;
