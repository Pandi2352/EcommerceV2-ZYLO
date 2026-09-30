import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import CustomerNavbar from './CustomerNavbar';
import CategoryRail from './CategoryRail';
import EmailVerificationBanner from '../../features/auth/components/EmailVerificationBanner';

export interface CustomerLayoutProps {
  children?: React.ReactNode;
  showRail?: boolean;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  showRail = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      {/* Top utility bar */}
      <TopBar />

      {/* Main customer navbar */}
      <CustomerNavbar />
      <EmailVerificationBanner />

      {/* Content wrapper with optional left category icon rail */}
      <div className="flex-1 flex w-full">
        {showRail && <CategoryRail />}
        <main className="flex-1 min-w-0 bg-white">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
