import React, { useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../utils/cn';
import Popover from './Popover';
import SelectMenu, { type DropdownOption } from './SelectMenu';

export type { DropdownOption } from './SelectMenu';

export interface DropdownProps<V extends string = string> {
  value: V | '' | null | undefined;
  onChange: (value: V | '') => void;
  options: DropdownOption<V>[];
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
  /** Show a search box above the options (useful for 8+ options) */
  searchable?: boolean;
  /** Show a × button that resets the value to '' */
  clearable?: boolean;
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  emptyText?: string;
  className?: string;
  id?: string;
  name?: string;
}

const SIZES = {
  sm: 'h-8 text-[13px] px-2.5',
  md: 'h-9 text-[13px] px-3',
};

/**
 * Select field with a custom listbox: replaces the native <select> everywhere.
 * Same visual language as InputField; keyboard and screen-reader friendly.
 */
export function Dropdown<V extends string = string>({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select…',
  helperText,
  error,
  required,
  disabled,
  searchable,
  clearable,
  size = 'md',
  leftIcon,
  emptyText,
  className,
  id,
  name,
}: DropdownProps<V>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const select = (next: V) => {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-[13px] font-medium text-zinc-800">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          name={name}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={!!error}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-md border bg-white text-left transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-zinc-900/10',
            SIZES[size],
            error ? 'border-rose-300 focus-visible:border-rose-400' : 'border-zinc-200 hover:border-zinc-300 focus-visible:border-zinc-400',
            open && 'border-zinc-400',
            disabled && 'cursor-not-allowed bg-zinc-50 text-zinc-400',
            clearable && selected && 'pr-14',
          )}
        >
          {(selected?.icon ?? leftIcon) && <span className="flex shrink-0 text-zinc-500">{selected?.icon ?? leftIcon}</span>}
          <span className={cn('min-w-0 flex-1 truncate', selected ? 'text-zinc-900' : 'text-zinc-400')}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} />
        </button>

        {clearable && selected && !disabled && (
          <button
            type="button"
            aria-label={`Clear ${label ?? 'selection'}`}
            onClick={() => onChange('')}
            className="absolute right-7 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Popover open={open} onClose={() => setOpen(false)} anchorRef={triggerRef} matchWidth>
        <SelectMenu options={options} value={value} onSelect={select} searchable={searchable} emptyText={emptyText} />
      </Popover>

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : (
        helperText && <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
      )}
    </div>
  );
}

export default Dropdown;
