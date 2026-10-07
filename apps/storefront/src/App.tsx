import { BrowserRouter } from 'react-router-dom';
import { PortalProvider } from '@shared/auth/PortalContext';
import { AuthProvider } from '@shared/auth/AuthContext';
import { SettingsProvider } from './features/settings/context/SettingsContext';
import { CartProvider } from './features/cart/context/CartContext';
import { WishlistProvider } from './features/wishlist/context/WishlistContext';
import CartDrawer from './features/cart/components/CartDrawer';
import Toaster from '@shared/ui/Toaster';
import { storefrontPortal } from './config/portal';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <PortalProvider config={storefrontPortal}>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRoutes />
                <CartDrawer />
                <Toaster position="top-right" />
              </WishlistProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </PortalProvider>
    </BrowserRouter>
  );
}
