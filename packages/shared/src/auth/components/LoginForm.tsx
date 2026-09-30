import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useForm } from '../../hooks/useForm';
import { email, required } from '../../utils/validators';
import { ERROR_CODES } from '../../constants/errorCodes';
import { usePortal } from '../PortalContext';
import type { AuthUser } from '../../types/auth';
import InputField from '../../ui/InputField';
import PasswordField from '../../ui/PasswordField';
import Checkbox from '../../ui/Checkbox';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';

type LoginValues = { email: string; password: string; rememberMe: boolean };

export interface LoginFormProps {
  /** localStorage key used to prefill the email when "Remember me" was ticked */
  rememberStorageKey: string;
  onAuthenticated: (user: AuthUser) => void;
  onMfaRequired: () => void;
  onRememberChange?: (remember: boolean) => void;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  /** Rendered under the submit button */
  footer?: React.ReactNode;
}

const readStoredEmail = (key: string) => {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
};

const rules = {
  email: [required<LoginValues>('Email address is required'), email<LoginValues>()],
  password: [required<LoginValues>('Password is required')],
};

/** Email + password sign-in, scoped to the current portal (storefront or admin). */
export const LoginForm: React.FC<LoginFormProps> = ({
  rememberStorageKey,
  onAuthenticated,
  onMfaRequired,
  onRememberChange,
  emailLabel = 'Email Address',
  emailPlaceholder = 'you@example.com',
  passwordLabel = 'Password',
  submitLabel = 'Sign In',
  submitIcon,
  footer,
}) => {
  const { login } = useAuth();
  const { routes } = usePortal();
  const [initialValues] = useState<LoginValues>(() => {
    const stored = readStoredEmail(rememberStorageKey);
    return { email: stored, password: '', rememberMe: Boolean(stored) };
  });

  const form = useForm<LoginValues>({
    initialValues,
    rules,
    onSubmit: async (values) => {
      const result = await login({ email: values.email.trim(), password: values.password, rememberMe: values.rememberMe });
      try {
        if (values.rememberMe) localStorage.setItem(rememberStorageKey, values.email.trim());
        else localStorage.removeItem(rememberStorageKey);
      } catch {
        // Storage unavailable (private mode): remembering the email is optional
      }
      if (result.mfaRequired) onMfaRequired();
      else onAuthenticated(result.user);
    },
  });

  const locked = form.formError?.code === ERROR_CODES.ACCOUNT_LOCKED;

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
      {form.formError && (
        <Alert tone={locked ? 'warning' : 'error'} title={locked ? 'Account temporarily locked' : undefined}>
          {form.formError.message}
          {locked && ' You can also reset your password to unlock it now.'}
        </Alert>
      )}

      <InputField
        label={emailLabel}
        type="email"
        required
        autoComplete="username"
        placeholder={emailPlaceholder}
        leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
        {...form.field('email')}
      />

      <PasswordField
        label={passwordLabel}
        required
        autoComplete="current-password"
        placeholder="Enter your password"
        {...form.field('password')}
      />

      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          hint="(30 days)"
          name="rememberMe"
          checked={form.values.rememberMe}
          onChange={(event) => {
            form.handleChange(event);
            onRememberChange?.(event.target.checked);
          }}
        />
        <Link to={routes.forgotPassword} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer">
          Forgot password?
        </Link>
      </div>

      <div className="pt-2">
        <Button type="submit" variant="primary" fullWidth isLoading={form.isSubmitting} leftIcon={submitIcon} className="py-3">
          {submitLabel}
        </Button>
      </div>

      {footer}
    </form>
  );
};

export default LoginForm;
