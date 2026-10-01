import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';
import Popover, { type PopoverPlacement } from './Popover';

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Items with `hidden: true` are skipped (e.g. permission-gated actions) */
  hidden?: boolean;
  /** Draw a divider above this item */
  separatorBefore?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  /** Render the trigger; spread `props` onto a <button>. */
  trigger: (props: {
    ref: React.Ref<HTMLButtonElement>;
    onClick: () => void;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
  }) => React.ReactNode;
  placement?: PopoverPlacement;
  className?: string;
}

/** Action menu (row "⋯" menus, split buttons). ↑/↓ to move, Enter to run, Esc to close. */
export const Menu: React.FC<MenuProps> = ({ items, trigger, placement = 'bottom-end', className }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const visible = items.filter((item) => !item.hidden);

  useEffect(() => {
    if (open) {
      setActive(0);
      listRef.current?.focus();
    }
  }, [open]);

  const run = (item: MenuItem) => {
    if (item.disabled) return;
    setOpen(false);
    item.onSelect();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + delta + visible.length) % visible.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (visible[active]) run(visible[active]);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  if (visible.length === 0) return null;

  return (
    <>
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      })}
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={triggerRef} placement={placement} className={cn('min-w-44', className)}>
        <div ref={listRef} role="menu" tabIndex={-1} onKeyDown={onKeyDown} className="outline-none">
          {visible.map((item, index) => (
            <React.Fragment key={item.key}>
              {item.separatorBefore && index > 0 && <div role="separator" className="my-1 h-px bg-zinc-100" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onMouseEnter={() => setActive(index)}
                onClick={() => run(item)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px]',
                  item.danger ? 'text-rose-600' : 'text-zinc-700',
                  index === active && (item.danger ? 'bg-rose-50' : 'bg-zinc-100 text-zinc-900'),
                  item.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                {item.icon && <span className="flex shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </Popover>
    </>
  );
};

export default Menu;
