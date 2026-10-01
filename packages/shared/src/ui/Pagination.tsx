import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PaginationMeta } from '../types/api';
import { cn } from '../utils/cn';
import Dropdown from './Dropdown';

export interface PaginationProps {
  page?: number;
  pageSize?: number;
  total?: number;
  /** Alternative to page/pageSize/total: the API's pagination meta */
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  /** Shows the "Rows per page" picker when provided */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
  /** Word used in "1–15 of 380 rows" */
  itemLabel?: string;
}

/** Page numbers with ellipses: 1 … 4 [5] 6 … 20 */
function pageWindow(current: number, last: number): (number | 'gap')[] {
  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const NavButton: React.FC<{ label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }> = ({
  label,
  disabled,
  onClick,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

/** Table footer: rows-per-page picker, range summary, and first/prev/numbers/next/last. */
export const Pagination: React.FC<PaginationProps> = ({
  page: pageProp,
  pageSize: pageSizeProp,
  total: totalProp,
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 25, 50, 100],
  disabled = false,
  itemLabel = 'rows',
}) => {
  const page = meta?.page ?? pageProp ?? 1;
  const pageSize = meta?.limit ?? pageSizeProp ?? 15;
  const total = meta?.total ?? totalProp ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), lastPage));

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Rows per page</span>
            <Dropdown
              size="sm"
              className="w-[68px]"
              value={String(pageSize)}
              onChange={(v) => v && onPageSizeChange(Number(v))}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
              disabled={disabled}
            />
          </div>
        )}
        <span className="whitespace-nowrap tabular-nums">
          {from}–{to} of {total.toLocaleString()} {itemLabel}
        </span>
      </div>

      {lastPage > 1 && (
        <div className="flex items-center gap-1">
          <NavButton label="First page" disabled={disabled || page <= 1} onClick={() => go(1)}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </NavButton>
          <NavButton label="Previous page" disabled={disabled || page <= 1} onClick={() => go(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </NavButton>
          {pageWindow(page, lastPage).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1 text-zinc-400">…</span>
            ) : (
              <button
                key={p}
                type="button"
                disabled={disabled}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => go(p)}
                className={cn(
                  'h-7 min-w-7 rounded-md px-1.5 text-xs font-medium tabular-nums transition-colors',
                  p === page ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
                )}
              >
                {p}
              </button>
            ),
          )}
          <NavButton label="Next page" disabled={disabled || page >= lastPage} onClick={() => go(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </NavButton>
          <NavButton label="Last page" disabled={disabled || page >= lastPage} onClick={() => go(lastPage)}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </NavButton>
        </div>
      )}
    </nav>
  );
};

export default Pagination;
