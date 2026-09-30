import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';
import { UserRole } from '../../../common/enums/user-role.enum';

export type StaffInvitationDocument = HydratedDocument<StaffInvitation>;

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

function stripInvitationSecrets(_: unknown, ret: Record<string, any>) {
  delete ret.tokenHash;
  delete ret.__v;
  return ret;
}

@Schema(baseSchemaOptions({ collection: 'staff_invitations', transform: stripInvitationSecrets }))
export class StaffInvitation extends BaseSchema {
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    required: true,
  })
  role: UserRole;

  @Prop({ type: [String], default: [] })
  customPermissions: string[];

  /** SHA-256 hash of single-use URL invite token */
  @Prop({ required: true, select: false, index: true })
  tokenHash: string;

  @Prop({ required: true, type: Date, index: true })
  expiresAt: Date;

  @Prop({
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
    default: 'PENDING',
    index: true,
  })
  status: InvitationStatus;

  @Prop({ type: String, required: true, index: true })
  invitedBy: string;

  @Prop({ type: String })
  invitedByName?: string;

  @Prop({ type: Date })
  acceptedAt?: Date;
}

export const StaffInvitationSchema = SchemaFactory.createForClass(StaffInvitation);

StaffInvitationSchema.index({ email: 1, status: 1 });
