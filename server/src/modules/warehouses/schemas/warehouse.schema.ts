import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';
import { WarehouseType, WarehouseStatus } from '../enums/warehouse.enums';

export type WarehouseDocument = HydratedDocument<Warehouse>;

@Schema({ _id: false })
export class WarehouseAddress {
  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  postalCode: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ default: 0 })
  latitude: number;

  @Prop({ default: 0 })
  longitude: number;
}

const WarehouseAddressSchema = SchemaFactory.createForClass(WarehouseAddress);

@Schema(
  baseSchemaOptions({
    collection: 'warehouses',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }),
)
export class Warehouse extends BaseSchema {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({
    required: true,
    enum: Object.values(WarehouseType),
    default: WarehouseType.REGIONAL_HUB,
    index: true,
  })
  type: WarehouseType;

  @Prop({
    required: true,
    enum: Object.values(WarehouseStatus),
    default: WarehouseStatus.ACTIVE,
    index: true,
  })
  status: WarehouseStatus;

  @Prop({ default: false, index: true })
  isDefault: boolean;

  @Prop({ type: WarehouseAddressSchema, required: true })
  address: WarehouseAddress;

  @Prop({ required: true, trim: true })
  contactPerson: string;

  @Prop({ required: true, trim: true })
  contactEmail: string;

  @Prop({ required: true, trim: true })
  contactPhone: string;

  @Prop({ default: 50000 })
  capacitySqFt: number;

  @Prop({ default: 'Mon - Fri: 8:00 AM - 6:00 PM EST' })
  operatingHours: string;

  @Prop({ type: [String], default: [] })
  servicedRegions: string[];

  @Prop({ default: 0 })
  totalInventoryUnits: number;

  @Prop({ default: 0 })
  activeTransfersCount: number;

  @Prop({ default: false, index: true })
  is_deleted: boolean;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
