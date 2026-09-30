import React from 'react';
import { Mail } from 'lucide-react';
import { useAuth } from '../AuthContext';
import SectionCard from '../../ui/SectionCard';
import Badge from '../../ui/Badge';
import ResendVerificationButton from './ResendVerificationButton';

/** Email address, verification status and linked sign-in methods. */
export const EmailSettings: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <SectionCard
      title="Email address"
      description={user.email}
      icon={<Mail className="w-4 h-4" />}
      aside={
        user.isEmailVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Not verified</Badge>
      }
    >
      <div className="space-y-3 text-xs text-slate-600">
        {!user.isEmailVerified && (
          <div className="flex flex-wrap items-center gap-3">
            <span>Check your inbox for the verification link.</span>
            <ResendVerificationButton />
          </div>
        )}
        <p>
          Google sign-in:{' '}
          <span className="font-semibold text-slate-800">{user.googleLinked ? 'Connected' : 'Not connected'}</span>
        </p>
      </div>
    </SectionCard>
  );
};

export default EmailSettings;
