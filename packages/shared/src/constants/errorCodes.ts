/** Machine-readable error codes sent by the API in the error envelope's `code` field. */
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  WRONG_PORTAL: 'WRONG_PORTAL',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
  PASSWORD_CHANGE_REQUIRED: 'PASSWORD_CHANGE_REQUIRED',
  PASSWORD_REUSED: 'PASSWORD_REUSED',
  PASSWORD_INCORRECT: 'PASSWORD_INCORRECT',
  PASSWORD_NOT_SET: 'PASSWORD_NOT_SET',
  MFA_CHALLENGE_INVALID: 'MFA_CHALLENGE_INVALID',
  MFA_INVALID_CODE: 'MFA_INVALID_CODE',
  OAUTH_PROVIDER_DISABLED: 'OAUTH_PROVIDER_DISABLED',
  OAUTH_FAILED: 'OAUTH_FAILED',
  OAUTH_STAFF_NOT_ALLOWED: 'OAUTH_STAFF_NOT_ALLOWED',
  OAUTH_EMAIL_UNVERIFIED: 'OAUTH_EMAIL_UNVERIFIED',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVITATION_REVOKED: 'INVITATION_REVOKED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** Messages for OAuth failures, which arrive as ?oauthError=CODE on the login page. */
export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.OAUTH_FAILED]: 'Google sign-in could not be completed. Please try again.',
  [ERROR_CODES.OAUTH_STAFF_NOT_ALLOWED]: 'Staff accounts cannot use Google sign-in. Use the admin portal.',
  [ERROR_CODES.OAUTH_EMAIL_UNVERIFIED]: 'Your Google account email is not verified.',
  [ERROR_CODES.ACCOUNT_DISABLED]: 'This account has been deactivated. Please contact support.',
  [ERROR_CODES.WRONG_PORTAL]: 'Staff accounts must sign in through the admin portal.',
  [ERROR_CODES.OAUTH_PROVIDER_DISABLED]: 'Google sign-in is not available right now.',
};
