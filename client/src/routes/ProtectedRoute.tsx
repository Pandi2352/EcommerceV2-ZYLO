import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routePaths';
import { PORTAL_ROUTES, portalForRole } from './portalRoutes';
import { roleSatisfies, type UserRole } from '../constants/roles';
import PageLoader from '../components/common/PageLoader';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  /** Minimum role. Staff roles are hierarchical (ADMIN admits SUPER_ADMIN). */
  role?: UserRole;
  /** Alternatively, any of these roles (each checked hierarchically) */
  anyRole?: readonly UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role, anyRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader variant="mascot" size="md" text="Verifying session..." fullScreen={true} />;
  }

  if (!user) {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const redirectPath = isAdminRoute ? ROUTES.ADMIN.LOGIN : ROUTES.CUSTOMER.LOGIN;
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  const portal = PORTAL_ROUTES[portalForRole(user.role)];

  // Forced password change (e.g. first admin sign-in) takes precedence over everything
  if (user.mustChangePassword && location.pathname !== portal.changePassword) {
    return <Navigate to={portal.changePassword} replace />;
  }

  const required = role ? [role] : anyRole ?? [];
  if (required.length > 0 && !required.some((r) => roleSatisfies(user.role, r))) {
    return <Navigate to={portal.home} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
