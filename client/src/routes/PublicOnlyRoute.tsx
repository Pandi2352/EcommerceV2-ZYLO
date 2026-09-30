import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PORTAL_ROUTES, portalForRole } from './portalRoutes';
import PageLoader from '../components/common/PageLoader';

export interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

/** Sign-in pages: already signed-in users are sent to their portal's home. */
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader variant="mascot" size="md" text="Loading ZYLO..." fullScreen={true} />;
  }

  if (user) {
    return <Navigate to={PORTAL_ROUTES[portalForRole(user.role)].home} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default PublicOnlyRoute;
