import React from 'react';
import EmailSettings from './EmailSettings';
import PasswordSettings from './PasswordSettings';
import TwoFactorSettings from './TwoFactorSettings';
import SessionSettings from './SessionSettings';

/** Every account-security section, shared by the storefront and admin security pages. */
export const AccountSecuritySections: React.FC = () => (
  <div className="space-y-5">
    <EmailSettings />
    <PasswordSettings />
    <TwoFactorSettings />
    <SessionSettings />
  </div>
);

export default AccountSecuritySections;
