import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { cn } from '../utils/cn';

export interface DropdownOption<V extends string = string> {
  value: V;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectMenuProps<V extends string> {
  options: DropdownOption<V>[];
  value: V | '' | null | undefined;
  onSelect: (value: V) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Rendered below the list, e.g. a "Clear filter" action */
  footer?: React.ReactNode;
}

/**
 * Listbox used inside Dropdown and FilterDropdown popovers.
 * Keyboard: ↑/↓ move, Home/End jump, Enter selects; typing filters when searchable.
 */
export function SelectMenu<V extends string>({
  options,
  value,
  onSelect,
  searchable = false,
  searchPlaceholder = 'Search…',
  emptyText = 'No matches',
  footer,
}: SelectMenuProps<V>) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.description ?? ''}`.toLowerCase().includes(q));
  }, [options, query]);

  const selectedIndex = visible.findIndex((o) => o.value === value);
  const [active, setActive] = useState(Math.max(0, selectedIndex));

  // Focus the search box (or the list) when the menu opens
  useEffect(() => {
    (searchable ? searchRef.current : listRef.current)?.focus();
  }, [searchable]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const move = (delta: number) => {
    if (visible.length === 0) return;
    let next = active;
    for (let i = 0; i < visible.length; i++) {
      next = (next + delta + visible.length) % visible.length;
      if (!visible[next].disabled) break;
    }
    setActive(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActive(0);
        break;
      case 'End':
        event.preventDefault();
        setActive(visible.length - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const option = visible[active];
        if (option && !option.disabled) onSelect(option.value);
        break;
      }
    }
  };

  return (
    <div onKeyDown={onKeyDown} className="w-full">
      {searchable && (
        <div className="relative mb-1 border-b border-zinc-100 pb-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 -mt-0.5 text-zinc-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder={searchPlaceholder}
            aria-controls={listId}
            aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
            className="h-8 w-full rounded-md bg-transparent pl-7 pr-2 text-[13px] text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </div>
      )}

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        tabIndex={searchable ? -1 : 0}
        aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
        className="max-h-64 overflow-y-auto outline-none custom-scrollbar"
      >
        {visible.length === 0 && <li className="px-2.5 py-2 text-[13px] text-zinc-400">{emptyText}</li>}
        {visible.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={isSelected}
              aria-disabled={option.disabled}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => !option.disabled && onSelect(option.value)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-zinc-700',
                index === active && 'bg-zinc-100 text-zinc-900',
                option.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {option.icon && <span className="flex shrink-0 text-zinc-500">{option.icon}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{option.label}</span>
                {option.description && (
                  <span className="block truncate text-xs text-zinc-500">{option.description}</span>
                )}
              </span>
              {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-zinc-900" />}
            </li>
          );
        })}
      </ul>

      {footer && <div className="mt-1 border-t border-zinc-100 pt-1">{footer}</div>}
    </div>
  );
}

export default SelectMenu;
