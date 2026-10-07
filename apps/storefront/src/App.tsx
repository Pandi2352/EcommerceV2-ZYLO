import { BrowserRouter } from 'react-router-dom';
import { PortalProvider } from '@shared/auth/PortalContext';
import { AuthProvider } from '@shared/auth/AuthContext';
import { CartProvider } from './features/cart/context/CartContext';
import CartDrawer from './features/cart/components/CartDrawer';
import Toaster from '@shared/ui/Toaster';
import { storefrontPortal } from './config/portal';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <PortalProvider config={storefrontPortal}>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
            <CartDrawer />
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
      </PortalProvider>
    </BrowserRouter>
  );
}
