import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routePaths';
import PageLoader from '../components/common/PageLoader';

export interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader variant="mascot" size="md" text="Loading ZYLO..." fullScreen={true} />;
  }

  if (isAuthenticated && user) {
    // Redirect to Admin dashboard if user is ADMIN, otherwise to Customer storefront home
    const target = user.role === 'ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.CUSTOMER.HOME;
    return <Navigate to={target} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default PublicOnlyRoute;
