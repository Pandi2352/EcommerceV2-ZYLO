import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { usePortal } from './PortalContext';
import PageLoader from '../ui/PageLoader';

export interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

/** Sign-in pages: already signed-in users are sent to the app's home. */
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { routes } = usePortal();

  if (isLoading) {
    return <PageLoader variant="mascot" size="md" text="Loading ZYLO..." fullScreen={true} />;
  }

  if (user) {
    return <Navigate to={routes.home} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default PublicOnlyRoute;
