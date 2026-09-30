import { UserDocument } from '../../users/schemas/user.schema';
import { IssuedTokens } from '../services/token.service';

/**
 * Result of a successful first factor (password or OAuth). Either the session is
 * issued immediately, or a second factor is still required.
 */
export type LoginOutcome =
  | { mfaRequired: false; user: UserDocument; tokens: IssuedTokens }
  | { mfaRequired: true; user: UserDocument; challengeToken: string };

/** Body returned to the client for any login step. */
export type LoginResponse =
  | { mfaRequired: false; user: UserDocument }
  | { mfaRequired: true };
