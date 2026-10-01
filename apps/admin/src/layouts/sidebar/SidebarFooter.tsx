import React from 'react';
import { ExternalLink, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../routes/routePaths';
import { STOREFRONT_URL } from '../../config/portal';
import { toast } from '@shared/ui/Toast';

export interface SidebarFooterProps {
  isCollapsed?: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ isCollapsed = false }) => {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    toast.info('You have signed out from the console.');
  };

  if (isCollapsed) {
    return (
      <div className="p-2 border-t border-slate-800/80 bg-[#171a23] flex flex-col items-center gap-1.5 shrink-0">
        {/* Settings Icon Link with Tooltip */}
        <div className="relative group">
          <Link
            to={ROUTES.ACCOUNT}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="My account & 2FA"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-0.5 rounded bg-[#1a1d2e] border border-slate-700/80 text-white text-[11px] font-semibold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            My account &amp; 2FA
          </div>
        </div>

        {/* Logout Button with Tooltip */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-8 h-8 rounded-md flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-0.5 rounded bg-[#1a1d2e] border border-slate-700/80 text-white text-[11px] font-semibold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            Sign Out
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-slate-800/80 bg-[#171a23] space-y-2 shrink-0">
      {/* Storefront Link */}
      <a
        href={STOREFRONT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
      >
        <span>Customer Storefront</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      {/* Account Settings & Sign Out Row */}
      <div className="flex items-center justify-between pt-1">
        <Link
          to={ROUTES.ACCOUNT}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors truncate max-w-[130px]"
          title="My account & 2FA"
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{user?.name ? user.name.split(' ')[0] : 'Settings'}</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarFooter;
