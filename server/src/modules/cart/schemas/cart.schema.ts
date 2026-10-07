import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItemSchema {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: String, default: null })
  variantSku?: string | null;

  @Prop({ type: Number, required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ type: Boolean, default: true })
  selected: boolean;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;
}

const CartItemSubSchema = SchemaFactory.createForClass(CartItemSchema);

@Schema({ timestamps: true, collection: 'carts' })
export class Cart {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: [CartItemSubSchema], default: [] })
  items: CartItemSchema[];

  @Prop({ type: [CartItemSubSchema], default: [] })
  savedForLater: CartItemSchema[];

  @Prop({ type: String, default: null })
  appliedCoupon?: string | null;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
