import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  COD = 'COD',
  ONLINE = 'ONLINE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum DeliveryMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
}

@Schema({ _id: false })
export class OrderItemSchema {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productSlug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  brandName: string;

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
  lineTotal: number;
}

const OrderItemSubSchema = SchemaFactory.createForClass(OrderItemSchema);

@Schema({ _id: false })
export class OrderShippingAddressSchema {
  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  postalCode: string;

  @Prop({ required: true, trim: true, default: 'US' })
  country: string;

  @Prop({ trim: true, default: '' })
  phone: string;
}

const OrderShippingAddressSubSchema = SchemaFactory.createForClass(OrderShippingAddressSchema);

@Schema({ _id: false })
export class OrderStatusHistorySchema {
  @Prop({ required: true, enum: Object.values(OrderStatus) })
  status: OrderStatus;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: '' })
  note?: string;
}

const OrderStatusHistorySubSchema = SchemaFactory.createForClass(OrderStatusHistorySchema);

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  orderNumber: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, lowercase: true, trim: true })
  customerEmail: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ type: OrderShippingAddressSubSchema, required: true })
  shippingAddress: OrderShippingAddressSchema;

  @Prop({ type: [OrderItemSubSchema], default: [] })
  items: OrderItemSchema[];

  @Prop({
    type: String,
    enum: Object.values(DeliveryMethod),
    default: DeliveryMethod.STANDARD,
  })
  deliveryMethod: DeliveryMethod;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  shippingFee: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount: number;

  @Prop({ type: String, default: null })
  appliedCoupon?: string | null;

  @Prop({ required: true, min: 0, default: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  grandTotal: number;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.COD,
  })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CONFIRMED,
    index: true,
  })
  orderStatus: OrderStatus;

  @Prop({ type: [OrderStatusHistorySubSchema], default: [] })
  statusHistory: OrderStatusHistorySchema[];

  @Prop({ type: Date, required: true })
  estimatedDeliveryDate: Date;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ type: String, default: null })
  courierName?: string | null;

  @Prop({ type: String, default: null })
  trackingNumber?: string | null;

  @Prop({ type: String, default: null })
  trackingUrl?: string | null;

  @Prop({ type: Date, default: null })
  shippedAt?: Date | null;

  @Prop({ type: Date, default: null })
  deliveredAt?: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt?: Date | null;

  @Prop({ type: String, default: null })
  cancellationReason?: string | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ userId: 1, createdAt: -1 });
