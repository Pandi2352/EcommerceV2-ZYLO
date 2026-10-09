import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type CarrierWebhookDocument = HydratedDocument<CarrierWebhook>;

@Schema(baseSchemaOptions({ collection: 'carrier_webhooks' }))
export class CarrierWebhook extends BaseSchema {
  @Prop({ type: String, required: true })
  carrier: string;

  @Prop({ type: String, required: true })
  trackingNumber: string;

  @Prop({ type: String, required: true })
  event: string;

  @Prop({ type: String, default: '' })
  location: string;

  @Prop({ type: Object, default: {} })
  rawPayload: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  receivedAt: Date;
}

export const CarrierWebhookSchema = SchemaFactory.createForClass(CarrierWebhook);
CarrierWebhookSchema.index({ trackingNumber: 1, receivedAt: -1 });
