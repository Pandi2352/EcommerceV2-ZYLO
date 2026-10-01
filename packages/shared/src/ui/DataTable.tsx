import React, { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from 'lucide-react';
import { cn } from '../utils/cn';
import Alert from './Alert';
import Button from './Button';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  /** Small icon shown before the header label */
  icon?: React.ReactNode;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Tailwind width class, e.g. 'w-40' */
  width?: string;
  className?: string;
  /** Field name sent to the API when this column is sorted */
  sortKey?: string;
  /** Keep the column visible at the right edge while the table scrolls sideways (row actions) */
  sticky?: 'right';
}

// Pinned column: opaque background + a left edge so rows don't show through while scrolling
const STICKY_RIGHT = 'sticky right-0 z-[1] bg-white shadow-[inset_1px_0_0_#e4e4e7]';

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[] | null;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Shown when there are no rows; pass a full EmptyState for a cause + next action */
  emptyState?: React.ReactNode;
  /** @deprecated use emptyState */
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  skeletonRows?: number;
  sort?: TableSort | null;
  /** Header click cycles: ascending → descending → unsorted */
  onSortChange?: (sort: TableSort | null) => void;
  /** Rendered under the table inside the same card (pagination) */
  footer?: React.ReactNode;
}

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' };

const SelectBox: React.FC<{ checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }> = ({
  checked,
  indeterminate = false,
  onChange,
  label,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="h-3.5 w-3.5 cursor-pointer rounded border-zinc-300 accent-zinc-900"
    />
  );
};

/** Compact data table with loading skeleton, error, empty and selection states. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  error,
  onRetry,
  emptyState,
  emptyMessage = 'Nothing to show yet.',
  onRowClick,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  skeletonRows = 8,
  sort,
  onSortChange,
  footer,
}: DataTableProps<T>) {
  const cycleSort = (key: string) => {
    if (sort?.key !== key) onSortChange?.({ key, direction: 'asc' });
    else if (sort.direction === 'asc') onSortChange?.({ key, direction: 'desc' });
    else onSortChange?.(null);
  };

  const keys = rows?.map(rowKey) ?? [];
  const selected = new Set(selectedKeys);
  const allSelected = keys.length > 0 && keys.every((k) => selected.has(k));
  const someSelected = !allSelected && keys.some((k) => selected.has(k));
  const showSkeleton = isLoading && (!rows || rows.length === 0);
  const showEmpty = !isLoading && !error && (!rows || rows.length === 0);

  const toggleAll = () => onSelectionChange?.(allSelected ? [] : keys);
  const toggleOne = (key: string) =>
    onSelectionChange?.(selected.has(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {error ? (
        <div className="p-4">
          <Alert
            tone="error"
            title="Couldn't load this list"
            action={onRetry && <Button size="xs" variant="outline" onClick={onRetry}>Try again</Button>}
          >
            {error}
          </Alert>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200">
                {selectable && (
                  <th scope="col" className="w-10 px-3 py-2">
                    <SelectBox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} label="Select all rows" />
                  </th>
                )}
                {columns.map((col) => {
                  const sortable = Boolean(col.sortKey && onSortChange);
                  const active = sortable && sort?.key === col.sortKey;
                  const label = (
                    <span className={cn('inline-flex items-center gap-1.5', col.align === 'right' && 'flex-row-reverse')}>
                      {col.icon && <span className="flex text-zinc-400 [&>svg]:h-3.5 [&>svg]:w-3.5">{col.icon}</span>}
                      {col.header}
                      {sortable &&
                        (active ? (
                          sort?.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-zinc-900" /> : <ArrowDown className="h-3 w-3 text-zinc-900" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 text-zinc-300" />
                        ))}
                    </span>
                  );
                  return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn(
                      'whitespace-nowrap border-l border-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500 first:border-l-0',
                      ALIGN[col.align ?? 'left'],
                      col.width,
                      col.sticky === 'right' && STICKY_RIGHT,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => cycleSort(col.sortKey!)}
                        className={cn('rounded outline-none hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/10', active && 'text-zinc-900')}
                      >
                        {label}
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className={cn(isLoading && rows && rows.length > 0 && 'opacity-60 transition-opacity')}>
              {showSkeleton &&
                Array.from({ length: skeletonRows }, (_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-zinc-100 last:border-b-0">
                    {selectable && <td className="px-3 py-2.5"><div className="skeleton h-3.5 w-3.5" /></td>}
                    {columns.map((col) => (
                      <td key={col.key} className="border-l border-zinc-100 px-3 py-2.5 first:border-l-0">
                        <div className="skeleton h-3.5" style={{ width: `${50 + ((i * 7 + col.key.length * 13) % 40)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))}

              {rows?.map((row) => {
                const key = rowKey(row);
                const isSelected = selected.has(key);
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'group border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50/80',
                      isSelected && 'bg-zinc-50',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-2">
                        <SelectBox checked={isSelected} onChange={() => toggleOne(key)} label="Select row" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'whitespace-nowrap border-l border-zinc-100 px-3 py-2 align-middle text-zinc-700 first:border-l-0',
                          ALIGN[col.align ?? 'left'],
                          col.className,
                          col.sticky === 'right' && cn(STICKY_RIGHT, 'group-hover:bg-zinc-50', isSelected && 'bg-zinc-50'),
                        )}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {showEmpty &&
            (emptyState ?? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-[13px] text-zinc-500">
                <Inbox className="h-6 w-6 text-zinc-300" />
                {emptyMessage}
              </div>
            ))}
        </div>
      )}

      {footer && !error && <div className="border-t border-zinc-200 px-3 py-2">{footer}</div>}
    </div>
  );
}

export default DataTable;
