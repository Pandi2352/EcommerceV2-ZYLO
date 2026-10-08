import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type BundleDocument = Bundle & Document;

@Schema({ _id: false })
export class BundleItemConfig {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({ type: String, default: null })
  variantSku?: string | null;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  discountPercent?: number;

  @Prop({ type: Boolean, default: true })
  isOptional: boolean;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;
}

export const BundleItemConfigSchema = SchemaFactory.createForClass(BundleItemConfig);

@Schema({ timestamps: true, collection: 'product_bundles' })
export class Bundle {
  @Prop({ required: true, trim: true, maxlength: 200, index: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ default: 'Frequently Bought Together', trim: true })
  badgeText: string;

  @Prop({ type: String, default: null, trim: true })
  description?: string | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  })
  primaryProductId: Types.ObjectId;

  @Prop({ type: [BundleItemConfigSchema], default: [] })
  items: BundleItemConfig[];

  @Prop({ type: Number, default: 10, min: 0, max: 100 })
  bundleDiscountPercent: number;

  @Prop({ type: Number, default: null })
  bundleFixedPrice?: number | null;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const BundleSchema = SchemaFactory.createForClass(Bundle);

BundleSchema.index({ primaryProductId: 1, isActive: 1 });
BundleSchema.index({ slug: 1 }, { unique: true });
