import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

@Schema({ _id: false })
export class UserCouponUsage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  count: number;
}
export const UserCouponUsageSchema = SchemaFactory.createForClass(UserCouponUsage);

@Schema({ timestamps: true, collection: 'coupons' })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(CouponDiscountType),
    default: CouponDiscountType.PERCENTAGE,
    index: true,
  })
  discountType: CouponDiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ type: Number, default: 0, min: 0 })
  minOrderAmount: number;

  @Prop({ type: Number, default: null, min: 0 })
  maxDiscountAmount?: number | null;

  @Prop({ type: Date, default: null })
  startDate?: Date | null;

  @Prop({ type: Date, default: null, index: true })
  endDate?: Date | null;

  @Prop({ type: Number, default: null, min: 1 })
  usageLimit?: number | null;

  @Prop({ type: Number, default: 1, min: 1 })
  perUserLimit: number;

  @Prop({ type: Number, default: 0, min: 0 })
  usedCount: number;

  @Prop({ type: [UserCouponUsageSchema], default: [] })
  userUsage: UserCouponUsage[];

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ code: 1, isActive: 1 });
CouponSchema.index({ isActive: 1, endDate: 1 });
