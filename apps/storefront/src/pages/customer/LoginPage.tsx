import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { STORAGE_KEYS } from '@shared/constants/storageKeys';
import { ERROR_CODES, OAUTH_ERROR_MESSAGES } from '@shared/constants/errorCodes';
import { resolvePostLoginRedirect } from '@shared/utils/redirect';
import { useAuthProviders } from '../../features/auth/hooks/useAuthProviders';
import AuthSplitLayout from '../../features/auth/components/AuthSplitLayout';
import LoginForm from '@shared/auth/components/LoginForm';
import SocialAuthButtons from '../../features/auth/components/SocialAuthButtons';
import Alert from '@shared/ui/Alert';
import { toast } from '@shared/ui/Toast';

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { google } = useAuthProviders();
  const [remember, setRemember] = useState(false);

  const redirect = resolvePostLoginRedirect(location.state, searchParams, ROUTES.CUSTOMER.HOME);
  const oauthError = searchParams.get('oauthError');

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to access your orders, wishlist, and profile."
      banner={
        oauthError && (
          <Alert tone="error">{OAUTH_ERROR_MESSAGES[oauthError] ?? OAUTH_ERROR_MESSAGES[ERROR_CODES.OAUTH_FAILED]}</Alert>
        )
      }
      aside={google && <SocialAuthButtons mode="signin" redirect={redirect} remember={remember} />}
    >
      <LoginForm
        rememberStorageKey={STORAGE_KEYS.REMEMBERED_CUSTOMER_EMAIL}
        emailPlaceholder="stevenjob@gmail.com"
        onRememberChange={setRemember}
        onAuthenticated={(user) => {
          toast.success(`Welcome back, ${user.name.split(' ')[0]}! Signed in successfully.`);
          navigate(redirect, { replace: true });
        }}
        onMfaRequired={() => navigate(`${ROUTES.CUSTOMER.LOGIN_VERIFY}?redirect=${encodeURIComponent(redirect)}`)}
        footer={
          <p className="pt-2 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to={ROUTES.CUSTOMER.REGISTER} className="font-semibold text-indigo-600 hover:text-indigo-700 underline">
              Create customer account
            </Link>
          </p>
        }
      />
    </AuthSplitLayout>
  );
}
