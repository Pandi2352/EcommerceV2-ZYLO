import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type RegistrationOtpDocument = HydratedDocument<RegistrationOtp>;

@Schema(baseSchemaOptions({ collection: 'registration_otps' }))
export class RegistrationOtp extends BaseSchema {
  @Prop({ type: String, required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  otpHash: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, required: true })
  lastSentAt: Date;

  @Prop({ type: Number, default: 0 })
  attempts: number;
}

export const RegistrationOtpSchema = SchemaFactory.createForClass(RegistrationOtp);
RegistrationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
