import React, { useState, useId, forwardRef } from 'react';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { evaluatePassword, type PasswordStrength } from '../utils/passwordPolicy';

const STRENGTH_META: Record<PasswordStrength, { label: string; color: string; text: string; width: string }> = {
  empty: { label: 'Empty', color: 'bg-slate-200', text: 'text-slate-400', width: '0%' },
  weak: { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600', width: '25%' },
  fair: { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: '50%' },
  good: { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600', width: '75%' },
  strong: { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600', width: '100%' },
};

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

    const passwordStr = String(value);
    const evaluation = evaluatePassword(passwordStr);
    const strength = STRENGTH_META[evaluation.strength];

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
            className={`w-full py-2.5 text-sm rounded-md transition-colors placeholder:text-slate-400 bg-white outline-none focus:outline-none focus:ring-0 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } pr-10 ${
              error
                ? 'border border-rose-300 focus:border-rose-400 text-slate-900 bg-rose-50/20'
                : 'border border-slate-200 focus:border-slate-400 text-slate-900'
            } ${
              disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            className="absolute right-3 p-1 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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

            <ul className="grid grid-cols-2 gap-1 pt-0.5 text-[11px]">
              {evaluation.results.map(({ rule, passed }) => (
                <li key={rule.id} className={`flex items-center gap-1.5 ${passed ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {passed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
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
