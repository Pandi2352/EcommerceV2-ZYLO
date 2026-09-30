import React from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import Alert from '../feedback/Alert';
import Button from './Button';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[] | null;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
}

/** Table with the four standard states: loading, error, empty and data. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  error,
  onRetry,
  emptyMessage = 'Nothing to show yet.',
}: DataTableProps<T>) {
  if (error) {
    return (
      <Alert
        tone="error"
        title="Could not load data"
        action={onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
      >
        {error}
      </Alert>
    );
  }

  const showEmpty = !isLoading && (!rows || rows.length === 0);

  return (
    <div className="relative border border-slate-200 rounded-md overflow-x-auto bg-white">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`px-4 py-2.5 font-bold ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-slate-100 ${isLoading ? 'opacity-50' : ''}`}>
          {rows?.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50/60">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 text-slate-700 align-top ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {isLoading && (!rows || rows.length === 0) && (
        <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}
      {showEmpty && (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
          <Inbox className="w-6 h-6 text-slate-300" />
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export default DataTable;
