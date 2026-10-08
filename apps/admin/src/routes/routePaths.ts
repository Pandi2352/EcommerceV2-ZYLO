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
  PRODUCTS_OVERVIEW: '/products/overview',
  PRODUCTS: '/products',
  CATEGORIES_OVERVIEW: '/categories/overview',
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
  USER_MANAGEMENT_OVERVIEW: '/user-management',
  USERS: '/users',
  USER_DETAILS: '/users/:id',
  ROLES: '/roles',
  ROLE_DETAILS: '/roles/:id',
  INVITATIONS: '/invitations',
  LOGIN_ACTIVITY: '/login-activity',
  USERS_INVITES: '/invitations',
  USERS_ROLES: '/roles',
  USERS_PERMISSIONS: '/roles',
  USERS_LOGIN_ACTIVITY: '/login-activity',

  // Platform & Administration
  /** Old path of the staff list; redirects to USERS */
  STAFF: '/staff',
  AUDIT_LOGS: '/audit-logs',
  /** The signed-in staff member's own password, 2FA and sessions */
  ACCOUNT: '/account',
  /** Store-wide settings */
  SETTINGS: '/settings',
  SETTINGS_PAYMENTS: '/settings/payments',
  SETTINGS_SHIPPING: '/settings/shipping',

  // Email Templates & Visual Canvas Editor
  EMAIL_TEMPLATES: '/email-templates',
  EMAIL_TEMPLATE_EDITOR: '/email-templates/editor/:id',
  EMAIL_TEMPLATE_NEW: '/email-templates/new',

  NOT_FOUND: '*',
} as const;
