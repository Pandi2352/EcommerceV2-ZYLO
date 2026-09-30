export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/** Staff roles, lowest to highest privilege. Customers are outside this hierarchy. */
export const STAFF_ROLES: readonly UserRole[] = [
  UserRole.SUPPORT_AGENT,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

/**
 * Whether a user's role satisfies a required role.
 * Staff roles inherit everything below them (SUPER_ADMIN ⊇ ADMIN ⊇ SUPPORT_AGENT);
 * CUSTOMER only matches CUSTOMER.
 */
export function roleSatisfies(userRole: UserRole, requiredRole: UserRole): boolean {
  if (requiredRole === UserRole.CUSTOMER || userRole === UserRole.CUSTOMER) {
    return userRole === requiredRole;
  }
  return STAFF_ROLES.indexOf(userRole) >= STAFF_ROLES.indexOf(requiredRole);
}
