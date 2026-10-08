import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type AbandonedCartDocument = HydratedDocument<AbandonedCart>;

export enum AbandonedCartStage {
  STAGE_1_REMINDER = 'STAGE_1_REMINDER',
  STAGE_2_DISCOUNT = 'STAGE_2_DISCOUNT',
  STAGE_3_FINAL = 'STAGE_3_FINAL',
  RECOVERED = 'RECOVERED',
  EXPIRED = 'EXPIRED',
}

export enum AbandonedCartStatus {
  ABANDONED = 'ABANDONED',
  RECOVERED = 'RECOVERED',
  EXPIRED = 'EXPIRED',
}

@Schema({ _id: false })
export class AbandonedCartItemSnapshot {
  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, default: '' })
  imageUrl: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true, default: 1 })
  quantity: number;

  @Prop({ type: String, default: null })
  variantSku?: string | null;
}

export const AbandonedCartItemSnapshotSchema =
  SchemaFactory.createForClass(AbandonedCartItemSnapshot);

@Schema(baseSchemaOptions({ collection: 'abandoned_carts' }))
export class AbandonedCart extends BaseSchema {
  @Prop({ type: String, required: true, index: true })
  cartId: string;

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, index: true })
  customerEmail: string;

  @Prop({ type: String, required: true })
  customerName: string;

  @Prop({ type: Number, required: true, default: 0 })
  cartTotal: number;

  @Prop({ type: Number, required: true, default: 0 })
  subtotal: number;

  @Prop({ type: Number, required: true, default: 0 })
  itemCount: number;

  @Prop({ type: [AbandonedCartItemSnapshotSchema], default: [] })
  items: AbandonedCartItemSnapshot[];

  @Prop({ type: String, required: true, unique: true, index: true })
  recoveryToken: string;

  @Prop({ type: String, default: null })
  discountCouponCode?: string | null;

  @Prop({
    type: String,
    enum: Object.values(AbandonedCartStage),
    default: AbandonedCartStage.STAGE_1_REMINDER,
    index: true,
  })
  stage: AbandonedCartStage;

  @Prop({
    type: String,
    enum: Object.values(AbandonedCartStatus),
    default: AbandonedCartStatus.ABANDONED,
    index: true,
  })
  status: AbandonedCartStatus;

  @Prop({ type: Date, default: null })
  stage1SentAt?: Date | null;

  @Prop({ type: Date, default: null })
  stage2SentAt?: Date | null;

  @Prop({ type: Date, default: null })
  stage3SentAt?: Date | null;

  @Prop({ type: Number, default: 0 })
  emailsSentCount: number;

  @Prop({ type: Date, default: null })
  recoveredAt?: Date | null;

  @Prop({ type: String, default: null })
  recoveredOrderId?: string | null;

  @Prop({ type: Number, default: 0 })
  recoveredRevenue: number;

  @Prop({ type: Date, required: true })
  lastActivityAt: Date;
}

export const AbandonedCartSchema = SchemaFactory.createForClass(AbandonedCart);

AbandonedCartSchema.index({ status: 1, lastActivityAt: -1 });
AbandonedCartSchema.index({ customerEmail: 1, status: 1 });
