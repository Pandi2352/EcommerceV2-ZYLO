import { BrowserRouter } from 'react-router-dom';
import { PortalProvider } from '@shared/auth/PortalContext';
import { AuthProvider } from '@shared/auth/AuthContext';
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
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
              <CartDrawer />
              <Toaster position="top-right" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </PortalProvider>
    </BrowserRouter>
  );
}
