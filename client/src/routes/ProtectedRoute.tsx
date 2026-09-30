import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routePaths';
import PageLoader from '../components/common/PageLoader';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader variant="mascot" size="md" text="Verifying session..." fullScreen={true} />;
  }

  if (!isAuthenticated || !user) {
    // If not authenticated, redirect to customer login by default (or admin login if accessing admin)
    const isAdminRoute = location.pathname.startsWith('/admin');
    const redirectPath = isAdminRoute ? ROUTES.ADMIN.LOGIN : ROUTES.CUSTOMER.LOGIN;
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.CUSTOMER.HOME} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
