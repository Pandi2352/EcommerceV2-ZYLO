import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type PurchaseOrderDocument = HydratedDocument<PurchaseOrder>;

export enum POStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum POPaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

@Schema({ _id: false })
export class POLineItem {
  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 1 })
  orderedQty: number;

  @Prop({ type: Number, default: 0, min: 0 })
  receivedQty: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitCost: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalCost: number;
}
export const POLineItemSchema = SchemaFactory.createForClass(POLineItem);

@Schema(baseSchemaOptions({ collection: 'purchase_orders' }))
export class PurchaseOrder extends BaseSchema {
  @Prop({ type: String, required: true, unique: true, uppercase: true, trim: true })
  poNumber: string;

  @Prop({ type: String, required: true })
  supplierId: string;

  @Prop({ type: String, required: true })
  supplierName: string;

  @Prop({ type: String, default: '' })
  supplierCode: string;

  @Prop({ type: String, required: true })
  destinationWarehouseId: string;

  @Prop({ type: String, default: '' })
  destinationWarehouseCode: string;

  @Prop({ type: String, required: true })
  destinationWarehouseName: string;

  @Prop({ type: [POLineItemSchema], default: [] })
  items: POLineItem[];

  @Prop({ type: Number, required: true, default: 0 })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  shippingCost: number;

  @Prop({ type: Number, default: 0 })
  taxAmount: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalAmount: number;

  @Prop({
    type: String,
    enum: Object.values(POStatus),
    default: POStatus.DRAFT,
  })
  status: POStatus;

  @Prop({
    type: String,
    enum: Object.values(POPaymentStatus),
    default: POPaymentStatus.UNPAID,
  })
  paymentStatus: POPaymentStatus;

  @Prop({ type: Date, default: null })
  expectedDeliveryDate?: Date;

  @Prop({ type: Date, default: null })
  issuedAt?: Date;

  @Prop({ type: Date, default: null })
  receivedAt?: Date;

  @Prop({ type: String, default: 'System Admin' })
  createdBy: string;

  @Prop({ type: String, default: '' })
  notes?: string;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
PurchaseOrderSchema.index({ supplierId: 1, status: 1 });
PurchaseOrderSchema.index({ destinationWarehouseId: 1 });
