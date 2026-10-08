import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { BaseSchema, baseSchemaOptions } from '../../../common/schemas/base.schema';
import { EmailTemplateType, TemplateVariableDefinition } from '../enums/email-template-type.enum';

export type EmailTemplateDocument = HydratedDocument<EmailTemplate>;

@Schema({ _id: false })
export class AllowedVariableSchema implements TemplateVariableDefinition {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: false })
  required: boolean;

  @Prop({ default: '' })
  example: string;
}

const AllowedVariableSubSchema = SchemaFactory.createForClass(AllowedVariableSchema);

@Schema(
  baseSchemaOptions({
    collection: 'email_templates',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }),
)
export class EmailTemplate extends BaseSchema {
  @Prop({ required: true, trim: true, index: true })
  template_key: string;

  @Prop({ required: true, trim: true })
  template_name: string;

  @Prop({
    required: true,
    enum: Object.values(EmailTemplateType),
    index: true,
  })
  template_type: EmailTemplateType;

  @Prop({ required: true, trim: true })
  subject_template: string;

  @Prop({ required: true })
  html_template: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  design_json?: Record<string, any> | null;

  @Prop({ type: [AllowedVariableSubSchema], default: [] })
  allowed_variables: AllowedVariableSchema[];

  @Prop({ default: false, index: true })
  is_active: boolean;

  @Prop({ default: false })
  is_default: boolean;

  @Prop({ default: false, index: true })
  is_deleted: boolean;

  @Prop({ type: String, default: 'SYSTEM' })
  created_by: string;

  created_at?: Date;
  updated_at?: Date;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
EmailTemplateSchema.index({ template_type: 1, is_active: 1, is_deleted: 1 });
