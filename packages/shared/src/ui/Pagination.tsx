import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '../types/api';
import Button from './Button';

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange, disabled = false }) => {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
      <span>
        Showing <strong className="text-slate-700">{from}–{to}</strong> of{' '}
        <strong className="text-slate-700">{meta.total}</strong>
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <span className="font-semibold text-slate-700">
          {meta.page} / {meta.totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
