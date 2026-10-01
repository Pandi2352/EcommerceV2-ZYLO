import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'social';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Zero-shadow styling adhering to clean borders and rounded-md
    const variantStyles: Record<ButtonVariant, string> = {
      // Primary matches the deep navy/slate blue action button in the reference screenshot
      primary:
        'bg-[#2A3B5C] hover:bg-[#1E2B43] active:bg-[#151E30] text-white border border-transparent font-semibold',
      secondary:
        'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 font-medium',
      outline:
        'bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-800 border border-zinc-200 hover:border-zinc-300 font-medium',
      ghost:
        'bg-transparent hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 border border-transparent font-medium',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border border-transparent font-semibold',
      social:
        'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-medium',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'h-7 px-2 text-xs gap-1 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5',
      sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5',
      md: 'py-2.5 px-4 text-sm gap-2 rounded-md',
      lg: 'py-3.5 px-6 text-base gap-2.5 rounded-md',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`inline-flex items-center justify-center transition-all duration-150 select-none ${
          fullWidth ? 'w-full' : ''
        } ${variantStyles[variant]} ${sizeStyles[size]} ${
          isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
