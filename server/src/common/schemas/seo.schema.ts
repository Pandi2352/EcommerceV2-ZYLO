import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Common Mongoose SEO subdocument reusable across Categories, Brands, Products, and CMS pages.
 */
@Schema({ _id: false })
export class SeoMetadata {
  @Prop({ type: String, default: '', trim: true })
  metaTitle: string;

  @Prop({ type: String, default: '', trim: true })
  metaDescription: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: String, default: '', trim: true })
  canonicalUrl: string;

  @Prop({ type: String, default: null })
  ogImage: string | null;
}

export const SeoSchema = SchemaFactory.createForClass(SeoMetadata);
