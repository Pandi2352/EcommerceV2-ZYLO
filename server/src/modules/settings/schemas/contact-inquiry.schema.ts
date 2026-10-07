import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactInquiryDocument = ContactInquiry & Document;

@Schema({ timestamps: true, collection: 'contact_inquiries' })
export class ContactInquiry {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: 'NEW', enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'] })
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
}

export const ContactInquirySchema = SchemaFactory.createForClass(ContactInquiry);
ContactInquirySchema.index({ createdAt: -1 });
ContactInquirySchema.index({ status: 1 });
