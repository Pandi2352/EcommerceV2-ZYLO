import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type ReceivingDockDocument = HydratedDocument<ReceivingDock>;

@Schema({ _id: false })
export class ReceivingItem {
  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  deliveredQty: number;

  @Prop({ type: Number, required: true, min: 0 })
  acceptedQty: number;

  @Prop({ type: Number, default: 0, min: 0 })
  rejectedQty: number;

  @Prop({ type: String, default: '' })
  rejectionReason?: string;
}
export const ReceivingItemSchema = SchemaFactory.createForClass(ReceivingItem);

@Schema(baseSchemaOptions({ collection: 'receiving_dock_receipts' }))
export class ReceivingDock extends BaseSchema {
  @Prop({ type: String, required: true, unique: true, uppercase: true })
  receiptNumber: string;

  @Prop({ type: String, required: true })
  poId: string;

  @Prop({ type: String, required: true })
  poNumber: string;

  @Prop({ type: String, required: true })
  supplierName: string;

  @Prop({ type: String, required: true })
  warehouseId: string;

  @Prop({ type: String, required: true })
  warehouseName: string;

  @Prop({ type: String, default: 'Bay 1 - Inbound Freight' })
  dockBay: string;

  @Prop({ type: String, default: 'Lead Logistics Inspector' })
  inspectorName: string;

  @Prop({ type: [ReceivingItemSchema], default: [] })
  items: ReceivingItem[];

  @Prop({ type: Boolean, default: true })
  passedInspection: boolean;

  @Prop({ type: String, default: '' })
  notes?: string;

  @Prop({ type: Date, default: Date.now })
  receivedAt: Date;
}

export const ReceivingDockSchema = SchemaFactory.createForClass(ReceivingDock);
ReceivingDockSchema.index({ poId: 1 });
ReceivingDockSchema.index({ warehouseId: 1 });
