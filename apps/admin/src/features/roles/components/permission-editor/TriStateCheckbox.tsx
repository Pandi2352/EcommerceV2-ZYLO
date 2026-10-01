import React, { useEffect, useRef } from 'react';
import { cn } from '@shared/utils/cn';

export interface TriStateCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
  title?: string;
  className?: string;
}

/** Checkbox with an "some selected" state; same look as the DataTable row checkbox. */
export const TriStateCheckbox: React.FC<TriStateCheckboxProps> = ({
  checked,
  indeterminate = false,
  disabled,
  onChange,
  label,
  title,
  className,
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
      title={title}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className={cn('h-3.5 w-3.5 shrink-0 rounded border-zinc-300 accent-zinc-900', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}
    />
  );
};

export default TriStateCheckbox;
