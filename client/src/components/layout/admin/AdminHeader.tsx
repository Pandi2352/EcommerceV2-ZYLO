import React from 'react';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes/routePaths';
import { useAuth } from '../../../context/AuthContext';

export interface AdminHeaderProps {
  onOpenMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400">Portal</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Console</span>
        </div>
      </div>

      {/* Right: Quick actions & System Health */}
      <div className="flex items-center gap-4">
        {/* System Health Status */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Healthy</span>
        </div>

        {/* View Customer Storefront */}
        <Link
          to={ROUTES.CUSTOMER.HOME}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Current User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <ShieldCheck className="w-4 h-4 text-[#2A3B5C]" />
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            {user?.name || 'Staff User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
