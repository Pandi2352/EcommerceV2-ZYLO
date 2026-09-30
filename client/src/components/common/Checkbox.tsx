import React, { forwardRef, useId } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, hint, error, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={className}>
        <label htmlFor={inputId} className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none group">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="mt-0.5 rounded border-slate-300 text-[#2A3B5C] focus:ring-0 cursor-pointer"
            {...props}
          />
          <span className="group-hover:text-slate-900 transition-colors">
            {label}
            {hint && <span className="ml-1 text-[10px] text-slate-400 font-normal">{hint}</span>}
          </span>
        </label>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
