import React, { useId, forwardRef } from 'react';
import { X, AlertCircle } from 'lucide-react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  /** 'sm' is the compact admin size (36px, 13px text); 'md' is the default */
  fieldSize?: 'sm' | 'md';
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightElement,
      clearable = false,
      onClear,
      id,
      required,
      disabled,
      className = '',
      containerClassName = '',
      fieldSize = 'md',
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const compact = fieldSize === 'sm';
    const hasValue = value !== undefined && value !== null && String(value).length > 0;
    const effectivePlaceholder =
      props.placeholder !== undefined
        ? props.placeholder
        : label
        ? `Enter ${label.toLowerCase()}`
        : undefined;

    return (
      <div className={`w-full ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={compact ? 'mb-1.5 block text-[13px] font-medium text-zinc-800' : 'mb-1.5 block text-sm font-semibold text-slate-800'}
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex items-center">
          {/* Left Icon */}
          {leftIcon && (
            <div className={`absolute ${compact ? 'left-3 [&>svg]:h-3.5 [&>svg]:w-3.5' : 'left-3.5'} flex items-center pointer-events-none text-slate-400`}>
              {leftIcon}
            </div>
          )}

          {/* Actual Input */}
          <input
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            required={required}
            placeholder={effectivePlaceholder}
            className={`w-full rounded-md transition-colors placeholder:text-slate-400 placeholder:font-normal bg-white outline-none focus:outline-none focus:ring-0 ${
              compact ? 'h-9 text-[13px] placeholder:text-[13px]' : 'py-2.5 text-sm placeholder:text-sm'
            } ${
              leftIcon ? (compact ? 'pl-8' : 'pl-10') : compact ? 'pl-3' : 'pl-3.5'
            } ${
              rightElement || (clearable && hasValue) ? 'pr-10' : 'pr-3.5'
            } ${
              error
                ? 'border border-rose-300 focus:border-rose-400 text-slate-900 bg-rose-50/20'
                : compact
                ? 'border border-zinc-200 hover:border-zinc-300 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 text-zinc-900'
                : 'border border-slate-200 focus:border-slate-400 text-slate-900'
            } ${
              disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
            } ${className}`}
            {...props}
          />

          {/* Clear button */}
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onClear}
              className="absolute right-3 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Custom Right Element (if clearable not active or alongside) */}
          {rightElement && !clearable && (
            <div className="absolute right-3 flex items-center">{rightElement}</div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Helper Text (only when no error) */}
        {!error && helperText && (
          <p className="mt-1 text-xs text-slate-500 leading-normal">{helperText}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
export default InputField;
