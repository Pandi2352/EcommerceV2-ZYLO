import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePortal } from '../PortalContext';
import { useForm } from '../../hooks/useForm';
import { matchesField, required, strongPassword } from '../../utils/validators';
import { ERROR_CODES } from '../../constants/errorCodes';
import { authService } from '../../api/auth.service';
import AuthCard from '../components/AuthCard';
import PasswordField from '../../ui/PasswordField';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';

type ResetValues = { password: string; confirmPassword: string };

const rules = {
  password: [required<ResetValues>('Enter a new password'), strongPassword<ResetValues>()],
  confirmPassword: [
    required<ResetValues>('Confirm your new password'),
    matchesField<ResetValues>('password', 'Passwords do not match'),
  ],
};

/** Target of the emailed reset link: /reset-password?token=… (in whichever app sent it) */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { routes } = usePortal();
  const forgotTo = routes.forgotPassword;
  const [done, setDone] = useState(false);

  const form = useForm<ResetValues>({
    initialValues: { password: '', confirmPassword: '' },
    rules,
    onSubmit: async ({ password }) => {
      await authService.resetPassword(token ?? '', password);
      setDone(true);
    },
  });

  const tokenRejected = form.formError?.code === ERROR_CODES.INVALID_TOKEN;
  const requestNewLink = <Link to={forgotTo} className="font-semibold underline">Request a new link</Link>;

  const content = () => {
    if (!token) {
      return <Alert tone="error" action={requestNewLink}>This reset link is incomplete. Please use the link from your email.</Alert>;
    }
    if (done) {
      return (
        <div className="space-y-4">
          <Alert tone="success" title="Password updated">
            You have been signed out on all devices. Sign in with your new password.
          </Alert>
          <Link
            to={routes.login}
            className="w-full inline-flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-md text-white bg-[#2A3B5C] hover:bg-[#1E2B43] transition-colors"
          >
            Go to sign in
          </Link>
        </div>
      );
    }
    return (
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        {form.formError && (
          <Alert tone="error" action={tokenRejected && requestNewLink}>
            {form.formError.message}
          </Alert>
        )}
        <PasswordField
          label="New password"
          required
          autoComplete="new-password"
          placeholder="Enter at least 8 characters"
          showStrengthMeter
          autoFocus
          {...form.field('password')}
        />
        <PasswordField
          label="Confirm new password"
          required
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          {...form.field('confirmPassword')}
        />
        <Button type="submit" variant="primary" fullWidth isLoading={form.isSubmitting} className="py-3">
          Reset password
        </Button>
      </form>
    );
  };

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Your new password must differ from your current and previous passwords."
      backLink={{ to: routes.login, label: 'Back to sign in' }}
    >
      {content()}
    </AuthCard>
  );
}
