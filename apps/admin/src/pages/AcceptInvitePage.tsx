import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Ban, CheckCircle2, Clock, Link2Off, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import AuthCard from '@shared/auth/components/AuthCard';
import PasswordField from '@shared/ui/PasswordField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { cn } from '@shared/utils/cn';
import { extractErrorMessage, getApiError } from '@shared/api/client';
import { ROUTES } from '../routes/routePaths';
import { invitationsService, type VerifiedInvitationData } from '../services/invitations.service';
import { describeExpiry } from '../features/invitations/utils/relativeTime';

type Problem = { kind: 'invalid' | 'expired' | 'revoked' | 'accepted'; message: string };

const PROBLEMS: Record<Problem['kind'], { title: string; icon: React.ReactNode; tone: string; cta: string }> = {
  invalid: { title: "This invitation link isn't valid", icon: <Link2Off />, tone: 'bg-rose-50 text-rose-600', cta: 'Back to sign in' },
  expired: { title: 'This invitation has expired', icon: <Clock />, tone: 'bg-amber-50 text-amber-600', cta: 'Back to sign in' },
  revoked: { title: 'This invitation was revoked', icon: <Ban />, tone: 'bg-zinc-100 text-zinc-500', cta: 'Back to sign in' },
  accepted: { title: "You've already joined", icon: <CheckCircle2 />, tone: 'bg-emerald-50 text-emerald-600', cta: 'Sign in' },
};

function toProblem(err: unknown): Problem {
  const { code, message } = getApiError(err);
  const fallback = 'Invalid or expired invitation link. Please request a new invite.';
  if (code === 'INVITATION_EXPIRED') return { kind: 'expired', message };
  if (code === 'INVITATION_REVOKED') return { kind: 'revoked', message };
  if (code === 'INVITATION_ALREADY_ACCEPTED') return { kind: 'accepted', message };
  return { kind: 'invalid', message: message || fallback };
}

const StatusBlock: React.FC<{ icon: React.ReactNode; tone: string; title: string; children: React.ReactNode }> = ({ icon, tone, title, children }) => (
  <div className="flex gap-3">
    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4', tone)}>{icon}</div>
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-zinc-900">{title}</p>
      <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-500">{children}</p>
    </div>
  </div>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <dt className="text-xs text-zinc-500">{label}</dt>
    <dd className="min-w-0 truncate text-[13px] font-medium text-zinc-900">{children}</dd>
  </div>
);

export const AcceptInvitePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [inviteData, setInviteData] = useState<VerifiedInvitationData | null>(null);
  const [problem, setProblem] = useState<Problem | null>(
    token ? null : { kind: 'invalid', message: 'Missing invitation token in URL.' },
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    invitationsService
      .verifyInvitationToken(token)
      .then((data) => setInviteData(data))
      .catch((err) => setProblem(toProblem(err)))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await invitationsService.acceptInvitation({ token, password });
      setIsSuccess(true);
      toast.success('You can now sign in to the admin console.', { title: 'Account activated' });
    } catch (err) {
      toast.error(extractErrorMessage(err) || 'Failed to complete invitation setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toLogin = () => navigate(ROUTES.LOGIN);

  if (isLoading) {
    return (
      <AuthCard title="Join the team" subtitle="Checking your invitation link.">
        <div className="flex items-center gap-2 text-[13px] text-zinc-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying invitation…
        </div>
      </AuthCard>
    );
  }

  if (problem) {
    const meta = PROBLEMS[problem.kind];
    return (
      <AuthCard title="Join the team" subtitle="Admin console onboarding">
        <StatusBlock icon={meta.icon} tone={meta.tone} title={meta.title}>
          {problem.message}
        </StatusBlock>
        <Button size="sm" variant={problem.kind === 'accepted' ? 'primary' : 'outline'} fullWidth className="mt-5" leftIcon={<LogIn />} onClick={toLogin}>
          {meta.cta}
        </Button>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard title="Welcome to the team" subtitle="Admin console onboarding">
        <StatusBlock icon={<CheckCircle2 />} tone="bg-emerald-50 text-emerald-600" title="Your account is ready">
          Your password is set. Sign in with {inviteData?.email} to get started.
        </StatusBlock>
        <Button size="sm" variant="primary" fullWidth className="mt-5" rightIcon={<ArrowRight />} onClick={toLogin}>
          Sign in to console
        </Button>
      </AuthCard>
    );
  }

  const expiry = inviteData?.expiresAt ? describeExpiry(inviteData.expiresAt) : null;

  return (
    <AuthCard
      title="Join the team"
      subtitle="Set a password to activate your admin console account."
      footer={
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{expiry ? `This invitation link expires ${expiry.label}.` : 'This invitation link can be used once.'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <dl className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 px-3 py-1">
          <Row label="Name">{inviteData?.firstName} {inviteData?.lastName}</Row>
          <Row label="Email">{inviteData?.email}</Row>
          <Row label="Role">{inviteData?.roleName}</Row>
          {inviteData?.designation && <Row label="Designation">{inviteData.designation}</Row>}
        </dl>

        <PasswordField
          label="Create password"
          required
          showStrengthMeter
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm password"
          required
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" size="sm" variant="primary" fullWidth isLoading={isSubmitting} className="h-9">
          Activate account
        </Button>
      </form>
    </AuthCard>
  );
};

export default AcceptInvitePage;
