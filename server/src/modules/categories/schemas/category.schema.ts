import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

export interface CategoryAncestor {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  level: number;
}

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ type: String, trim: true, default: '' })
  description: string;

  // Parent reference (null for Root level categories)
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null, index: true })
  parentId: Types.ObjectId | null;

  // Materialized path of ancestors for instant breadcrumbs and sub-millisecond traversal
  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, ref: 'Category' },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        level: { type: Number, required: true },
      },
    ],
    default: [],
  })
  ancestors: CategoryAncestor[];

  @Prop({ type: Number, default: 1 })
  level: number; // 1 = Root, 2 = Subcategory, 3 = Sub-subcategory, etc.

  // Media & visual assets
  @Prop({ type: String, default: null })
  iconUrl: string | null;

  @Prop({ type: String, default: null })
  thumbnailUrl: string | null;

  @Prop({ type: String, default: null })
  bannerDesktopUrl: string | null;

  @Prop({ type: String, default: null })
  bannerMobileUrl: string | null;

  @Prop({ type: String, default: '' })
  imageAltText: string;

  // Merchandising & Storefront Navigation
  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop({ type: Number, default: 0, index: true })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  includeInMenu: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({
    type: {
      text: { type: String, default: '' },
      color: { type: String, default: 'indigo' }, // indigo, emerald, amber, rose
    },
    default: null,
  })
  badge: { text: string; color?: string } | null;

  @Prop({ type: Date, default: null })
  badgeExpiresAt: Date | null;

  // Phase 2: Dynamic Smart Collections (Automated Rule-Based Category)
  @Prop({ type: Boolean, default: false })
  isSmartCollection: boolean;

  @Prop({ type: String, enum: ['ALL', 'ANY'], default: 'ALL' })
  rulesCondition: 'ALL' | 'ANY';

  @Prop({
    type: [
      {
        field: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    default: [],
  })
  rules: Array<{ field: string; operator: string; value: string }>;

  // Dynamic filter facets (product attribute keys applicable to this category)
  @Prop({ type: [String], default: [] })
  filterableAttributes: string[];

  // SEO & Social sharing metadata
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
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    ogImage: string | null;
  };

  // Denormalized counters for lightning-fast listings
  @Prop({ type: Number, default: 0 })
  productCount: number;

  @Prop({ type: Number, default: 0 })
  activeProductCount: number;

  @Prop({ type: Number, default: 0 })
  subcategoryCount: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Compound indexes for high-speed listing and tree building
CategorySchema.index({ status: 1, displayOrder: 1 });
CategorySchema.index({ parentId: 1, displayOrder: 1 });
CategorySchema.index({ 'ancestors._id': 1 });
CategorySchema.index({ level: 1, displayOrder: 1 });
CategorySchema.index({ isFeatured: 1, status: 1 });
