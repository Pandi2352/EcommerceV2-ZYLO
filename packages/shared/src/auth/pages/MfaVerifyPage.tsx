import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePortal } from '../PortalContext';
import { safeRedirectPath } from '../../utils/redirect';
import AuthCard from '../components/AuthCard';
import MfaChallengeForm from '../components/MfaChallengeForm';

/** Second sign-in step (after password or Google sign-in). */
export default function MfaVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { routes } = usePortal();
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
