import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AuthPortal } from '../../types/auth';
import { PORTAL_ROUTES } from '../../routes/portalRoutes';
import { safeRedirectPath } from '../../utils/redirect';
import AuthCard from '../../features/auth/components/AuthCard';
import MfaChallengeForm from '../../features/auth/components/MfaChallengeForm';

/** Second sign-in step for either portal (after password or Google sign-in). */
export default function MfaVerifyPage({ portal }: { portal: AuthPortal }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routes = PORTAL_ROUTES[portal];
  const redirect = safeRedirectPath(searchParams.get('redirect'), routes.home);

  return (
    <AuthCard
      title="Two-step verification"
      subtitle="Your account is protected with two-factor authentication."
      backLink={{ to: routes.login, label: 'Back to sign in' }}
    >
      <MfaChallengeForm loginTo={routes.login} onVerified={() => navigate(redirect, { replace: true })} />
    </AuthCard>
  );
}
