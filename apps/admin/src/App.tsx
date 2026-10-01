import { BrowserRouter } from 'react-router-dom';
import { PortalProvider } from '@shared/auth/PortalContext';
import { AuthProvider } from '@shared/auth/AuthContext';
import Toaster from '@shared/ui/Toaster';
import { adminPortal } from './config/portal';
import InviteLinkDialogHost from './features/invitations/components/InviteLinkDialog';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <PortalProvider config={adminPortal}>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
          <InviteLinkDialogHost />
        </AuthProvider>
      </PortalProvider>
    </BrowserRouter>
  );
}
