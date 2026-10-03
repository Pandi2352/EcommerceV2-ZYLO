import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

export interface BrandSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string | null;
}

@Schema({ timestamps: true, collection: 'brands' })
export class Brand {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ type: String, trim: true, default: '' })
  description: string;

  @Prop({ type: String, default: null })
  logoUrl: string | null;

  @Prop({ type: String, default: null })
  bannerUrl: string | null;

  @Prop({ type: String, trim: true, default: '' })
  website: string;

  @Prop({ type: String, trim: true, default: '' })
  countryOfOrigin: string;

  @Prop({ type: Boolean, default: false, index: true })
  isFeatured: boolean;

  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop({ type: Number, default: 0, index: true })
  displayOrder: number;

  @Prop({
    type: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
      canonicalUrl: { type: String, default: '' },
      ogImage: { type: String, default: null },
    },
    default: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      canonicalUrl: '',
      ogImage: null,
    },
  })
  seo: BrandSeo;

  @Prop({ type: Number, default: 0 })
  productCount: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

// High-speed query indexes
BrandSchema.index({ status: 1, displayOrder: 1 });
BrandSchema.index({ isFeatured: 1, status: 1 });
BrandSchema.index({ countryOfOrigin: 1, status: 1 });
BrandSchema.index({ name: 'text', description: 'text' });
