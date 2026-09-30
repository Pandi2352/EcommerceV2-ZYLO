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

  DASHBOARD: '/',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  ANALYTICS: '/analytics',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',

  NOT_FOUND: '*',
} as const;
