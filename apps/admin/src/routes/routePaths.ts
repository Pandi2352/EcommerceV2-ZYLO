/**
 * Route paths of the admin console (a separate app, e.g. admin.zylo.com).
 * There is no registration: staff accounts are provisioned internally.
 */
export const ROUTES = {
  LOGIN: '/login',
  LOGIN_VERIFY: '/login/verify',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',

  ACCEPT_INVITE: '/accept-invite',

  // Dashboards
  DASHBOARD: '/',
  DASHBOARDS_ECOMMERCE: '/dashboard/ecommerce',
  DASHBOARDS_ANALYTICS: '/dashboard/analytics',

  // Catalog
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  INVENTORY: '/inventory',

  // Sales & Fulfillment
  ORDERS: '/orders',
  SHIPMENTS: '/orders/shipments',
  RETURNS: '/returns',
  INVOICES: '/invoices',

  // Customers & Community
  CUSTOMERS: '/customers',
  REVIEWS: '/reviews',

  // Marketing & Discounts
  COUPONS: '/coupons',
  PROMOTIONS: '/promotions',

  // User Management (Multi-Admin RBAC)
  USERS: '/users',
  USERS_INVITES: '/users/invites',
  USERS_ROLES: '/users/roles',
  USERS_PERMISSIONS: '/users/permissions',

  // Platform & Administration
  STAFF: '/staff',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
  SETTINGS_PAYMENTS: '/settings/payments',
  SETTINGS_SHIPPING: '/settings/shipping',

  NOT_FOUND: '*',
} as const;
