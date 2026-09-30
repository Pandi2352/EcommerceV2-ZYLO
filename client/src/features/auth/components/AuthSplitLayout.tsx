import React from 'react';
import CustomerLayout from '../../../components/layout/CustomerLayout';

export interface AuthSplitLayoutProps {
  title: string;
  subtitle: string;
  /** Page-level banner above the columns (errors, OAuth failures) */
  banner?: React.ReactNode;
  children: React.ReactNode;
  /** Right column (social sign-in). The form spans the full width when absent. */
  aside?: React.ReactNode;
  showRail?: boolean;
}

/** Storefront sign-in / sign-up shell: form on the left, social sign-in on the right. */
export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  title,
  subtitle,
  banner,
  children,
  aside,
  showRail = false,
}) => (
  <CustomerLayout showRail={showRail}>
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
      {banner && <div className="max-w-2xl mb-6">{banner}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className={aside ? 'lg:col-span-7' : 'lg:col-span-7 lg:col-start-3'}>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal">{subtitle}</p>
          </div>
          {children}
        </div>

        {aside && <div className="lg:col-span-5 lg:pt-14 flex items-center justify-center">{aside}</div>}
      </div>
    </div>
  </CustomerLayout>
);

export default AuthSplitLayout;
