import type { UserRole } from './roles';
import { USER_ROLES } from './roles';

export const PERMISSION_MODULES = [
  'catalog',
  'orders',
  'customers',
  'marketing',
  'staff',
  'platform',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export interface SystemPermissionDef {
  id: string;
  module: PermissionModule;
  label: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermissionDef[] = [
  // Catalog
  {
    id: 'catalog:view',
    module: 'catalog',
    label: 'View Catalog',
    description: 'Browse products, categories, brands, and inventory levels',
  },
  {
    id: 'catalog:manage',
    module: 'catalog',
    label: 'Manage Catalog',
    description: 'Create, update, and manage products, categories, and stock',
  },
  {
    id: 'catalog:delete',
    module: 'catalog',
    label: 'Delete Catalog Items',
    description: 'Permanently remove products, categories, or brands',
  },

  // Orders
  {
    id: 'orders:view',
    module: 'orders',
    label: 'View Orders',
    description: 'Inspect customer orders, line items, and invoices',
  },
  {
    id: 'orders:manage',
    module: 'orders',
    label: 'Fulfill & Update Orders',
    description: 'Change order status, dispatch shipments, and manage deliveries',
  },
  {
    id: 'orders:refund',
    module: 'orders',
    label: 'Process Refunds & Cancellations',
    description: 'Approve returns, issue customer refunds, and cancel orders',
  },

  // Customers
  {
    id: 'customers:view',
    module: 'customers',
    label: 'View Customers',
    description: 'View customer directory, registration history, and order count',
  },
  {
    id: 'customers:manage',
    module: 'customers',
    label: 'Manage Customers',
    description: 'Edit customer information, manage statuses, and resolve accounts',
  },

  // Marketing
  {
    id: 'marketing:view',
    module: 'marketing',
    label: 'View Promotions & Coupons',
    description: 'Review active discounts, promo codes, and flash sale metrics',
  },
  {
    id: 'marketing:manage',
    module: 'marketing',
    label: 'Manage Promotions & Coupons',
    description: 'Create, configure, and publish promotional vouchers and banners',
  },

  // Staff & User Management
  {
    id: 'staff:view',
    module: 'staff',
    label: 'View Staff & Admins',
    description: 'Inspect the list of administrators, staff users, and invitations',
  },
  {
    id: 'staff:invite',
    module: 'staff',
    label: 'Invite Team Members',
    description: 'Issue invitations to new administrators and assign initial roles',
  },
  {
    id: 'staff:manage',
    module: 'staff',
    label: 'Manage Roles & Permissions',
    description: 'Update roles, override permissions, and suspend or reactivate staff',
  },

  // Platform & Security
  {
    id: 'audit:view',
    module: 'platform',
    label: 'View Security Audit Logs',
    description: 'Access the immutable security event trail, IPs, and login history',
  },
  {
    id: 'settings:manage',
    module: 'platform',
    label: 'Manage Platform Settings',
    description: 'Configure payment gateways, shipping methods, and store policies',
  },
];

export const PERMISSION_MODULE_LABELS: Record<PermissionModule, string> = {
  catalog: 'Product Catalog',
  orders: 'Orders & Sales',
  customers: 'Customer Accounts',
  marketing: 'Marketing & Discounts',
  staff: 'Staff & User Management',
  platform: 'Platform & Security',
};

/**
 * Standard default permissions matrix per role
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  [USER_ROLES.CUSTOMER]: [],
  [USER_ROLES.SUPPORT_AGENT]: [
    'catalog:view',
    'orders:view',
    'orders:manage',
    'customers:view',
  ],
  [USER_ROLES.MANAGER]: [
    'catalog:view',
    'catalog:manage',
    'orders:view',
    'orders:manage',
    'orders:refund',
    'customers:view',
    'marketing:view',
    'marketing:manage',
  ],
  [USER_ROLES.ADMIN]: [
    'catalog:view',
    'catalog:manage',
    'catalog:delete',
    'orders:view',
    'orders:manage',
    'orders:refund',
    'customers:view',
    'customers:manage',
    'marketing:view',
    'marketing:manage',
    'staff:view',
    'staff:invite',
    'staff:manage',
    'audit:view',
  ],
  [USER_ROLES.SUPER_ADMIN]: SYSTEM_PERMISSIONS.map((p) => p.id),
};
