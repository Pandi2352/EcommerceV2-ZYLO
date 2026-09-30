import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type RefreshSessionDocument = HydratedDocument<RefreshSession>;

/**
 * One issued refresh token. `_id` is the token's `jti` claim.
 * All tokens descending from one login share a `familyId`, so a replayed
 * (already rotated) token can revoke the whole chain.
 */
@Schema({ timestamps: true, collection: 'refresh_sessions' })
export class RefreshSession extends BaseSchema {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, index: true })
  familyId: string;

  @Prop({ default: false })
  rememberMe: boolean;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  revokedAt: Date | null;
}

export const RefreshSessionSchema = SchemaFactory.createForClass(RefreshSession);

// MongoDB TTL index removes sessions once they expire
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
