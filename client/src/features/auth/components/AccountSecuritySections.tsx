import React from 'react';
import type { AuthPortal } from '../../../types/auth';
import { PORTAL_ROUTES } from '../../../routes/portalRoutes';
import EmailSettings from './EmailSettings';
import PasswordSettings from './PasswordSettings';
import TwoFactorSettings from './TwoFactorSettings';
import SessionSettings from './SessionSettings';

/** Every account-security section, shared by the storefront and admin security pages. */
export const AccountSecuritySections: React.FC<{ portal: AuthPortal }> = ({ portal }) => (
  <div className="space-y-5">
    <EmailSettings />
    <PasswordSettings />
    <TwoFactorSettings />
    <SessionSettings signedOutTo={PORTAL_ROUTES[portal].login} />
  </div>
);

export default AccountSecuritySections;
