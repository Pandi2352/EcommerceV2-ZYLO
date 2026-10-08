import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type WarehouseInventoryDocument = HydratedDocument<WarehouseInventory>;

@Schema(
  baseSchemaOptions({
    collection: 'warehouse_inventory',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }),
)
export class WarehouseInventory extends BaseSchema {
  @Prop({ required: true, index: true })
  warehouseId: string;

  @Prop({ required: true, index: true })
  sku: string;

  @Prop({ required: true, trim: true })
  productName: string;

  @Prop({ default: '' })
  variantTitle: string;

  @Prop({ default: 0, min: 0 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  reservedQuantity: number;

  @Prop({ default: 10 })
  safetyStock: number;

  @Prop({ default: 'Main Staging' })
  binLocation: string;
}

export const WarehouseInventorySchema = SchemaFactory.createForClass(WarehouseInventory);
WarehouseInventorySchema.index({ warehouseId: 1, sku: 1 }, { unique: true });
