import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useForm } from '../../../hooks/useForm';
import { pattern, required } from '../../../utils/validators';
import { ERROR_CODES } from '../../../constants/errorCodes';
import type { AuthUser } from '../../../types/auth';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';

type CodeValues = { code: string };

const TOTP_RULES = {
  code: [required<CodeValues>('Enter the 6-digit code'), pattern<CodeValues>(/^\d{6}$/, 'The code has 6 digits')],
};
const BACKUP_RULES = {
  code: [required<CodeValues>('Enter one of your backup codes'), pattern<CodeValues>(/^[a-zA-Z0-9]{4}-?[a-zA-Z0-9]{4}$/, 'Backup codes look like abcd-2345')],
};

export interface MfaChallengeFormProps {
  /** Where to restart when the challenge has expired */
  loginTo: string;
  onVerified: (user: AuthUser) => void;
}

/** Second sign-in step: authenticator code, or a one-time backup code. */
export const MfaChallengeForm: React.FC<MfaChallengeFormProps> = ({ loginTo, onVerified }) => {
  const { verifyMfa } = useAuth();
  const [useBackupCode, setUseBackupCode] = useState(false);

  const form = useForm<CodeValues>({
    initialValues: { code: '' },
    rules: useBackupCode ? BACKUP_RULES : TOTP_RULES,
    onSubmit: async ({ code }) => onVerified(await verifyMfa(code.trim())),
  });

  const expired = form.formError?.code === ERROR_CODES.MFA_CHALLENGE_INVALID;

  const toggleMode = () => {
    setUseBackupCode((prev) => !prev);
    form.reset({ code: '' });
  };

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
      {form.formError && (
        <Alert
          tone="error"
          action={expired && <Link to={loginTo} className="font-semibold underline">Sign in again</Link>}
        >
          {form.formError.message}
        </Alert>
      )}

      {useBackupCode ? (
        <InputField
          label="Backup code"
          required
          autoComplete="off"
          placeholder="abcd-2345"
          leftIcon={<KeyRound className="w-4 h-4" />}
          helperText="Each backup code works once."
          autoFocus
          {...form.field('code')}
        />
      ) : (
        <InputField
          label="Authentication code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          leftIcon={<ShieldCheck className="w-4 h-4" />}
          helperText="Open your authenticator app and enter the current code."
          className="tracking-[0.3em] font-mono"
          autoFocus
          {...form.field('code')}
        />
      )}

      <Button type="submit" variant="primary" fullWidth isLoading={form.isSubmitting} className="py-3" disabled={expired}>
        Verify and sign in
      </Button>

      <button
        type="button"
        onClick={toggleMode}
        className="w-full text-center text-xs font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer"
      >
        {useBackupCode ? 'Use your authenticator app instead' : 'Lost your device? Use a backup code'}
      </button>
    </form>
  );
};

export default MfaChallengeForm;
