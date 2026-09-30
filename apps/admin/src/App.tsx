import { BrowserRouter } from 'react-router-dom';
import { PortalProvider } from '@shared/auth/PortalContext';
import { AuthProvider } from '@shared/auth/AuthContext';
import { adminPortal } from './config/portal';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <PortalProvider config={adminPortal}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </PortalProvider>
    </BrowserRouter>
  );
}
