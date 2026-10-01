import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema(baseSchemaOptions({ collection: 'permissions' }))
export class Permission extends BaseSchema {
  /** The unique key matching _id (e.g. products.edit) */
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ required: true, index: true })
  module: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  group: string;

  @Prop({ required: true, default: 0 })
  sortOrder: number;

  @Prop({ default: false })
  isSensitive: boolean;

  @Prop({ default: false, index: true })
  deprecated: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.index({ module: 1, sortOrder: 1 });
