import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Grid,
  ShoppingBag,
  Maximize2,
  Moon,
  Sun,
  Bell,
  User as UserIcon,
  Settings,
  Lock,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { toast } from '@shared/ui/Toast';

export interface NavbarProps {
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleCollapse,
  onOpenMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [appsDropdownOpen, setAppsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(e.target as Node)) {
        setAppsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const displayName = user?.name || 'Anna Adame';
  const roleName =
    user?.role === 'SUPER_ADMIN'
      ? 'Founder'
      : user?.role === 'ADMIN'
      ? 'Administrator'
      : 'Staff';

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Menu button & Search (No breadcrumbs) */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Navigation Sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Box */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="w-full bg-[#f3f3f9] hover:bg-[#eaeaf3] focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 placeholder:text-xs placeholder:font-normal rounded-md py-2 pl-9 pr-4 border border-transparent focus:border-slate-300 focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Tools & Account Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Flag Selector (USA) */}
        <button
          type="button"
          className="p-2 rounded-md hover:bg-slate-100 text-sm transition-colors cursor-pointer"
          title="Language: English (US)"
        >
          <span className="text-base leading-none">🇺🇸</span>
        </button>

        {/* Quick App Launcher Grid */}
        <div className="relative" ref={appsRef}>
          <button
            type="button"
            onClick={() => setAppsDropdownOpen((prev) => !prev)}
            className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="App Launcher"
          >
            <Grid className="w-4.5 h-4.5" />
          </button>

          {appsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-md p-3 z-50 animate-in fade-in duration-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Modules
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Link
                  to={ROUTES.PRODUCTS}
                  onClick={() => setAppsDropdownOpen(false)}
                  className="p-2 rounded-md hover:bg-slate-50 text-slate-700 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">📦</span>
                  <span>Products</span>
                </Link>
                <Link
                  to={ROUTES.ORDERS}
                  onClick={() => setAppsDropdownOpen(false)}
                  className="p-2 rounded-md hover:bg-slate-50 text-slate-700 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">🛒</span>
                  <span>Orders</span>
                </Link>
                <Link
                  to={ROUTES.CUSTOMERS}
                  onClick={() => setAppsDropdownOpen(false)}
                  className="p-2 rounded-md hover:bg-slate-50 text-slate-700 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">👥</span>
                  <span>Customers</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Shopping / Orders quick access badge */}
        <Link
          to={ROUTES.ORDERS}
          className="relative p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Recent Orders"
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#299cdb] text-white text-[9px] font-bold flex items-center justify-center">
            5
          </span>
        </Link>

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={handleFullscreen}
          className="hidden md:flex p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4.5 h-4.5" />
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={() => {
            const nextMode = !isDarkMode;
            setIsDarkMode(nextMode);
            toast.info(nextMode ? 'Switched to Dark mode' : 'Switched to Light mode');
          }}
          className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => toast.info('You have 3 unread store alerts')}
          className="relative p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#f06548] text-white text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* Settings & Account Profile */}
        <div className="relative pl-1 sm:pl-2" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="User Account Menu"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name & Role */}
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">
                {roleName}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {/* Profile & Settings Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-md shadow-md py-1 z-50 animate-in fade-in duration-100 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'admin@zylo.internal'}
                </p>
              </div>

              <Link
                to={ROUTES.SETTINGS}
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to={ROUTES.SETTINGS}
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings</span>
              </Link>

              <Link
                to={ROUTES.AUDIT_LOGS}
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Security & Logs</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                  toast.info('You have signed out from the console.');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
