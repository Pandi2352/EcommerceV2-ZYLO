/**
 * Route paths of the customer storefront.
 *
 * The admin console is a separate app (apps/admin) with its own routes; staff
 * accounts cannot sign in here and customers cannot register there.
 */
export const ROUTES = {
  CUSTOMER: {
    HOME: '/',
    SHOP: '/shop',
    PRODUCT_DETAILS: '/products/:slug',
    VENDORS: '/vendors',
    PAGES: '/pages',
    BLOG: '/blog',
    CONTACT: '/contact',
    ABOUT: '/about',
    CAREERS: '/careers',
    TERMS: '/terms',
    OPEN_SHOP: '/open-shop',
    COMPARE: '/compare',

    // Authentication (registration exists only on the storefront)
    LOGIN: '/login',
    LOGIN_VERIFY: '/login/verify',
    REGISTER: '/register',

    // Signed-in account area
    DASHBOARD: '/account',
    ORDERS: '/account/orders',
    PROFILE: '/account/profile',
    ADDRESSES: '/account/addresses',
    SECURITY: '/account/security',
    WISHLIST: '/wishlist',
    CART: '/cart',
    CHECKOUT: '/checkout',
  },

  // Targets of emailed links
  AUTH: {
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },

  NOT_FOUND: '*',
} as const;

export type AppRoutePath = typeof ROUTES;
