import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';
import { AuditEvent } from '../audit-event.enum';

export type AuditLogDocument = HydratedDocument<AuditLog>;

/** Retention period for security audit records */
const RETENTION_SECONDS = 180 * 24 * 60 * 60;

@Schema(baseSchemaOptions({ timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' }))
export class AuditLog extends BaseSchema {
  @Prop({ type: String, enum: Object.values(AuditEvent), required: true, index: true })
  event: AuditEvent;

  @Prop({ type: String, index: true })
  userId?: string;

  @Prop({ lowercase: true, trim: true, index: true })
  email?: string;

  @Prop()
  role?: string;

  @Prop({ type: String, index: true })
  actorId?: string;

  @Prop({ lowercase: true, trim: true, index: true })
  actorEmail?: string;

  @Prop({ type: String, index: true })
  resourceType?: string;

  @Prop({ type: String, index: true })
  resourceId?: string;

  @Prop()
  resourceName?: string;

  /** Which portal the action came from: 'customer' or 'admin' */
  @Prop({ index: true })
  portal?: string;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });
