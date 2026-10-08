import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  UserCheck,
  FolderTree,
  Award,
  Mail,
  Building2,
  RotateCcw,
} from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import type { SubPageItem } from './SidebarGroup';

/**
 * Shared styling constants and theme tokens for the Velzon sidebar
 */
export const SIDEBAR_DIMENSIONS = {
  expandedWidth: 'w-[224px]',
  collapsedWidth: 'w-[60px]',
  mainPlExpanded: 'md:pl-[224px]',
  mainPlCollapsed: 'md:pl-[60px]',
  collapsedFlyoutLeft: 'left-[60px]',
} as const;

export const SIDEBAR_CLASSES = {
  // Aside container
  aside:
    'h-full bg-[#1e222d] text-slate-300 border-r border-slate-800 flex flex-col select-none transition-all duration-200',

  // Brand header
  header:
    'h-16 px-3.5 flex items-center border-b border-slate-800/80 shrink-0',

  // Section title
  sectionTitle:
    'px-3.5 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider',

  // Item trigger in expanded view
  itemTrigger:
    'w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12.5px] font-medium transition-colors cursor-pointer',
  itemTriggerActive: 'text-white',
  itemTriggerInactive: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',

  // Single link in expanded view
  navLink:
    'w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12.5px] font-medium transition-colors cursor-pointer',
  navLinkActive: 'text-white bg-slate-800/80 font-bold',
  navLinkInactive: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',

  // Submenu link in expanded view
  subNavLink:
    'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-normal transition-colors cursor-pointer',
  subNavLinkActive: 'text-white font-bold bg-slate-800',
  subNavLinkInactive: 'text-slate-400 hover:text-white hover:bg-slate-800/40',

  // Collapsed rail icon button
  railButton:
    'w-8 h-8 mx-auto rounded-md flex items-center justify-center transition-colors cursor-pointer',
  railButtonActive: 'bg-slate-800 text-white',
  railButtonInactive: 'text-slate-400 hover:text-white hover:bg-slate-800/60',

  // Floating flyout popup card in collapsed mode
  flyoutContainer:
    'fixed left-[60px] w-44 bg-[#1a1d2e] border-r border-b border-t border-slate-700/80 shadow-2xl z-50 animate-in fade-in duration-100 select-none text-left',
  flyoutHeader:
    'flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80',
  flyoutLink:
    'block px-2.5 py-1.5 rounded-sm text-xs transition-colors cursor-pointer',
  flyoutLinkActive: 'text-white font-bold bg-slate-800/90',
  flyoutLinkInactive: 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-normal',
} as const;

export interface NavGroupConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  pages: SubPageItem[];
  badge?: {
    text: string;
    color: string;
  };
}

export interface NavSectionConfig {
  title: string;
  items: NavGroupConfig[];
}

export const ADMIN_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: 'MENU',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        pages: [
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
        ],
      },
      {
        id: 'categories',
        label: 'Categories',
        icon: FolderTree,
        pages: [
          { label: 'Overview', to: ROUTES.CATEGORIES_OVERVIEW },
          { label: 'Taxonomy & List', to: ROUTES.CATEGORIES },
        ],
      },
      {
        id: 'brands',
        label: 'Brands',
        icon: Award,
        pages: [
          { label: 'Brand Directory', to: ROUTES.BRANDS },
        ],
      },
      {
        id: 'catalog',
        label: 'Product Catalog',
        icon: Package,
        pages: [
          { label: 'Overview', to: ROUTES.PRODUCTS_OVERVIEW },
          { label: 'All Products', to: ROUTES.PRODUCTS },
          { label: 'Inventory Control', to: ROUTES.INVENTORY },
          { label: 'Bundles & Kits', to: ROUTES.BUNDLES },
        ],
      },
      {
        id: 'warehouses',
        label: 'Warehouses',
        icon: Building2,
        pages: [
          { label: 'Fulfillment Centers', to: ROUTES.WAREHOUSES },
          { label: 'Stock Transfers', to: ROUTES.STOCK_TRANSFERS },
        ],
      },
      {
        id: 'orders',
        label: 'Orders & Sales',
        icon: ShoppingCart,
        pages: [
          { label: 'All Orders', to: ROUTES.ORDERS },
          { label: 'Returns & Refunds', to: ROUTES.RETURNS },
        ],
      },
      {
        id: 'customers',
        label: 'Customers',
        icon: Users,
        pages: [
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
        id: 'coupons',
        label: 'Coupons & Vouchers',
        icon: Tag,
        pages: [
          { label: 'Coupons & Vouchers', to: ROUTES.COUPONS },
        ],
      },
      {
        id: 'abandoned-carts',
        label: 'Abandoned Carts',
        icon: RotateCcw,
        pages: [
          { label: 'Abandoned Carts', to: ROUTES.ABANDONED_CARTS },
        ],
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      {
        id: 'user-management',
        label: 'User Management',
        icon: UserCheck,
        pages: [
          { label: 'Overview', to: ROUTES.USER_MANAGEMENT_OVERVIEW },
          { label: 'Users', to: ROUTES.USERS },
          { label: 'Roles', to: ROUTES.ROLES },
          { label: 'Invitations', to: ROUTES.INVITATIONS },
          { label: 'Login Activity', to: ROUTES.LOGIN_ACTIVITY },
          { label: 'Security Logs', to: ROUTES.AUDIT_LOGS },
        ],
      },
      {
        id: 'email-templates',
        label: 'Email Templates',
        icon: Mail,
        pages: [
          { label: 'Email Templates', to: ROUTES.EMAIL_TEMPLATES },
        ],
      },
      {
        id: 'settings',
        label: 'Store Settings',
        icon: Settings,
        pages: [
          { label: 'Store Settings', to: ROUTES.SETTINGS },
        ],
      },
    ],
  },
];
