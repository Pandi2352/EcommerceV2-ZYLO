import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type PaymentTransactionDocument = PaymentTransaction & Document;

export enum TransactionStatus {
  INITIALIZED = 'INITIALIZED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true, collection: 'payment_transactions' })
export class PaymentTransaction {
  @Prop({ type: String, default: () => `TXN-${Date.now()}-${uuidv4().slice(0, 8)}`, unique: true, index: true })
  transactionId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: false, index: true })
  orderId?: Types.ObjectId;

  @Prop({ type: String, default: null, index: true })
  orderNumber?: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, default: 'STRIPE' })
  gateway: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, default: 'USD', uppercase: true })
  currency: string;

  @Prop({ required: true, index: true })
  paymentIntentId: string;

  @Prop({ default: '' })
  clientSecret: string;

  @Prop({
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.INITIALIZED,
    index: true,
  })
  status: TransactionStatus;

  @Prop({ default: 'card' })
  paymentMethodType: string;

  @Prop({ default: null })
  cardLast4?: string;

  @Prop({ default: null })
  cardBrand?: string;

  @Prop({ default: null })
  errorCode?: string;

  @Prop({ default: null })
  errorMessage?: string;

  @Prop({ default: null })
  stripeEventId?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: null })
  refundTransactionId?: string;

  @Prop({ default: 0 })
  refundAmount?: number;

  @Prop({ default: false })
  isSimulated: boolean;
}

export const PaymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);

PaymentTransactionSchema.index({ userId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ status: 1, createdAt: -1 });
