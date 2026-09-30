import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../routes/routePaths';
import { STOREFRONT_URL } from '../config/portal';
import { STORAGE_KEYS } from '@shared/constants/storageKeys';
import { resolvePostLoginRedirect } from '@shared/utils/redirect';
import AuthCard from '@shared/auth/components/AuthCard';
import LoginForm from '@shared/auth/components/LoginForm';
import { toast } from '@shared/ui/Toast';

/** Admin portal sign-in. Staff accounts only; there is no admin registration. */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = resolvePostLoginRedirect(location.state, searchParams, ROUTES.DASHBOARD);

  return (
    <AuthCard
      title="Admin Portal Sign In"
      subtitle="Authorized personnel only. All access attempts are recorded."
      backLink={{ to: STOREFRONT_URL, label: 'Return to Customer Storefront' }}
      footer={
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Sign-ins are logged with IP address and device</span>
        </div>
      }
    >
      <LoginForm
        rememberStorageKey={STORAGE_KEYS.REMEMBERED_ADMIN_EMAIL}
        emailLabel="Work Email"
        emailPlaceholder="name@zylo.internal"
        submitLabel="Authenticate & Access"
        submitIcon={<Lock className="w-4 h-4" />}
        onAuthenticated={(user) => {
          toast.success(`Welcome, ${user.name}! Authenticated to Admin Console.`);
          navigate(redirect, { replace: true });
        }}
        onMfaRequired={() => navigate(`${ROUTES.LOGIN_VERIFY}?redirect=${encodeURIComponent(redirect)}`)}
      />
    </AuthCard>
  );
}
