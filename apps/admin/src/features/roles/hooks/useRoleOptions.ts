import { useMemo } from 'react';
import { useApiQuery } from '@shared/hooks/useApiQuery';
import type { DropdownOption } from '@shared/ui/Dropdown';
import { rolesService, type Role } from '../../../services/roles.service';

/**
 * Roles as dropdown options, for filters and role pickers.
 * `activeOnly` hides inactive roles (they can't be newly assigned).
 */
export function useRoleOptions({ activeOnly = false }: { activeOnly?: boolean } = {}) {
  const query = useApiQuery(() => rolesService.listRoles(), []);

  const roles: Role[] = useMemo(() => query.data?.items ?? [], [query.data]);

  const options: DropdownOption[] = useMemo(
    () =>
      roles
        .filter((role) => !activeOnly || role.status === 'ACTIVE')
        .map((role) => ({
          value: role.id,
          label: role.name,
          description: role.status === 'INACTIVE' ? 'Inactive' : undefined,
        })),
    [roles, activeOnly],
  );

  return { roles, options, isLoading: query.isLoading, error: query.error };
}

export default useRoleOptions;
