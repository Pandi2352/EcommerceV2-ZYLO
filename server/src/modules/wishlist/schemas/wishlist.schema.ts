import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type WishlistDocument = Wishlist & Document;

@Schema({ _id: false })
export class WishlistItemSchema {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: String, default: null })
  variantSku?: string | null;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;
}

const WishlistItemSubSchema = SchemaFactory.createForClass(WishlistItemSchema);

@Schema({ timestamps: true, collection: 'wishlists' })
export class Wishlist {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: [WishlistItemSubSchema], default: [] })
  items: WishlistItemSchema[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
