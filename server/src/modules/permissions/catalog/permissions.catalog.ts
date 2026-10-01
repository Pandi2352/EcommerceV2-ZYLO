export interface PermissionDef {
  action: string;
  name: string;
  description: string;
  sensitive?: boolean;
}

export interface PermissionGroupDef {
  group: string;
  module: string;
  permissions: readonly PermissionDef[];
}

export const PERMISSION_CATALOG = [
  {
    group: 'Overview',
    module: 'dashboard',
    permissions: [
      { action: 'view', name: 'View Dashboard', description: 'Access administrative dashboard KPIs and overview charts' },
    ],
  },
  {
    group: 'Access Control',
    module: 'users',
    permissions: [
      { action: 'view', name: 'View Staff Users', description: 'Browse staff administrator accounts and profile details' },
      { action: 'invite', name: 'Invite Staff', description: 'Send, resend, and revoke invitations for new staff members', sensitive: true },
      { action: 'edit', name: 'Edit Staff Profile', description: 'Update staff user profile information and reference codes' },
      { action: 'activate', name: 'Activate/Deactivate Staff', description: 'Suspend or restore staff console login access', sensitive: true },
      { action: 'delete', name: 'Delete Staff', description: 'Soft-delete staff administrators and terminate sessions', sensitive: true },
    ],
  },
  {
    group: 'Access Control',
    module: 'roles',
    permissions: [
      { action: 'view', name: 'View Roles', description: 'Browse roles, permission assignments, and assigned user counts' },
      { action: 'create', name: 'Create Roles', description: 'Create new custom administrative roles', sensitive: true },
      { action: 'edit', name: 'Edit Roles', description: 'Update role titles, descriptions, and active statuses', sensitive: true },
      { action: 'delete', name: 'Delete Roles', description: 'Delete unused custom roles from the platform', sensitive: true },
      { action: 'assign', name: 'Assign Permissions & Roles', description: 'Assign permissions to roles and assign roles to users', sensitive: true },
    ],
  },
  {
    group: 'Access Control',
    module: 'audit_logs',
    permissions: [
      { action: 'view', name: 'View Security Logs', description: 'Inspect security audit logs and administrative activity history' },
      { action: 'export', name: 'Export Security Logs', description: 'Export security audit records to external files', sensitive: true },
    ],
  },
  {
    group: 'Catalog',
    module: 'products',
    permissions: [
      { action: 'view', name: 'View Products', description: 'Browse product listings, variants, pricing, and media' },
      { action: 'create', name: 'Create Products', description: 'Create new catalog products, variants, and attribute sets' },
      { action: 'edit', name: 'Edit Products', description: 'Modify product specifications, imagery, tags, and prices' },
      { action: 'delete', name: 'Delete Products', description: 'Permanently remove products from the store catalog', sensitive: true },
      { action: 'publish', name: 'Publish Products', description: 'Change product publication status and storefront visibility' },
      { action: 'import', name: 'Import Products', description: 'Bulk import products via spreadsheet data feeds' },
      { action: 'export', name: 'Export Products', description: 'Export product catalog data' },
    ],
  },
  {
    group: 'Catalog',
    module: 'categories',
    permissions: [
      { action: 'view', name: 'View Categories', description: 'Browse category taxonomy and hierarchy' },
      { action: 'create', name: 'Create Categories', description: 'Create new categories and navigation nodes' },
      { action: 'edit', name: 'Edit Categories', description: 'Modify category names, banners, descriptions, and slugs' },
      { action: 'delete', name: 'Delete Categories', description: 'Delete store categories and reorganize child items', sensitive: true },
    ],
  },
  {
    group: 'Catalog',
    module: 'brands',
    permissions: [
      { action: 'view', name: 'View Brands', description: 'Browse brand directories and manufacturer profiles' },
      { action: 'create', name: 'Create Brands', description: 'Add new brand partners and logos' },
      { action: 'edit', name: 'Edit Brands', description: 'Modify brand profiles, stories, and showcase banners' },
      { action: 'delete', name: 'Delete Brands', description: 'Remove brand partners from the platform', sensitive: true },
    ],
  },
  {
    group: 'Catalog',
    module: 'inventory',
    permissions: [
      { action: 'view', name: 'View Inventory', description: 'Inspect stock levels, SKU quantities, and reserved balances' },
      { action: 'adjust', name: 'Adjust Stock Levels', description: 'Perform manual stock adjustments and count corrections', sensitive: true },
      { action: 'export', name: 'Export Inventory', description: 'Export stock ledger reports' },
    ],
  },
  {
    group: 'Sales',
    module: 'orders',
    permissions: [
      { action: 'view', name: 'View Orders', description: 'Browse customer orders, fulfillment statuses, and invoices' },
      { action: 'edit', name: 'Edit Orders', description: 'Update order shipping details, tracking numbers, and items' },
      { action: 'cancel', name: 'Cancel Orders', description: 'Cancel pending or unfulfilled customer orders', sensitive: true },
      { action: 'refund', name: 'Refund Orders', description: 'Issue partial or full payment refunds to customers', sensitive: true },
      { action: 'export', name: 'Export Orders', description: 'Export sales orders and shipping spreadsheets' },
    ],
  },
  {
    group: 'Sales',
    module: 'returns',
    permissions: [
      { action: 'view', name: 'View Returns', description: 'Browse return requests, warranties, and RMA requests' },
      { action: 'approve', name: 'Approve/Reject Returns', description: 'Authorize returns, inspection passes, and replacements', sensitive: true },
    ],
  },
  {
    group: 'Sales',
    module: 'payments',
    permissions: [
      { action: 'view', name: 'View Payments', description: 'Inspect payment transaction logs, charge statuses, and gateway receipts' },
    ],
  },
  {
    group: 'Customers',
    module: 'customers',
    permissions: [
      { action: 'view', name: 'View Customers', description: 'Browse storefront customer accounts, profiles, and order histories' },
      { action: 'edit', name: 'Edit Customer Profiles', description: 'Update customer contact info and delivery preferences' },
      { action: 'activate', name: 'Activate/Suspend Customers', description: 'Suspend or reactivate customer storefront accounts', sensitive: true },
      { action: 'export', name: 'Export Customer Directory', description: 'Export customer contact lists and cohort data' },
    ],
  },
  {
    group: 'Customers',
    module: 'reviews',
    permissions: [
      { action: 'view', name: 'View Reviews', description: 'Browse customer product reviews, ratings, and questions' },
      { action: 'approve', name: 'Approve/Moderate Reviews', description: 'Approve or reject customer product reviews for publication' },
      { action: 'delete', name: 'Delete Reviews', description: 'Remove abusive or invalid customer reviews', sensitive: true },
    ],
  },
  {
    group: 'Marketing',
    module: 'coupons',
    permissions: [
      { action: 'view', name: 'View Coupons', description: 'Browse promotional coupons, discount codes, and usage limits' },
      { action: 'create', name: 'Create Coupons', description: 'Create new promo discount codes and voucher campaigns' },
      { action: 'edit', name: 'Edit Coupons', description: 'Update coupon validity dates, discount percentages, and rules' },
      { action: 'delete', name: 'Delete Coupons', description: 'Delete discount coupons and end promotions', sensitive: true },
    ],
  },
  {
    group: 'Insights',
    module: 'reports',
    permissions: [
      { action: 'view', name: 'View Analytics & Reports', description: 'Inspect sales velocity, revenue trends, and operational metrics' },
      { action: 'export', name: 'Export Financial Reports', description: 'Export detailed financial and accounting spreadsheets' },
    ],
  },
  {
    group: 'System',
    module: 'settings',
    permissions: [
      { action: 'view', name: 'View Platform Settings', description: 'Inspect store configuration, currency settings, and integrations' },
      { action: 'edit', name: 'Edit Platform Settings', description: 'Update store settings, payment gateways, and security policies', sensitive: true },
    ],
  },
] as const satisfies readonly PermissionGroupDef[];

