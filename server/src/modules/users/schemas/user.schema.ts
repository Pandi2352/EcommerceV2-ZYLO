import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';
import { Address, AddressSchema } from './address.schema';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret.passwordHash;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret.passwordHash;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    },
  },
})
export class User extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CUSTOMER,
    index: true,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
