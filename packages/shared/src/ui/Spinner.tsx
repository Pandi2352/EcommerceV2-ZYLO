import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'primary' | 'cyan' | 'neutral' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  tone = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-[2.5px]',
    lg: 'w-9 h-9 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const toneClasses = {
    primary: 'border-indigo-100 border-t-indigo-600',
    cyan: 'border-cyan-100 border-t-cyan-500',
    neutral: 'border-slate-200 border-t-slate-700',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div
      className={`inline-block rounded-full animate-spin transition-all ${sizeClasses[size]} ${toneClasses[tone]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export interface ApiLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  tone?: 'primary' | 'cyan' | 'neutral';
  minHeight?: string;
  className?: string;
}

/**
 * Dedicated, sleek spinner loader for API requests in the outlet area.
 * Replaces the heavy website mascot loader for tables, cards, and data panels.
 */
export const ApiLoader: React.FC<ApiLoaderProps> = ({
  size = 'md',
  text,
  tone = 'primary',
  minHeight = 'min-h-[220px]',
  className = '',
}) => {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'xl' : 'md';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div
      className={`w-full flex flex-col items-center justify-center p-8 ${minHeight} select-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle accent ring */}
        <div className="absolute w-10 h-10 rounded-full bg-indigo-500/10 animate-ping opacity-60" />
        <Spinner size={spinnerSize} tone={tone} />
      </div>

      {text && (
        <p className={`mt-3.5 font-medium text-slate-500 tracking-tight ${textSize}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default ApiLoader;
