import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { ERROR_CODES, OAUTH_ERROR_MESSAGES } from '../../constants/errorCodes';
import { resolvePostLoginRedirect } from '../../utils/redirect';
import { useAuthProviders } from '../../features/auth/hooks/useAuthProviders';
import AuthSplitLayout from '../../features/auth/components/AuthSplitLayout';
import LoginForm from '../../features/auth/components/LoginForm';
import SocialAuthButtons from '../../features/auth/components/SocialAuthButtons';
import Alert from '../../components/feedback/Alert';

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
        portal="customer"
        rememberStorageKey={STORAGE_KEYS.REMEMBERED_CUSTOMER_EMAIL}
        emailPlaceholder="stevenjob@gmail.com"
        onRememberChange={setRemember}
        onAuthenticated={() => navigate(redirect, { replace: true })}
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
