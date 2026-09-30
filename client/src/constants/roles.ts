export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Staff roles, lowest to highest privilege (mirrors the server hierarchy). */
export const STAFF_ROLES: readonly UserRole[] = [
  USER_ROLES.SUPPORT_AGENT,
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
];

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Customer',
  SUPPORT_AGENT: 'Support Agent',
  ADMIN: 'Administrator',
  SUPER_ADMIN: 'Super Administrator',
};

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

/** Staff roles inherit lower staff roles; CUSTOMER only matches CUSTOMER. */
export function roleSatisfies(userRole: UserRole, requiredRole: UserRole): boolean {
  if (requiredRole === USER_ROLES.CUSTOMER || userRole === USER_ROLES.CUSTOMER) {
    return userRole === requiredRole;
  }
  return STAFF_ROLES.indexOf(userRole) >= STAFF_ROLES.indexOf(requiredRole);
}
