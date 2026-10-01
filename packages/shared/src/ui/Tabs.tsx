import React from 'react';
import { cn } from '../utils/cn';

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps<K extends string = string> {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  className?: string;
}

/** Underlined tab bar with optional counts. ←/→ move between tabs. */
export function Tabs<K extends string = string>({ items, value, onChange, className }: TabsProps<K>) {
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = items[(index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
    onChange(next.key);
    (event.currentTarget.parentElement?.querySelector(`[data-key="${next.key}"]`) as HTMLElement | null)?.focus();
  };

  return (
    <div role="tablist" className={cn('flex items-center gap-4 border-b border-zinc-200', className)}>
      {items.map((item, index) => {
        const selected = item.key === value;
        return (
          <button
            key={item.key}
            data-key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              '-mb-px inline-flex items-center gap-1.5 border-b-2 px-0.5 pb-2 pt-1 text-[13px] font-medium outline-none transition-colors',
              selected ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800',
            )}
          >
            {item.icon && <span className="flex [&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded px-1.5 text-[11px] tabular-nums',
                  selected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
