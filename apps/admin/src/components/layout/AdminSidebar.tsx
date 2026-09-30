import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../routes/routePaths';
import { STOREFRONT_URL } from '../../config/portal';

export interface AdminSidebarProps {
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
}

interface SubMenuItem {
  label: string;
  to: string;
  badge?: {
    text: string;
    color: string;
  };
}

interface MenuItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: {
    text: string;
    color: string;
  };
  children?: SubMenuItem[];
  to?: string;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'MENU',
    items: [
      {
        id: 'dashboards',
        label: 'Dashboards',
        icon: LayoutDashboard,
        children: [
          { label: 'Ecommerce', to: ROUTES.DASHBOARD },
          { label: 'Sales Analytics', to: ROUTES.DASHBOARDS_ANALYTICS },
        ],
      },
      {
        id: 'catalog',
        label: 'Product Catalog',
        icon: Package,
        children: [
          { label: 'All Products', to: ROUTES.PRODUCTS },
          { label: 'Categories', to: ROUTES.CATEGORIES },
          { label: 'Brands', to: ROUTES.BRANDS },
          { label: 'Inventory & Stock', to: ROUTES.INVENTORY },
        ],
      },
      {
        id: 'orders',
        label: 'Orders & Sales',
        icon: ShoppingCart,
        children: [
          { label: 'All Orders', to: ROUTES.ORDERS },
          { label: 'Shipments & Tracking', to: ROUTES.SHIPMENTS },
          {
            label: 'Returns & Refunds',
            to: ROUTES.RETURNS,
            badge: { text: 'New', color: 'bg-emerald-500/20 text-emerald-400' },
          },
          { label: 'Invoices', to: ROUTES.INVOICES },
        ],
      },
      {
        id: 'customers',
        label: 'Customers',
        icon: Users,
        children: [
          { label: 'Customer Directory', to: ROUTES.CUSTOMERS },
          { label: 'Reviews & Ratings', to: ROUTES.REVIEWS },
        ],
      },
    ],
  },
  {
    title: 'MARKETING',
    items: [
      {
        id: 'marketing',
        label: 'Promotions',
        icon: Tag,
        children: [
          { label: 'Coupons & Vouchers', to: ROUTES.COUPONS },
          {
            label: 'Flash Deals',
            to: ROUTES.PROMOTIONS,
            badge: { text: 'Hot', color: 'bg-orange-500/20 text-orange-400' },
          },
        ],
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      {
        id: 'security',
        label: 'Staff & Security',
        icon: ShieldCheck,
        children: [
          { label: 'Staff Accounts', to: ROUTES.STAFF },
          { label: 'Security & Audit Logs', to: ROUTES.AUDIT_LOGS },
          { label: 'My Account & 2FA', to: ROUTES.SETTINGS },
        ],
      },
      {
        id: 'settings',
        label: 'Store Settings',
        icon: Settings,
        children: [
          { label: 'General Settings', to: ROUTES.SETTINGS },
          { label: 'Payment Gateways', to: ROUTES.SETTINGS_PAYMENTS },
          { label: 'Shipping Methods', to: ROUTES.SETTINGS_SHIPPING },
        ],
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed = false,
  onCloseMobile,
}) => {
  const { logout } = useAuth();
  const location = useLocation();

  // Expanded menu accordion tracking
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    dashboards: true,
  });

  // Active flyout state for collapsed icon mode
  const [activeFlyout, setActiveFlyout] = useState<{
    item: MenuItem;
    top: number;
  } | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isRouteActive = (to?: string) => {
    if (!to) return false;
    if (to === ROUTES.DASHBOARD && location.pathname === '/') return true;
    return location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  };

  const handleIconMouseEnter = (
    item: MenuItem,
    e: React.MouseEvent<HTMLElement>
  ) => {
    if (!isCollapsed || !item.children || item.children.length === 0) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setActiveFlyout(null);
      return;
    }

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    // Clamp top position so flyout stays cleanly on screen
    const flyoutEstimatedHeight = (item.children.length + 1) * 36 + 60;
    const maxTop = window.innerHeight - flyoutEstimatedHeight - 20;
    const computedTop = Math.max(64, Math.min(rect.top, maxTop));

    setActiveFlyout({
      item,
      top: computedTop,
    });
  };

  const handleIconMouseLeave = () => {
    if (!isCollapsed) return;
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 180);
  };

  const handleFlyoutMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleFlyoutMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 180);
  };

  return (
    <aside
      className={`h-full bg-[#1e222d] text-slate-300 border-r border-slate-800 flex flex-col select-none transition-all duration-200 ${
        isCollapsed ? 'w-[60px]' : 'w-[224px]'
      }`}
    >
      {/* Brand Logo Header */}
      <div className="h-16 px-3.5 flex items-center border-b border-slate-800/80 shrink-0">
        <Link
          to={ROUTES.DASHBOARD}
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 mx-auto lg:mx-0 cursor-pointer overflow-hidden"
        >
          {/* Cyan / Turquoise Loop Icon matching screenshot */}
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-900 font-black shrink-0">
            <svg
              className="w-4 h-4 text-[#1e222d]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>

          {/* Logo Text (hidden when collapsed) */}
          {!isCollapsed && (
            <span className="font-black text-base tracking-wider text-white">
              VELZON
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 py-3 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
        {MENU_SECTIONS.map((section, sIdx) => (
          <div key={section.title} className="space-y-0.5">
            {/* Section Header or separator dots in collapsed mode */}
            {!isCollapsed ? (
              <p className="px-3.5 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
            ) : sIdx > 0 ? (
              <div className="py-1 flex justify-center">
                <MoreHorizontal className="w-3 h-3 text-slate-600" />
              </div>
            ) : null}

            {/* Menu Items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.id];
              const isItemActive =
                isRouteActive(item.to) ||
                item.children?.some((child) => isRouteActive(child.to));

              return (
                <div
                  key={item.id}
                  className="px-2"
                  onMouseEnter={(e) => handleIconMouseEnter(item, e)}
                  onMouseLeave={handleIconMouseLeave}
                >
                  {/* Collapsed Rail View */}
                  {isCollapsed ? (
                    <div>
                      {item.to && !hasChildren ? (
                        <NavLink
                          to={item.to}
                          onClick={onCloseMobile}
                          title={item.label}
                          className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                            isItemActive
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </NavLink>
                      ) : (
                        <button
                          type="button"
                          title={item.label}
                          className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                            isItemActive || activeFlyout?.item.id === item.id
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Expanded Sidebar View */
                    <div>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12.5px] font-medium transition-colors cursor-pointer ${
                            isItemActive
                              ? 'text-white'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          )}
                        </button>
                      ) : (
                        <NavLink
                          to={item.to || ROUTES.DASHBOARD}
                          onClick={onCloseMobile}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12.5px] font-medium transition-colors cursor-pointer ${
                            isItemActive
                              ? 'text-white bg-slate-800/80 font-bold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.badge.color}`}
                            >
                              {item.badge.text}
                            </span>
                          )}
                        </NavLink>
                      )}

                      {/* Sub-menu accordion */}
                      {hasChildren && isOpen && (
                        <div className="pl-6 pr-2 py-1 space-y-0.5">
                          {item.children?.map((sub) => {
                            const isSubActive =
                              location.pathname === sub.to ||
                              (sub.to === ROUTES.DASHBOARDS_ECOMMERCE &&
                                (location.pathname === '/' ||
                                  location.pathname === ROUTES.DASHBOARDS_ECOMMERCE));

                            return (
                              <NavLink
                                key={sub.to}
                                to={sub.to}
                                onClick={onCloseMobile}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-normal transition-colors cursor-pointer ${
                                  isSubActive
                                    ? 'text-white font-bold bg-slate-800'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-0.5 bg-slate-500 rounded" />
                                  <span>{sub.label}</span>
                                </span>
                                {sub.badge && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sub.badge.color}`}
                                  >
                                    {sub.badge.text}
                                  </span>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Storefront Link & Signout Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-[#171a23] space-y-2">
          <a
            href={STOREFRONT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Floating Submenu in Collapsed Mode matching uploaded image */}
      {isCollapsed && activeFlyout && (
        <div
          className="fixed left-[60px] w-44 bg-[#1a1d2e] border-r border-b border-t border-slate-700/80 shadow-2xl z-50 animate-in fade-in duration-100 select-none text-left"
          style={{ top: activeFlyout.top }}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          {/* Header matching user image */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80">
            <span className="text-[12.5px] font-bold text-white tracking-wide">
              {activeFlyout.item.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Submenu links */}
          <div className="py-1.5 px-2 space-y-0.5">
            {activeFlyout.item.children?.map((sub) => {
              const isActive =
                location.pathname === sub.to ||
                (sub.to === ROUTES.DASHBOARDS_ECOMMERCE &&
                  (location.pathname === '/' ||
                    location.pathname === ROUTES.DASHBOARDS_ECOMMERCE));

              return (
                <Link
                  key={sub.to}
                  to={sub.to}
                  onClick={() => {
                    setActiveFlyout(null);
                    onCloseMobile?.();
                  }}
                  className={`block px-2.5 py-1.5 rounded-sm text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'text-white font-bold bg-slate-800/90'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-normal'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{sub.label}</span>
                    {sub.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${sub.badge.color}`}
                      >
                        {sub.badge.text}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
