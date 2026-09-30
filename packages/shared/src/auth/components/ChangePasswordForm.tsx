import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useForm } from '../../../hooks/useForm';
import { differsFromField, matchesField, required, strongPassword } from '../../../utils/validators';
import { authService } from '../../../services/auth.service';
import type { AuthUser } from '../../../types/auth';
import PasswordField from '../../../components/common/PasswordField';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';

type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };

const INITIAL: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

const rules = {
  currentPassword: [required<PasswordValues>('Enter your current password')],
  newPassword: [
    required<PasswordValues>('Enter a new password'),
    strongPassword<PasswordValues>(),
    differsFromField<PasswordValues>('currentPassword', 'Choose a password different from your current one'),
  ],
  confirmPassword: [
    required<PasswordValues>('Confirm your new password'),
    matchesField<PasswordValues>('newPassword', 'Passwords do not match'),
  ],
};

export interface ChangePasswordFormProps {
  submitLabel?: string;
  onChanged?: (user: AuthUser) => void;
}

/**
 * Change password while signed in. The server signs out every other device
 * and issues a fresh session for this one.
 */
export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ submitLabel = 'Update password', onChanged }) => {
  const { setUser } = useAuth();
  const [success, setSuccess] = React.useState(false);

  const form = useForm<PasswordValues>({
    initialValues: INITIAL,
    rules,
    onSubmit: async ({ currentPassword, newPassword }) => {
      setSuccess(false);
      const { user } = await authService.changePassword({ currentPassword, newPassword });
      setUser(user);
      form.reset();
      setSuccess(true);
      onChanged?.(user);
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4 max-w-md">
      {form.formError && <Alert tone="error">{form.formError.message}</Alert>}
      {success && (
        <Alert tone="success" onDismiss={() => setSuccess(false)}>
          Password updated. Other devices have been signed out.
        </Alert>
      )}

      <PasswordField label="Current password" required autoComplete="current-password" {...form.field('currentPassword')} />
      <PasswordField label="New password" required autoComplete="new-password" showStrengthMeter {...form.field('newPassword')} />
      <PasswordField label="Confirm new password" required autoComplete="new-password" {...form.field('confirmPassword')} />

      <Button type="submit" variant="primary" isLoading={form.isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
