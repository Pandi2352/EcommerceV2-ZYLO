import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import { useAuth } from '../../context/AuthContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { authService } from '../../services/auth.service';
import AuthCard from '../../features/auth/components/AuthCard';
import ResendVerificationButton from '../../features/auth/components/ResendVerificationButton';
import Alert from '../../components/feedback/Alert';

// Tokens are single-use: share one request per token so a remount (React
// StrictMode runs effects twice in development) does not consume it twice.
const verifications = new Map<string, ReturnType<typeof authService.verifyEmail>>();
function verifyOnce(token: string) {
  if (!verifications.has(token)) verifications.set(token, authService.verifyEmail(token));
  return verifications.get(token)!;
}

/** Target of the emailed verification link: /verify-email?token=… */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, refreshUser } = useAuth();

  const result = useApiQuery(async () => {
    if (!token) throw new Error('This verification link is incomplete. Please use the link from your email.');
    const response = await verifyOnce(token);
    if (user) await refreshUser();
    return response;
  }, [token]);

  const continueLink = user
    ? { to: ROUTES.CUSTOMER.HOME, label: 'Continue shopping' }
    : { to: ROUTES.CUSTOMER.LOGIN, label: 'Go to sign in' };

  return (
    <AuthCard title="Email verification" backLink={continueLink}>
      {result.isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Verifying your email address…
        </div>
      )}
      {!result.isLoading && result.data && (
        <Alert tone="success" title="Email verified">
          {result.data.message}
        </Alert>
      )}
      {!result.isLoading && result.error && (
        <Alert tone="error" title="Verification failed" action={user && !user.isEmailVerified && <ResendVerificationButton />}>
          {result.error.message}
          {!user && ' Sign in to request a new link.'}
        </Alert>
      )}
    </AuthCard>
  );
}
