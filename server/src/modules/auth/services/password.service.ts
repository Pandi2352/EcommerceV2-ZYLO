import { HttpStatus, Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UpdateQuery } from 'mongoose';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { UsersService } from '../../users/users.service';
import { User, UserDocument } from '../../users/schemas/user.schema';

const BCRYPT_ROUNDS = 12;

/** Hashing, verification and reuse rules for account passwords. */
@Injectable()
export class PasswordService {
  /** Compared against when an account does not exist, so response time does not reveal it */
  private readonly dummyHash = bcrypt.hashSync('zylo-timing-equaliser', BCRYPT_ROUNDS);

  constructor(private readonly usersService: UsersService) {}

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verify(password: string, hash: string | undefined): Promise<boolean> {
    if (!hash) {
      await bcrypt.compare(password, this.dummyHash);
      return false;
    }
    return bcrypt.compare(password, hash);
  }

  /** Reject the current and the immediately previous password. Needs both hashes selected. */
  async assertNotReused(user: UserDocument, newPassword: string): Promise<void> {
    for (const hash of [user.passwordHash, user.previousPasswordHash]) {
      if (hash && (await bcrypt.compare(newPassword, hash))) {
        throw new AppException(
          HttpStatus.BAD_REQUEST,
          ErrorCode.PASSWORD_REUSED,
          'Your new password must be different from your current and previous passwords.',
        );
      }
    }
  }

  /**
   * Store a new password, keep the old hash for reuse checks, and clear any
   * lockout, pending reset link and forced-change flag.
   */
  async setPassword(user: UserDocument, newPassword: string, extra: Partial<User> = {}): Promise<UserDocument> {
    const update: UpdateQuery<User> = {
      $set: {
        ...extra,
        passwordHash: await this.hash(newPassword),
        hasPassword: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockUntil: null,
        // Backdated 1s so tokens issued right after the change are not treated as stale
        passwordChangedAt: new Date(Date.now() - 1000),
        ...(user.passwordHash ? { previousPasswordHash: user.passwordHash } : {}),
      },
      $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 },
    };
    return this.usersService.update(user._id, update);
  }
}
