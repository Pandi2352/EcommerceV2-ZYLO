import type { PortalConfig } from '@shared/auth/PortalContext';
import { USER_ROLES } from '@shared/constants/roles';
import { ROUTES } from '../routes/routePaths';

/** Tells the shared auth UI which portal this app is and where its pages live. */
export const storefrontPortal: PortalConfig = {
  portal: 'customer',
  roles: [USER_ROLES.CUSTOMER],
  routes: {
    home: ROUTES.CUSTOMER.HOME,
    login: ROUTES.CUSTOMER.LOGIN,
    loginVerify: ROUTES.CUSTOMER.LOGIN_VERIFY,
    forgotPassword: ROUTES.AUTH.FORGOT_PASSWORD,
    resetPassword: ROUTES.AUTH.RESET_PASSWORD,
    changePassword: ROUTES.CUSTOMER.SECURITY,
    security: ROUTES.CUSTOMER.SECURITY,
  },
};
