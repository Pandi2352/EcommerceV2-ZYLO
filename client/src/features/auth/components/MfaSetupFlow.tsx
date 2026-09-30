import React from 'react';
import { Loader2 } from 'lucide-react';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useForm } from '../../../hooks/useForm';
import { pattern, required } from '../../../utils/validators';
import { authService } from '../../../services/auth.service';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';

type CodeValues = { code: string };

// Each setup call generates a new secret server-side. Share the in-flight call so
// a double-mounted effect (React StrictMode) cannot show a QR for a stale secret.
let pendingSetup: ReturnType<typeof authService.startMfaSetup> | null = null;
function startSetupOnce() {
  pendingSetup ??= authService.startMfaSetup().finally(() => {
    pendingSetup = null;
  });
  return pendingSetup;
}

const rules = {
  code: [required<CodeValues>('Enter the 6-digit code'), pattern<CodeValues>(/^\d{6}$/, 'The code has 6 digits')],
};

export interface MfaSetupFlowProps {
  onEnabled: (backupCodes: string[]) => void;
  onCancel: () => void;
}

/** Scan the QR code, then confirm with a code to switch two-factor on. */
export const MfaSetupFlow: React.FC<MfaSetupFlowProps> = ({ onEnabled, onCancel }) => {
  const setup = useApiQuery(startSetupOnce, []);

  const form = useForm<CodeValues>({
    initialValues: { code: '' },
    rules,
    onSubmit: async ({ code }) => onEnabled((await authService.enableMfa(code.trim())).backupCodes),
  });

  if (setup.isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Preparing setup…
      </div>
    );
  }

  if (setup.error || !setup.data) {
    return (
      <Alert tone="error" action={<Button size="sm" variant="outline" onClick={setup.reload}>Try again</Button>}>
        {setup.error?.message ?? 'Could not start two-factor setup.'}
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-5 text-xs text-slate-600">
        <li>
          <p className="font-semibold text-slate-800">1. Scan this QR code with your authenticator app</p>
          <p className="mt-0.5">Google Authenticator, Microsoft Authenticator, 1Password or any TOTP app.</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-4 items-start">
            <img
              src={setup.data.qrCodeDataUrl}
              alt="QR code for your authenticator app"
              width={180}
              height={180}
              className="border border-slate-200 rounded-md"
            />
            <div className="min-w-0">
              <p className="text-slate-500">Can’t scan? Enter this key manually:</p>
              <code className="mt-1 block p-2 rounded-md bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                {setup.data.secret}
              </code>
            </div>
          </div>
        </li>
        <li>
          <p className="font-semibold text-slate-800">2. Enter the 6-digit code from the app</p>
        </li>
      </ol>

      <form onSubmit={form.handleSubmit} noValidate className="space-y-4 max-w-xs">
        {form.formError && <Alert tone="error">{form.formError.message}</Alert>}
        <InputField
          label="Authentication code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          className="tracking-[0.3em] font-mono"
          {...form.field('code')}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" isLoading={form.isSubmitting}>
            Enable two-factor
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={form.isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MfaSetupFlow;
