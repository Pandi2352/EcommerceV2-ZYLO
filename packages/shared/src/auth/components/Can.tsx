import React from 'react';
import { useAuth } from '../AuthContext';
import type { PermissionKey } from '../../constants/permissionKeys';

export interface CanProps {
  permission?: PermissionKey | string;
  any?: readonly (PermissionKey | string)[];
  all?: readonly (PermissionKey | string)[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  permission,
  any,
  all,
  fallback = null,
  children,
}) => {
  const { can, canAny } = useAuth();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (any && any.length > 0 && !canAny(...any)) {
    return <>{fallback}</>;
  }

  if (all && all.length > 0 && !all.every((p) => can(p))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Can;
