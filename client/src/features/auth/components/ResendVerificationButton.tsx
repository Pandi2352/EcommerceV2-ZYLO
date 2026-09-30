import React, { useState } from 'react';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import { authService } from '../../../services/auth.service';
import Button from '../../../components/common/Button';

/** Sends a fresh verification link and reports the outcome inline. */
export const ResendVerificationButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [sent, setSent] = useState(false);
  const action = useAsyncAction(authService.resendVerification);

  const resend = async () => {
    if (await action.run()) setSent(true);
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={resend} isLoading={action.isLoading} disabled={sent}>
        {sent ? 'Link sent' : 'Resend link'}
      </Button>
      {action.error && <span className="text-rose-600 font-medium">{action.error.message}</span>}
    </span>
  );
};

export default ResendVerificationButton;
