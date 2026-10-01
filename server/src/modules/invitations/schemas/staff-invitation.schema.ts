import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type StaffInvitationDocument = HydratedDocument<StaffInvitation>;

export enum InvitationStatus {
  INVITED = 'INVITED',
  REGISTERED = 'REGISTERED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

@Schema(baseSchemaOptions({ collection: 'staff_invitations' }))
export class StaffInvitation extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 60 })
  firstName: string;

  @Prop({ required: true, trim: true, maxlength: 60 })
  lastName: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  /** Reference code assigned to this invitee (e.g. ZY-0042) */
  @Prop({ required: true, trim: true, index: true })
  userCode: string;

  @Prop({ trim: true, maxlength: 80 })
  designation?: string;

  @Prop({ type: [String], required: true })
  roleIds: string[];

  @Prop({ maxlength: 500, trim: true })
  message?: string;

  @Prop({ required: true, select: false, index: true })
  tokenHash: string;

  /**
   * AES-GCM encrypted copy of the raw token so admins can copy the link while the
   * invitation is pending. Cleared once it is accepted or revoked.
   */
  @Prop({ select: false })
  tokenEncrypted?: string;

  @Prop({
    type: String,
    enum: Object.values(InvitationStatus),
    default: InvitationStatus.INVITED,
    index: true,
  })
  status: InvitationStatus;

  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @Prop({ required: true })
  invitedBy: string;

  @Prop()
  invitedByName?: string;

  @Prop({ default: 1 })
  sentCount: number;

  @Prop({ type: Date, default: () => new Date() })
  lastSentAt: Date;

  @Prop({ type: Date })
  registeredAt?: Date;

  @Prop()
  userId?: string;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop()
  revokedBy?: string;
}

export const StaffInvitationSchema = SchemaFactory.createForClass(StaffInvitation);
StaffInvitationSchema.index({ email: 1, status: 1 });
StaffInvitationSchema.index({ status: 1, expiresAt: 1 });
