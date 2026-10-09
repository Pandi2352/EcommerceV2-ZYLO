import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type ShipmentDispatchDocument = HydratedDocument<ShipmentDispatch>;

export enum ShippingCarrier {
  FEDEX = 'FEDEX',
  UPS = 'UPS',
  DHL = 'DHL',
  USPS = 'USPS',
}

export enum ServiceLevel {
  STANDARD_GROUND = 'STANDARD_GROUND',
  EXPRESS_2DAY = 'EXPRESS_2DAY',
  OVERNIGHT_PRIORITY = 'OVERNIGHT_PRIORITY',
  INTERNATIONAL_EXPEDITED = 'INTERNATIONAL_EXPEDITED',
}

export enum ShipmentStatus {
  MANIFEST_CREATED = 'MANIFEST_CREATED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
}

@Schema({ _id: false })
export class TrackingMilestone {
  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, default: '' })
  location: string;

  @Prop({ type: String, required: true })
  message: string;
}
export const TrackingMilestoneSchema = SchemaFactory.createForClass(TrackingMilestone);

@Schema(baseSchemaOptions({ collection: 'shipment_dispatches' }))
export class ShipmentDispatch extends BaseSchema {
  @Prop({ type: String, required: true, unique: true, uppercase: true })
  shipmentNumber: string;

  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({ type: String, required: true })
  orderNumber: string;

  @Prop({ type: String, required: true })
  customerName: string;

  @Prop({ type: String, required: true })
  customerEmail: string;

  @Prop({
    type: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    default: {},
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({ type: String, required: true })
  originWarehouseId: string;

  @Prop({ type: String, required: true })
  originWarehouseName: string;

  @Prop({
    type: String,
    enum: Object.values(ShippingCarrier),
    default: ShippingCarrier.FEDEX,
  })
  carrier: ShippingCarrier;

  @Prop({
    type: String,
    enum: Object.values(ServiceLevel),
    default: ServiceLevel.STANDARD_GROUND,
  })
  serviceLevel: ServiceLevel;

  @Prop({ type: Number, default: 1.5, min: 0.1 })
  packageWeightKg: number;

  @Prop({
    type: {
      length: { type: Number, default: 30 },
      width: { type: Number, default: 20 },
      height: { type: Number, default: 15 },
      unit: { type: String, default: 'cm' },
    },
    default: {},
  })
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @Prop({ type: Number, required: true, default: 12.5 })
  shippingCost: number;

  @Prop({ type: String, required: true, unique: true, uppercase: true })
  trackingNumber: string;

  @Prop({
    type: String,
    enum: Object.values(ShipmentStatus),
    default: ShipmentStatus.MANIFEST_CREATED,
  })
  status: ShipmentStatus;

  @Prop({ type: [TrackingMilestoneSchema], default: [] })
  trackingHistory: TrackingMilestone[];

  @Prop({ type: String, default: '' })
  routingCode: string;

  @Prop({ type: String, default: '' })
  thermalLabelBarcode: string;

  @Prop({ type: Date, default: Date.now })
  dispatchedAt: Date;

  @Prop({ type: Date, default: null })
  deliveredAt?: Date;

  @Prop({ type: String, default: '' })
  notes?: string;
}

export const ShipmentDispatchSchema = SchemaFactory.createForClass(ShipmentDispatch);
ShipmentDispatchSchema.index({ trackingNumber: 1 });
ShipmentDispatchSchema.index({ orderId: 1 });
ShipmentDispatchSchema.index({ carrier: 1, status: 1 });
