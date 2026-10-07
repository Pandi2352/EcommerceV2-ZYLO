import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ReturnRequestDocument = ReturnRequest & Document;

export enum ReturnReason {
  DAMAGED_ITEM = 'DAMAGED_ITEM',
  WRONG_ITEM = 'WRONG_ITEM',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  DEFECTIVE = 'DEFECTIVE',
  OTHER = 'OTHER',
}

export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

@Schema({ _id: false })
export class ReturnItemSchema {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productSlug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ type: String, default: null })
  variantSku?: string | null;

  @Prop({ type: String, default: null })
  variantTitle?: string | null;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  refundAmount: number;
}

const ReturnItemSubSchema = SchemaFactory.createForClass(ReturnItemSchema);

@Schema({ _id: false })
export class ReturnStatusHistorySchema {
  @Prop({ required: true, enum: Object.values(ReturnStatus) })
  status: ReturnStatus;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: '' })
  note: string;

  @Prop({ default: '' })
  changedBy: string;
}

const ReturnStatusHistorySubSchema = SchemaFactory.createForClass(ReturnStatusHistorySchema);

@Schema({ timestamps: true, collection: 'return_requests' })
export class ReturnRequest {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  returnNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, uppercase: true, index: true })
  orderNumber: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  customerEmail: string;

  @Prop({ type: [ReturnItemSubSchema], required: true })
  items: ReturnItemSchema[];

  @Prop({ required: true, enum: Object.values(ReturnReason) })
  reason: ReturnReason;

  @Prop({ default: '', trim: true })
  customerNote: string;

  @Prop({ type: [String], default: [] })
  proofImages: string[];

  @Prop({
    required: true,
    enum: Object.values(ReturnStatus),
    default: ReturnStatus.REQUESTED,
    index: true,
  })
  status: ReturnStatus;

  @Prop({ type: [ReturnStatusHistorySubSchema], default: [] })
  statusHistory: ReturnStatusHistorySchema[];

  @Prop({ required: true, min: 0 })
  totalRefundAmount: number;

  @Prop({ default: '' })
  adminNotes: string;

  @Prop({ default: true })
  restockOnApproval: boolean;

  @Prop({ type: String, default: null })
  reviewedBy?: string | null;

  @Prop({ type: Date, default: null })
  reviewedAt?: Date | null;

  @Prop({ type: String, default: null })
  rejectionReason?: string | null;

  @Prop({ type: Date, default: null })
  refundProcessedAt?: Date | null;

  @Prop({ type: String, default: null })
  refundTransactionId?: string | null;
}

export const ReturnRequestSchema = SchemaFactory.createForClass(ReturnRequest);

ReturnRequestSchema.index({ userId: 1, createdAt: -1 });
ReturnRequestSchema.index({ status: 1, createdAt: -1 });
ReturnRequestSchema.index({ orderId: 1 });
