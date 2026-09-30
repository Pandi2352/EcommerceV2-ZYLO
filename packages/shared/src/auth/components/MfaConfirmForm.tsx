import React from 'react';
import { useForm } from '../../hooks/useForm';
import { required } from '../../utils/validators';
import InputField from '../../ui/InputField';
import PasswordField from '../../ui/PasswordField';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';

type ConfirmValues = { code: string; password: string };

export interface MfaConfirmFormProps {
  description: string;
  submitLabel: string;
  submitVariant?: 'primary' | 'danger';
  requirePassword?: boolean;
  codeHelp?: string;
  onConfirm: (code: string, password?: string) => Promise<void>;
  onCancel: () => void;
}

/** Re-authenticate a sensitive two-factor action with a code (and optionally the password). */
export const MfaConfirmForm: React.FC<MfaConfirmFormProps> = ({
  description,
  submitLabel,
  submitVariant = 'primary',
  requirePassword = false,
  codeHelp = 'Enter the current code from your authenticator app.',
  onConfirm,
  onCancel,
}) => {
  const form = useForm<ConfirmValues>({
    initialValues: { code: '', password: '' },
    rules: {
      code: [required<ConfirmValues>('Enter a code')],
      ...(requirePassword ? { password: [required<ConfirmValues>('Enter your password')] } : {}),
    },
    onSubmit: ({ code, password }) => onConfirm(code.trim(), requirePassword ? password : undefined),
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4 max-w-sm">
      <p className="text-xs text-slate-600">{description}</p>
      {form.formError && <Alert tone="error">{form.formError.message}</Alert>}
      {requirePassword && (
        <PasswordField label="Password" required autoComplete="current-password" {...form.field('password')} />
      )}
      <InputField
        label="Authentication code"
        required
        autoComplete="one-time-code"
        placeholder="123456"
        helperText={codeHelp}
        {...form.field('code')}
      />
      <div className="flex gap-2">
        <Button type="submit" variant={submitVariant} isLoading={form.isSubmitting}>
          {submitLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={form.isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MfaConfirmForm;
