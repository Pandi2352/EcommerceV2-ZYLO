import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/auth.service';
import SectionCard from '../../../components/common/SectionCard';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import MfaSetupFlow from './MfaSetupFlow';
import MfaConfirmForm from './MfaConfirmForm';
import BackupCodesList from './BackupCodesList';

type Step = 'idle' | 'setup' | 'codes' | 'regenerate' | 'disable';

/** Two-factor authentication: set up, show backup codes, regenerate them, or turn off. */
export const TwoFactorSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('idle');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  if (!user) return null;

  const showCodes = (codes: string[]) => {
    setBackupCodes(codes);
    setStep('codes');
  };

  const finish = (message: string | null = null) => {
    setBackupCodes([]);
    setNotice(message);
    setStep('idle');
  };

  const status = user.mfaEnabled ? <Badge tone="success">Enabled</Badge> : <Badge tone="neutral">Off</Badge>;

  return (
    <SectionCard
      title="Two-factor authentication"
      description="Require a code from an authenticator app in addition to your password when signing in."
      icon={<ShieldCheck className="w-4 h-4" />}
      aside={status}
    >
      {notice && step === 'idle' && (
        <Alert tone="success" className="mb-4" onDismiss={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {step === 'idle' && !user.mfaEnabled && (
        <Button variant="primary" onClick={() => setStep('setup')}>
          Set up two-factor
        </Button>
      )}

      {step === 'idle' && user.mfaEnabled && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setStep('regenerate')}>
            New backup codes
          </Button>
          <Button variant="danger" onClick={() => setStep('disable')}>
            Turn off
          </Button>
        </div>
      )}

      {step === 'setup' && (
        <MfaSetupFlow
          onCancel={() => finish()}
          onEnabled={async (codes) => {
            await refreshUser();
            showCodes(codes);
          }}
        />
      )}

      {step === 'codes' && <BackupCodesList codes={backupCodes} onDone={() => finish('Two-factor authentication is on.')} />}

      {step === 'regenerate' && (
        <MfaConfirmForm
          description="Your existing backup codes will stop working."
          submitLabel="Generate new codes"
          codeHelp="Backup codes are not accepted here; use your authenticator app."
          onCancel={() => finish()}
          onConfirm={async (code) => showCodes((await authService.regenerateBackupCodes(code)).backupCodes)}
        />
      )}

      {step === 'disable' && (
        <MfaConfirmForm
          description="Signing in will only require your password."
          submitLabel="Turn off two-factor"
          submitVariant="danger"
          requirePassword={user.hasPassword}
          codeHelp="Enter an authenticator code or one of your backup codes."
          onCancel={() => finish()}
          onConfirm={async (code, password) => {
            await authService.disableMfa(code, password);
            await refreshUser();
            finish('Two-factor authentication has been turned off.');
          }}
        />
      )}
    </SectionCard>
  );
};

export default TwoFactorSettings;
