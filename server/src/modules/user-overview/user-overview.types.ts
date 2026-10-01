export interface SignInDay {
  /** UTC day, YYYY-MM-DD */
  date: string;
  success: number;
  failed: number;
}

export interface UserManagementOverview {
  generatedAt: string;
  days: number;
  users: {
    total: number;
    active: number;
    inactive: number;
    locked: number;
    mfaEnabled: number;
    neverSignedIn: number;
    /** Active users with no sign-in during the period */
    idle: number;
  };
  roles: {
    total: number;
    active: number;
    inactive: number;
    distribution: { id: string; name: string; status: string; userCount: number }[];
  };
  invitations: {
    invited: number;
    registered: number;
    expired: number;
    revoked: number;
    expiringSoon: number;
    sentInPeriod: number;
  };
  signIns: {
    series: SignInDay[];
    success: number;
    failed: number;
    blocked: number;
  };
  attention: {
    locked: { id: string; name: string; email: string; lockUntil: string }[];
    privilegedWithout2fa: { id: string; name: string; email: string; roleName: string }[];
    expiringInvitations: { id: string; name: string; email: string; expiresAt: string }[];
  };
  recentChanges: { id: string; event: string; actorEmail?: string; target?: string; createdAt: string }[];
}