export type FlattenedCatalogPermission = {
  key: string;
  module: string;
  action: string;
  name: string;
  description: string;
  group: string;
  sortOrder: number;
  isSensitive: boolean;
};

export function getFlattenedCatalog(): FlattenedCatalogPermission[] {
  const result: FlattenedCatalogPermission[] = [];
  let sortOrder = 0;

  for (const groupDef of PERMISSION_CATALOG) {
    for (const perm of groupDef.permissions) {
      sortOrder += 10;
      result.push({
        key: `${groupDef.module}.${perm.action}`,
        module: groupDef.module,
        action: perm.action,
        name: perm.name,
        description: perm.description,
        group: groupDef.group,
        sortOrder,
        isSensitive: Boolean((perm as { sensitive?: boolean }).sensitive),
      });
    }
  }

  return result;
}

export type PermissionKey =
  | 'dashboard.view'
  | 'users.view'
  | 'users.invite'
  | 'users.edit'
  | 'users.activate'
  | 'users.delete'
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.delete'
  | 'roles.assign'
  | 'audit_logs.view'
  | 'audit_logs.export'
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.publish'
  | 'products.import'
  | 'products.export'
  | 'categories.view'
  | 'categories.create'
  | 'categories.edit'
  | 'categories.delete'
  | 'brands.view'
  | 'brands.create'
  | 'brands.edit'
  | 'brands.delete'
  | 'inventory.view'
  | 'inventory.adjust'
  | 'inventory.export'
  | 'orders.view'
  | 'orders.edit'
  | 'orders.cancel'
  | 'orders.refund'
  | 'orders.export'
  | 'returns.view'
  | 'returns.approve'
  | 'payments.view'
  | 'customers.view'
  | 'customers.edit'
  | 'customers.activate'
  | 'customers.export'
  | 'reviews.view'
  | 'reviews.approve'
  | 'reviews.delete'
  | 'coupons.view'
  | 'coupons.create'
  | 'coupons.edit'
  | 'coupons.delete'
  | 'reports.view'
  | 'reports.export'
  | 'settings.view'
  | 'settings.edit';
