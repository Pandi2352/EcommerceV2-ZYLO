import React, { useState } from 'react';
import { MailWarning, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ResendVerificationButton from './ResendVerificationButton';

/** Storefront reminder for signed-in customers who have not verified their email. */
export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <MailWarning className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-medium">
          Please verify your email address. We sent a link to <strong>{user.email}</strong>.
        </span>
        <ResendVerificationButton />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="ml-auto p-1 rounded text-amber-700 hover:bg-amber-100 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
