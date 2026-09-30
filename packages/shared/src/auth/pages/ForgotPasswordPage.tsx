import { useState } from 'react';
import { Mail } from 'lucide-react';
import { usePortal } from '../PortalContext';
import { useForm } from '../../hooks/useForm';
import { email, required } from '../../utils/validators';
import { authService } from '../../api/auth.service';
import AuthCard from '../components/AuthCard';
import InputField from '../../ui/InputField';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';

type ForgotValues = { email: string };

const rules = {
  email: [required<ForgotValues>('Email address is required'), email<ForgotValues>()],
};

export default function ForgotPasswordPage() {
  const { routes } = usePortal();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ForgotValues>({
    initialValues: { email: '' },
    rules,
    onSubmit: async (values) => {
      await authService.forgotPassword(values.email.trim());
      setSentTo(values.email.trim());
    },
  });

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your account email and we will send you a link to choose a new password."
      backLink={{ to: routes.login, label: 'Back to sign in' }}
    >
      {sentTo ? (
        <div className="space-y-4">
          <Alert tone="success" title="Check your inbox">
            If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. It expires in 1 hour.
          </Alert>
          <Button variant="outline" fullWidth onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
          {form.formError && <Alert tone="error">{form.formError.message}</Alert>}
          <InputField
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            autoFocus
            {...form.field('email')}
          />
          <Button type="submit" variant="primary" fullWidth isLoading={form.isSubmitting} className="py-3">
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
