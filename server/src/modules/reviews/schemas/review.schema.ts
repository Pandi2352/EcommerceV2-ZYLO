import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  })
  productId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  userId: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ type: String, default: null })
  customerAvatar: string | null;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  comment: string;

  @Prop({ type: Boolean, default: false })
  isVerifiedPurchase: boolean;

  @Prop({ type: Number, default: 0, min: 0 })
  helpfulCount: number;

  @Prop({ type: [String], default: [] })
  helpfulUserIds: string[];

  @Prop({
    type: String,
    enum: ['APPROVED', 'REJECTED', 'PENDING'],
    default: 'APPROVED',
    index: true,
  })
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Ensure one review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
// Optimize listing by product & creation date
ReviewSchema.index({ productId: 1, createdAt: -1 });
// Optimize listing by product & rating
ReviewSchema.index({ productId: 1, rating: -1 });
// Optimize listing by product & helpful votes
ReviewSchema.index({ productId: 1, helpfulCount: -1 });
