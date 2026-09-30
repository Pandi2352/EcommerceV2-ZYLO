import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorSmartphone } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { usePortal } from '../PortalContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import SectionCard from '../../ui/SectionCard';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';

/** Sign out of every device (revokes all refresh sessions). */
export const SessionSettings: React.FC = () => {
  const { logoutAll } = useAuth();
  const { routes } = usePortal();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const action = useAsyncAction(async () => {
    await logoutAll();
    return true;
  });

  const signOutEverywhere = async () => {
    if (await action.run()) navigate(routes.login, { replace: true });
  };

  return (
    <SectionCard
      title="Active sessions"
      description="Signed in on a device you no longer use? Sign out everywhere, including this browser."
      icon={<MonitorSmartphone className="w-4 h-4" />}
    >
      {action.error && <Alert tone="error" className="mb-4">{action.error.message}</Alert>}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600">Sign out of all devices?</span>
          <Button variant="danger" size="sm" isLoading={action.isLoading} onClick={signOutEverywhere}>
            Yes, sign out everywhere
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={action.isLoading}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          Sign out of all devices
        </Button>
      )}
    </SectionCard>
  );
};

export default SessionSettings;
