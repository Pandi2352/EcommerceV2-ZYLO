import React, { useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../utils/cn';
import Popover from './Popover';
import SelectMenu, { type DropdownOption } from './SelectMenu';

export interface FilterDropdownProps<V extends string = string> {
  /** Filter name shown on the chip, e.g. "Role" */
  label: string;
  icon?: React.ReactNode;
  value: V | '' | null | undefined;
  onChange: (value: V | '') => void;
  options: DropdownOption<V>[];
  searchable?: boolean;
}

/**
 * Compact filter chip for table toolbars ("Role ▾"). When a value is chosen the
 * chip shows it ("Role: Admin") and gets a × to clear.
 */
export function FilterDropdown<V extends string = string>({
  label,
  icon,
  value,
  onChange,
  options,
  searchable,
}: FilterDropdownProps<V>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const close = () => setOpen(false);

  return (
    <div
      className={cn(
        'inline-flex h-7 items-center rounded-md border text-xs transition-colors',
        selected ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300',
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-full items-center gap-1.5 rounded-md pl-2.5 pr-2 font-medium text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
      >
        {icon && <span className="flex text-zinc-500">{icon}</span>}
        <span>{label}</span>
        {selected && (
          <>
            <span className="text-zinc-300">|</span>
            <span className="max-w-[10rem] truncate text-zinc-900">{selected.label}</span>
          </>
        )}
        {!selected && <ChevronDown className="h-3 w-3 text-zinc-400" />}
      </button>

      {selected && (
        <button
          type="button"
          aria-label={`Clear ${label} filter`}
          onClick={() => onChange('')}
          className="mr-1 rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <Popover open={open} onClose={close} anchorRef={triggerRef} className="w-56">
        <SelectMenu
          options={options}
          value={value}
          searchable={searchable}
          onSelect={(next) => {
            onChange(next === value ? '' : next);
            close();
          }}
          footer={
            selected && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  close();
                }}
                className="w-full rounded-md px-2.5 py-1.5 text-left text-[13px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Clear filter
              </button>
            )
          }
        />
      </Popover>
    </div>
  );
}

export default FilterDropdown;
