import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type SupplierDocument = HydratedDocument<Supplier>;

export enum PaymentTerms {
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
  IMMEDIATE = 'IMMEDIATE',
  ADVANCE_50 = 'ADVANCE_50',
}

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema(baseSchemaOptions({ collection: 'suppliers' }))
export class Supplier extends BaseSchema {
  @Prop({ type: String, required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  contactPerson: string;

  @Prop({ type: String, required: true, trim: true })
  email: string;

  @Prop({ type: String, required: true, trim: true })
  phone: string;

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
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({
    type: String,
    enum: Object.values(PaymentTerms),
    default: PaymentTerms.NET_30,
  })
  paymentTerms: PaymentTerms;

  @Prop({ type: Number, default: 7 })
  leadTimeDays: number;

  @Prop({
    type: String,
    enum: Object.values(SupplierStatus),
    default: SupplierStatus.ACTIVE,
  })
  status: SupplierStatus;

  @Prop({ type: Number, default: 4.8, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, default: '' })
  taxId?: string;

  @Prop({ type: String, default: '' })
  notes?: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.index({ name: 'text', contactPerson: 'text', email: 'text' });
