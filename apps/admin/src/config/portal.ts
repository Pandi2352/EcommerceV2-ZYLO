import type { PortalConfig } from '@shared/auth/PortalContext';
import { STAFF_ROLES } from '@shared/constants/roles';
import { ROUTES } from '../routes/routePaths';

/** Tells the shared auth UI which portal this app is and where its pages live. */
export const adminPortal: PortalConfig = {
  portal: 'admin',
  roles: STAFF_ROLES,
  routes: {
    home: ROUTES.DASHBOARD,
    login: ROUTES.LOGIN,
    loginVerify: ROUTES.LOGIN_VERIFY,
    forgotPassword: ROUTES.FORGOT_PASSWORD,
    resetPassword: ROUTES.RESET_PASSWORD,
    changePassword: ROUTES.CHANGE_PASSWORD,
    security: ROUTES.ACCOUNT,
  },
};

/** Storefront URL for "view storefront" links (CLIENT_URL, or VITE_STOREFRONT_URL at build time). */
export const STOREFRONT_URL: string = __STOREFRONT_URL__;
