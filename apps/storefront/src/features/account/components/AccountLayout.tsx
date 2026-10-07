import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { User, MapPin, ShieldCheck, ChevronRight, Package } from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../../routes/routePaths';

interface AccountLayoutProps {
  children?: React.ReactNode;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  const navItems = [
    {
      to: ROUTES.CUSTOMER.ORDERS,
      label: 'My Orders',
      icon: Package,
      description: 'Order tracking & purchase history',
    },
    {
      to: ROUTES.CUSTOMER.PROFILE,
      label: 'My Profile',
      icon: User,
      description: 'Personal info & contact details',
    },
    {
      to: ROUTES.CUSTOMER.ADDRESSES,
      label: 'Saved Addresses',
      icon: MapPin,
      description: 'Shipping & delivery destinations',
    },
    {
      to: ROUTES.CUSTOMER.SECURITY,
      label: 'Security & Sign-in',
      icon: ShieldCheck,
      description: 'Password, 2FA & sessions',
    },
  ];

  return (
    <div className="min-h-[80vh] bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link to={ROUTES.CUSTOMER.HOME} className="hover:text-slate-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-medium">My Account</span>
        </nav>

        {/* User Quick Header */}
        <div className="bg-white border border-slate-200 rounded-md p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
                {user?.isEmailVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 mb-6 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-amber-600 text-amber-600 bg-amber-50/40 rounded-t-md'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Page Content */}
        <div>{children || <Outlet />}</div>
      </div>
    </div>
  );
};

export default AccountLayout;
