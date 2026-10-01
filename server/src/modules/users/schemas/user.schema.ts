import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AccountType } from '../../../common/enums/account-type.enum';
import { Address, AddressSchema } from './address.schema';

export type UserDocument = HydratedDocument<User>;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/** Fields that must never leave the server in API responses. */
const SENSITIVE_FIELDS = [
  'passwordHash',
  'previousPasswordHash',
  'passwordResetTokenHash',
  'passwordResetExpires',
  'emailVerificationTokenHash',
  'emailVerificationExpires',
  'mfaSecret',
  'mfaPendingSecret',
  'mfaBackupCodeHashes',
  'mfaLastUsedStep',
  'failedLoginAttempts',
  'lockUntil',
  'googleId',
  '__v',
] as const;

function stripSensitive(_: unknown, ret: Record<string, any>) {
  ret.googleLinked = Boolean(ret.googleId);
  for (const field of SENSITIVE_FIELDS) {
    delete ret[field];
  }
  return ret;
}

@Schema(baseSchemaOptions({ collection: 'users', transform: stripSensitive }))
export class User extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @Prop({ trim: true, maxlength: 60 })
  firstName?: string;

  @Prop({ trim: true, maxlength: 60 })
  lastName?: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({
    type: String,
    enum: Object.values(AccountType),
    default: AccountType.CUSTOMER,
    index: true,
  })
  accountType: AccountType;

  /** References to roles collection */
  @Prop({ type: [String], default: [], index: true })
  roleIds: string[];

  /** Display reference code (e.g. ZY-0042) */
  @Prop({ trim: true, index: true, unique: true, sparse: true })
  userCode?: string;

  @Prop({ trim: true, maxlength: 80 })
  designation?: string;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
    index: true,
  })
  status: UserStatus;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CUSTOMER,
    index: true,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  customPermissions: string[];

  @Prop()
  invitedBy?: string;

  @Prop()
  invitationId?: string;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;

  @Prop()
  deletedBy?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];

  @Prop({ type: Date })
  lastLoginAt?: Date;

  // ─── Password ──────────────────────────────────────────────────────────────
  /** Absent for accounts created through social login until a password is set */
  @Prop({ select: false })
  passwordHash?: string;

  /** Previous hash, kept to block reusing the immediately preceding password */
  @Prop({ select: false })
  previousPasswordHash?: string;

  @Prop({ default: true })
  hasPassword: boolean;

  @Prop({ type: Date })
  passwordChangedAt?: Date;

  /** Forces a password change before any other action (e.g. first admin login) */
  @Prop({ default: false })
  mustChangePassword: boolean;

  @Prop({ select: false, index: true, sparse: true })
  passwordResetTokenHash?: string;

  @Prop({ type: Date, select: false })
  passwordResetExpires?: Date;

  // ─── Email verification ────────────────────────────────────────────────────
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ select: false, index: true, sparse: true })
  emailVerificationTokenHash?: string;

  @Prop({ type: Date, select: false })
  emailVerificationExpires?: Date;

  // ─── Brute-force lockout ───────────────────────────────────────────────────
  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date, default: null })
  lockUntil: Date | null;

  // ─── Multi-factor authentication (TOTP) ────────────────────────────────────
  @Prop({ default: false })
  mfaEnabled: boolean;

  /** Encrypted TOTP secret */
  @Prop({ select: false })
  mfaSecret?: string;

  /** Encrypted secret awaiting confirmation during setup */
  @Prop({ select: false })
  mfaPendingSecret?: string;

  @Prop({ type: [String], select: false, default: [] })
  mfaBackupCodeHashes: string[];

  /** Last accepted TOTP time step, to reject replay of the same code */
  @Prop({ select: false })
  mfaLastUsedStep?: number;

  // ─── Social login ──────────────────────────────────────────────────────────
  @Prop({ index: true, unique: true, sparse: true })
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
