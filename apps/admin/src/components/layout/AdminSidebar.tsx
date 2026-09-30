import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ScrollText,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import ZyloLogo from '@shared/ui/ZyloLogo';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../routes/routePaths';
import { STOREFRONT_URL } from '../../config/portal';
import { ROLE_LABELS, USER_ROLES, roleSatisfies, type UserRole } from '@shared/constants/roles';

export interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  /** Minimum staff role that sees the item (defaults to every staff role) */
  minRole?: UserRole;
}

const navItems: NavItem[] = [
  { label: 'Overview', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Products', to: ROUTES.PRODUCTS, icon: Package, minRole: USER_ROLES.ADMIN },
  { label: 'Categories', to: ROUTES.CATEGORIES, icon: FolderTree, minRole: USER_ROLES.ADMIN },
  { label: 'Orders', to: ROUTES.ORDERS, icon: ShoppingCart },
  { label: 'Customers', to: ROUTES.CUSTOMERS, icon: Users },
  { label: 'Analytics', to: ROUTES.ANALYTICS, icon: BarChart3, minRole: USER_ROLES.ADMIN },
  { label: 'Security Logs', to: ROUTES.AUDIT_LOGS, icon: ScrollText, minRole: USER_ROLES.ADMIN },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2 cursor-pointer">
          <ZyloLogo variant="full" size="md" theme="light" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management Console
        </p>

        {navItems
          .filter((item) => !item.minRole || (user && roleSatisfies(user.role, item.minRole)))
          .map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.DASHBOARD}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-[#2A3B5C] font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Quick Storefront Link */}
      <div className="px-4 py-3 border-t border-slate-100">
        <a
          href={STOREFRONT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>View Storefront</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#2A3B5C] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-500 truncate leading-tight">
              {user ? ROLE_LABELS[user.role] : 'Staff'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          title="Sign Out"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
