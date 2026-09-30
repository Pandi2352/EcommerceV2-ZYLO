/**
 * Centralized Route Paths for the ZYLO E-Commerce Platform
 * 
 * STRICT ARCHITECTURAL RULE:
 * - Registration is EXCLUSIVELY available on the Customer storefront (/register).
 * - Admin portal (/admin/login) has NO public registration; admin accounts are
 *   provisioned internally or seeded via system administration.
 */
export const ROUTES = {
  // -------------------------------------------------------------
  // CUSTOMER / STOREFRONT ROUTES
  // -------------------------------------------------------------
  CUSTOMER: {
    HOME: '/',
    SHOP: '/shop',
    PRODUCT_DETAILS: '/product/:id',
    VENDORS: '/vendors',
    PAGES: '/pages',
    BLOG: '/blog',
    CONTACT: '/contact',
    ABOUT: '/about',
    CAREERS: '/careers',
    TERMS: '/terms',
    OPEN_SHOP: '/open-shop',
    COMPARE: '/compare',

    // Customer Authentication (Customer site ONLY has registration)
    LOGIN: '/login',
    REGISTER: '/register',

    // Customer Protected Account
    DASHBOARD: '/account',
    ORDERS: '/account/orders',
    PROFILE: '/account/profile',
    ADDRESSES: '/account/addresses',
    WISHLIST: '/wishlist',
    CART: '/cart',
    CHECKOUT: '/checkout',
  },

  // -------------------------------------------------------------
  // ADMIN PORTAL ROUTES (NO REGISTRATION)
  // -------------------------------------------------------------
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    CUSTOMERS: '/admin/customers',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },

  // -------------------------------------------------------------
  // COMMON / SYSTEM ROUTES
  // -------------------------------------------------------------
  NOT_FOUND: '*',
} as const;

export type AppRoutePath = typeof ROUTES;
