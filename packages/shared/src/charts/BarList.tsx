import React from 'react';
import { Link } from 'react-router-dom';

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  /** Optional link for the label */
  to?: string;
  /** Muted secondary text after the label, e.g. "Inactive" */
  note?: string;
}

export interface BarListProps {
  items: BarListItem[];
  /** CSS color for every bar (single hue: this compares magnitude) */
  color?: string;
  valueSuffix?: string;
  emptyText?: string;
}

/** Horizontal bars for comparing magnitudes across named items; values are always labelled. */
export const BarList: React.FC<BarListProps> = ({ items, color = 'var(--viz-1)', valueSuffix = '', emptyText = 'No data yet.' }) => {
  const max = Math.max(1, ...items.map((i) => i.value));

  if (items.length === 0) return <p className="py-6 text-center text-xs text-zinc-500">{emptyText}</p>;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.key} className="group grid grid-cols-[minmax(0,9rem)_1fr_2.5rem] items-center gap-3 text-[13px]">
          <span className="truncate text-zinc-700" title={item.label}>
            {item.to ? (
              <Link to={item.to} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
            {item.note && <span className="ml-1 text-xs text-zinc-400">· {item.note}</span>}
          </span>
          <span className="h-2 rounded-full bg-zinc-100">
            <span
              className="block h-2 rounded-full transition-opacity group-hover:opacity-80"
              style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value > 0 ? 4 : 0, background: color }}
            />
          </span>
          <span className="text-right tabular-nums text-zinc-900">
            {item.value}
            {valueSuffix}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default BarList;
