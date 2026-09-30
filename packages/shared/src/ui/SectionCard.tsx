import React from 'react';

export interface SectionCardProps {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Right-aligned header content (status badge, button) */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/** Bordered panel with a header, used for settings sections and dashboard blocks. */
export const SectionCard: React.FC<SectionCardProps> = ({ title, description, icon, aside, children, className = '' }) => (
  <section className={`bg-white border border-slate-200 rounded-md ${className}`}>
    <header className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{description}</p>}
        </div>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
    {children && <div className="p-5">{children}</div>}
  </section>
);

export default SectionCard;
