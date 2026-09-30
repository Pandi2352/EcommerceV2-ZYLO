import React, { useState, useId, forwardRef } from 'react';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string | null;
  helperText?: string;
  showStrengthMeter?: boolean;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      error,
      helperText,
      showStrengthMeter = false,
      leftIcon = <Lock className="w-4 h-4" />,
      id,
      required,
      disabled,
      className = '',
      containerClassName = '',
      value = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);

    // Password strength logic
    const passwordStr = String(value);
    const hasMinLength = passwordStr.length >= 8;
    const hasUppercase = /[A-Z]/.test(passwordStr);
    const hasLowercase = /[a-z]/.test(passwordStr);
    const hasNumber = /[0-9]/.test(passwordStr);
    const hasSpecial = /[@$!%*?&#_]/.test(passwordStr);

    const criteriaCount = [
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
    ].filter(Boolean).length;

    const getStrengthMeta = () => {
      if (!passwordStr) return { label: 'Empty', color: 'bg-slate-200', text: 'text-slate-400', width: '0%' };
      if (criteriaCount <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600', width: '25%' };
      if (criteriaCount === 3) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: '50%' };
      if (criteriaCount === 4) return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600', width: '75%' };
      return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600', width: '100%' };
    };

    const strength = getStrengthMeta();

    return (
      <div className={`w-full ${containerClassName}`}>
        {/* Label & Optional Strength badge */}
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800">
              {label}
              {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
            </label>
          )}
          {showStrengthMeter && passwordStr && (
            <span className={`text-[11px] font-bold ${strength.text}`}>
              Strength: {strength.label}
            </span>
          )}
        </div>

        {/* Input & Visibility Toggle */}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            value={value}
            disabled={disabled}
            required={required}
            className={`w-full py-2.5 text-sm rounded-md transition-colors placeholder:text-slate-400 bg-white ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } pr-10 ${
              error
                ? 'border border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-900'
                : 'border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900'
            } ${
              disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            className="absolute right-3 p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Real-time Strength Meter & Checklist */}
        {showStrengthMeter && passwordStr && (
          <div className="mt-2 space-y-2">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: strength.width }}
              />
            </div>

            <div className="grid grid-cols-2 gap-1 pt-0.5 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasMinLength ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                <span>8+ chars</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasUppercase ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                <span>Uppercase (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasNumber ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                <span>Number (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasSpecial ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                <span>Symbol (@$!%*?&#)</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && !showStrengthMeter && (
          <p className="mt-1 text-xs text-slate-500 leading-normal">{helperText}</p>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';
export default PasswordField;
