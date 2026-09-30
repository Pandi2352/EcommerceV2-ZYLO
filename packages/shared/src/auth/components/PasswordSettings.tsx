import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { usePortal } from '../PortalContext';
import { formatDateTime } from '../../utils/format';
import SectionCard from '../../ui/SectionCard';
import Alert from '../../ui/Alert';
import ChangePasswordForm from './ChangePasswordForm';

/** Change password, or (for social-login accounts) explain how to set one. */
export const PasswordSettings: React.FC = () => {
  const { user } = useAuth();
  const { routes } = usePortal();
  if (!user) return null;

  return (
    <SectionCard
      title="Password"
      description={
        user.hasPassword
          ? 'Changing your password signs you out of every other device.'
          : 'Your account uses Google sign-in and has no password yet.'
      }
      icon={<KeyRound className="w-4 h-4" />}
    >
      {user.hasPassword ? (
        <ChangePasswordForm />
      ) : (
        <Alert tone="info">
          To add a password, use{' '}
          <Link to={routes.forgotPassword} className="font-semibold underline">
            Forgot password
          </Link>{' '}
          and we will email you a link to set one.
        </Alert>
      )}
      {user.lastLoginAt && (
        <p className="mt-4 text-[11px] text-slate-400">Last sign-in: {formatDateTime(user.lastLoginAt)}</p>
      )}
    </SectionCard>
  );
};

export default PasswordSettings;
