import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { usePortal } from './PortalContext';
import { roleSatisfies, type UserRole } from '../constants/roles';
import PageLoader from '../ui/PageLoader';

import type { PermissionKey } from '../constants/permissionKeys';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  /** Minimum role. Staff roles are hierarchical (ADMIN admits SUPER_ADMIN). */
  role?: UserRole;
  /** Alternatively, any of these roles (each checked hierarchically) */
  anyRole?: readonly UserRole[];
  /** Required single permission key */
  permission?: PermissionKey | string;
  /** Any of these permissions */
  anyPermission?: readonly (PermissionKey | string)[];
  /** All of these permissions */
  allPermissions?: readonly (PermissionKey | string)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role,
  anyRole,
  permission,
  anyPermission,
  allPermissions,
}) => {
  const { user, isLoading, can, canAny } = useAuth();
  const { routes } = usePortal();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader variant="mascot" size="md" text="Verifying session..." fullScreen={true} />;
  }

  if (!user) {
    return <Navigate to={routes.login} state={{ from: location }} replace />;
  }

  // Forced password change (e.g. first admin sign-in) takes precedence over everything
  if (user.mustChangePassword && location.pathname !== routes.changePassword) {
    return <Navigate to={routes.changePassword} replace />;
  }

  const required = role ? [role] : anyRole ?? [];
  if (required.length > 0 && !required.some((r) => roleSatisfies(user.role, r))) {
    return <Navigate to={routes.home} replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to={routes.home} replace />;
  }

  if (anyPermission && anyPermission.length > 0 && !canAny(...anyPermission)) {
    return <Navigate to={routes.home} replace />;
  }

  if (allPermissions && allPermissions.length > 0 && !allPermissions.every((p) => can(p))) {
    return <Navigate to={routes.home} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
