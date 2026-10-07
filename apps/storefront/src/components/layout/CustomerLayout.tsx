import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import CustomerNavbar from './CustomerNavbar';
import SubNavBar from './SubNavBar';
import CategoryRail from './CategoryRail';
import Footer from './Footer';
import EmailVerificationBanner from '../../features/auth/components/EmailVerificationBanner';

export interface CustomerLayoutProps {
  children?: React.ReactNode;
  showRail?: boolean;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  showRail = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      {/* Top utility announcement bar */}
      <TopBar />

      {/* Main search and customer action navbar */}
      <CustomerNavbar />

      {/* Sub category and navigation bar */}
      <SubNavBar />

      <EmailVerificationBanner />

      {/* Main content wrapper */}
      <div className="flex-1 flex w-full">
        {showRail && <CategoryRail />}
        <main className="flex-1 min-w-0 bg-white">
          {children || <Outlet />}
        </main>
      </div>

      {/* Global store footer */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
