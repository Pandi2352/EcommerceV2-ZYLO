import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ _id: false })
export class Address {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  get id(): string {
    return this._id;
  }

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

  @Prop({ trim: true })
  phone?: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
