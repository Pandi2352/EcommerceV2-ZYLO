import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiQuery } from '@shared/hooks/useApiQuery';
import { toast } from '@shared/ui/Toast';
import { rolesService, type Role } from '../../../services/roles.service';
import { permissionsService, type GroupedPermissionDomain } from '../../../services/permissions.service';
import { ROUTES } from '../../../routes/routePaths';

/** Accepts both a bare array and `{ data: [] }` catalog responses. */
function toCatalog(res: unknown): GroupedPermissionDomain[] {
  if (Array.isArray(res)) return res;
  const data = (res as { data?: unknown })?.data;
  return Array.isArray(data) ? (data as GroupedPermissionDomain[]) : [];
}

/**
 * Loads a role and the permission catalog. If the role can't be loaded the
 * error is toasted and the user is sent back to the roles list.
 */
export function useRoleDetails(id: string | undefined) {
  const navigate = useNavigate();
  const query = useApiQuery(async () => {
    if (!id) return null;
    const [role, catalog] = await Promise.all([
      rolesService.getRoleById(id),
      permissionsService.getGroupedPermissions().catch(() => []),
    ]);
    return { role, catalog: toCatalog(catalog) };
  }, [id]);

  // Local copy so saves and status changes can update the role without a refetch
  const [role, setRole] = useState<Role | null>(null);
  const [loaded, setLoaded] = useState(query.data);
  if (query.data !== loaded) {
    setLoaded(query.data);
    setRole(query.data?.role ?? null);
  }

  useEffect(() => {
    if (!query.error) return;
    toast.error(query.error.message);
    navigate(ROUTES.ROLES);
  }, [query.error, navigate]);

  /** Re-fetch only the role (e.g. after its holders change) without the loading state. */
  const refreshRole = useCallback(() => {
    if (!id) return;
    rolesService.getRoleById(id).then(setRole).catch(() => undefined);
  }, [id]);

  return { role, setRole, catalog: query.data?.catalog ?? [], isLoading: query.isLoading, refreshRole };
}
