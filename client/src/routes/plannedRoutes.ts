import { ROUTES } from './routePaths';

export interface PlannedRoute {
  path: string;
  title: string;
}

// Pages that are linked from the UI but not built yet. They render a
// "coming soon" placeholder; move an entry to a real <Route> once built.

export const CUSTOMER_PUBLIC_PLANNED: PlannedRoute[] = [
  { path: ROUTES.CUSTOMER.SHOP, title: 'Shop' },
  { path: ROUTES.CUSTOMER.PRODUCT_DETAILS, title: 'Product Details' },
  { path: ROUTES.CUSTOMER.VENDORS, title: 'Vendors' },
  { path: ROUTES.CUSTOMER.PAGES, title: 'Pages' },
  { path: ROUTES.CUSTOMER.BLOG, title: 'Blog' },
  { path: ROUTES.CUSTOMER.CONTACT, title: 'Contact Us' },
  { path: ROUTES.CUSTOMER.ABOUT, title: 'About Us' },
  { path: ROUTES.CUSTOMER.CAREERS, title: 'Careers' },
  { path: ROUTES.CUSTOMER.TERMS, title: 'Terms & Conditions' },
  { path: ROUTES.CUSTOMER.OPEN_SHOP, title: 'Open a Shop' },
  { path: ROUTES.CUSTOMER.COMPARE, title: 'Compare Products' },
  { path: ROUTES.CUSTOMER.CART, title: 'Shopping Cart' },
];

export const CUSTOMER_ACCOUNT_PLANNED: PlannedRoute[] = [
  { path: ROUTES.CUSTOMER.DASHBOARD, title: 'My Account' },
  { path: ROUTES.CUSTOMER.ORDERS, title: 'My Orders' },
  { path: ROUTES.CUSTOMER.PROFILE, title: 'My Profile' },
  { path: ROUTES.CUSTOMER.ADDRESSES, title: 'My Addresses' },
  { path: ROUTES.CUSTOMER.WISHLIST, title: 'Wishlist' },
  { path: ROUTES.CUSTOMER.CHECKOUT, title: 'Checkout' },
];

/** Admin sections open to every staff role */
export const ADMIN_STAFF_PLANNED: PlannedRoute[] = [
  { path: ROUTES.ADMIN.ORDERS, title: 'Orders' },
  { path: ROUTES.ADMIN.CUSTOMERS, title: 'Customers' },
];

/** Admin sections requiring ADMIN or above */
export const ADMIN_MANAGER_PLANNED: PlannedRoute[] = [
  { path: ROUTES.ADMIN.PRODUCTS, title: 'Products' },
  { path: ROUTES.ADMIN.CATEGORIES, title: 'Categories' },
  { path: ROUTES.ADMIN.ANALYTICS, title: 'Analytics' },
];
