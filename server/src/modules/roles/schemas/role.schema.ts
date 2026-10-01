import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';

export type RoleDocument = HydratedDocument<Role>;

export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema(baseSchemaOptions({ collection: 'roles' }))
export class Role extends BaseSchema {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 60 })
  name: string;

  /** Immutable system identifier (e.g. super_admin, operations_manager) */
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  key: string;

  @Prop({ default: '', maxlength: 300, trim: true })
  description: string;

  /** Array of permission keys, or ['*'] for super_admin */
  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: String, enum: Object.values(RoleStatus), default: RoleStatus.ACTIVE, index: true })
  status: RoleStatus;

  /** System-seeded roles (super_admin, admin) cannot be deleted */
  @Prop({ default: false, index: true })
  isSystem: boolean;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
