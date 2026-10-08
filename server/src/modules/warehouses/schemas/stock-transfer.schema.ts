import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';
import { TransferStatus } from '../enums/warehouse.enums';

export type StockTransferDocument = HydratedDocument<StockTransfer>;

@Schema({ _id: false })
export class TransferItem {
  @Prop({ required: true, trim: true })
  sku: string;

  @Prop({ required: true, trim: true })
  productName: string;

  @Prop({ default: '' })
  variantTitle: string;

  @Prop({ required: true, min: 1 })
  requestedQty: number;

  @Prop({ default: 0 })
  shippedQty: number;

  @Prop({ default: 0 })
  receivedQty: number;
}

const TransferItemSchema = SchemaFactory.createForClass(TransferItem);

@Schema(
  baseSchemaOptions({
    collection: 'stock_transfers',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }),
)
export class StockTransfer extends BaseSchema {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  transferNumber: string;

  @Prop({ required: true, index: true })
  sourceWarehouseId: string;

  @Prop({ required: true, trim: true })
  sourceWarehouseName: string;

  @Prop({ required: true, index: true })
  destinationWarehouseId: string;

  @Prop({ required: true, trim: true })
  destinationWarehouseName: string;

  @Prop({
    required: true,
    enum: Object.values(TransferStatus),
    default: TransferStatus.PENDING_APPROVAL,
    index: true,
  })
  status: TransferStatus;

  @Prop({ type: [TransferItemSchema], default: [] })
  items: TransferItem[];

  @Prop({ default: 0 })
  totalItemsCount: number;

  @Prop({ default: 0 })
  totalQuantity: number;

  @Prop({ default: '' })
  carrier: string;

  @Prop({ default: '' })
  trackingNumber: string;

  @Prop({ type: Date, default: null })
  estimatedArrival: Date | null;

  @Prop({ type: Date, default: null })
  shippedAt: Date | null;

  @Prop({ type: Date, default: null })
  receivedAt: Date | null;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 'Admin' })
  createdBy: string;

  @Prop({ default: '' })
  approvedBy: string;

  @Prop({ default: '' })
  receivedBy: string;

  @Prop({ default: false, index: true })
  is_deleted: boolean;
}

export const StockTransferSchema = SchemaFactory.createForClass(StockTransfer);
