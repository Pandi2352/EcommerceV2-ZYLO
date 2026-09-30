import { Link, useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import { useAuth } from '@shared/auth/AuthContext';
import { useForm } from '@shared/hooks/useForm';
import { email, matchesField, minLength, required, strongPassword } from '@shared/utils/validators';
import { useAuthProviders } from '../../features/auth/hooks/useAuthProviders';
import AuthSplitLayout from '../../features/auth/components/AuthSplitLayout';
import SocialAuthButtons from '../../features/auth/components/SocialAuthButtons';
import InputField from '@shared/ui/InputField';
import PasswordField from '@shared/ui/PasswordField';
import Checkbox from '@shared/ui/Checkbox';
import Button from '@shared/ui/Button';
import Alert from '@shared/ui/Alert';

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
};

const rules = {
  name: [required<RegisterValues>('Full name is required'), minLength<RegisterValues>(2, 'Full name must be at least 2 characters')],
  email: [required<RegisterValues>('Email address is required'), email<RegisterValues>()],
  password: [required<RegisterValues>('Password is required'), strongPassword<RegisterValues>()],
  confirmPassword: [
    required<RegisterValues>('Please confirm your password'),
    matchesField<RegisterValues>('password', 'Passwords do not match'),
  ],
  agreedToTerms: [(value: string) => (value === 'true' ? undefined : 'You must agree to the terms and policy to register')],
};

/** Customer sign-up (the admin portal has no registration). */
export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { google } = useAuthProviders();

  const form = useForm<RegisterValues>({
    initialValues: { name: '', email: '', password: '', confirmPassword: '', agreedToTerms: false },
    rules,
    onSubmit: async (values) => {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      // The storefront shows a verification reminder until the email link is used
      navigate(ROUTES.CUSTOMER.HOME, { replace: true });
    },
  });

  const clear = (name: 'name' | 'email') => () => form.setValue(name, '');

  return (
    <AuthSplitLayout
      title="Create an account"
      subtitle="Access to all features. No credit card required."
      showRail
      aside={google && <SocialAuthButtons mode="signup" redirect={ROUTES.CUSTOMER.HOME} />}
    >
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        {form.formError && <Alert tone="error">{form.formError.message}</Alert>}

        <InputField label="Full Name" required autoComplete="name" placeholder="Steven Job" leftIcon={<User className="w-4 h-4" />} clearable onClear={clear('name')} {...form.field('name')} />
        <InputField label="Email" type="email" required autoComplete="email" placeholder="stevenjob@gmail.com" leftIcon={<Mail className="w-4 h-4" />} clearable onClear={clear('email')} {...form.field('email')} />
        <PasswordField label="Password" required autoComplete="new-password" placeholder="Create a strong password" showStrengthMeter {...form.field('password')} />
        <PasswordField label="Confirm Password" required autoComplete="new-password" placeholder="Re-enter your password" {...form.field('confirmPassword')} />

        <Checkbox
          name="agreedToTerms"
          checked={form.values.agreedToTerms}
          onChange={form.handleChange}
          error={form.errors.agreedToTerms}
          label={
            <>
              I agree to the{' '}
              <Link to={ROUTES.CUSTOMER.TERMS} className="text-slate-700 hover:text-slate-900 underline font-medium">
                terms and policy
              </Link>
              .
            </>
          }
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" fullWidth isLoading={form.isSubmitting} className="py-3">
            Sign Up
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to={ROUTES.CUSTOMER.LOGIN} className="font-semibold text-indigo-600 hover:text-indigo-700 underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}
