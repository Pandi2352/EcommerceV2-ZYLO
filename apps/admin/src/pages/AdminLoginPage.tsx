import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { resolvePostLoginRedirect } from '../../utils/redirect';
import AuthCard from '../../features/auth/components/AuthCard';
import LoginForm from '../../features/auth/components/LoginForm';

/** Admin portal sign-in. Staff accounts only; there is no admin registration. */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = resolvePostLoginRedirect(location.state, searchParams, ROUTES.ADMIN.DASHBOARD);

  return (
    <AuthCard
      title="Admin Portal Sign In"
      subtitle="Authorized personnel only. All access attempts are recorded."
      backLink={{ to: ROUTES.CUSTOMER.HOME, label: 'Return to Customer Storefront' }}
      footer={
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Sign-ins are logged with IP address and device</span>
        </div>
      }
    >
      <LoginForm
        portal="admin"
        rememberStorageKey={STORAGE_KEYS.REMEMBERED_ADMIN_EMAIL}
        emailLabel="Work Email"
        emailPlaceholder="name@zylo.internal"
        submitLabel="Authenticate & Access"
        submitIcon={<Lock className="w-4 h-4" />}
        onAuthenticated={() => navigate(redirect, { replace: true })}
        onMfaRequired={() => navigate(`${ROUTES.ADMIN.LOGIN_VERIFY}?redirect=${encodeURIComponent(redirect)}`)}
      />
    </AuthCard>
  );
}
