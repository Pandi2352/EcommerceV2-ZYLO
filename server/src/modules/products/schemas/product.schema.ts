import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export interface ProductImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSpecification {
  group?: string;
  key: string;
  value: string;
}

export interface ProductVariant {
  sku: string;
  title: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  attributes: Record<string, string>;
  imageUrl?: string | null;
  isActive: boolean;
}

export interface VolumePricingTier {
  minQuantity: number;
  maxQuantity?: number | null;
  discountPercent?: number;
  unitPrice?: number | null;
}

export interface ProductSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string | null;
}

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, trim: true, maxlength: 200, index: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  sku: string;

  @Prop({ type: String, trim: true, default: null })
  barcode: string | null;

  @Prop({ type: String, trim: true, default: '' })
  description: string;

  @Prop({ type: String, trim: true, default: '' })
  shortDescription: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true,
  })
  brandId: Types.ObjectId;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  // Pricing
  @Prop({ required: true, min: 0, index: true })
  basePrice: number;

  @Prop({ type: Number, min: 0, default: null, index: true })
  salePrice: number | null;

  @Prop({ type: Number, min: 0, default: null })
  costPrice: number | null;

  @Prop({ type: String, default: 'USD' })
  currency: string;

  // Tiered Volume Pricing (B2B Bulk Pricing)
  @Prop({
    type: [
      {
        minQuantity: { type: Number, required: true, min: 1 },
        maxQuantity: { type: Number, default: null },
        discountPercent: { type: Number, default: 0, min: 0, max: 100 },
        unitPrice: { type: Number, default: null, min: 0 },
      },
    ],
    default: [],
  })
  volumeTiers: VolumePricingTier[];

  // Inventory & Stock
  @Prop({ type: Boolean, default: true })
  trackInventory: boolean;

  @Prop({ type: Number, required: true, default: 0, min: 0, index: true })
  stockQuantity: number;

  @Prop({ type: Number, default: 5 })
  lowStockThreshold: number;

  @Prop({ type: Boolean, default: false })
  allowBackorders: boolean;

  // Media
  @Prop({
    type: [
      {
        url: { type: String, required: true },
        altText: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        displayOrder: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  images: ProductImage[];

  @Prop({ type: String, default: null })
  thumbnailUrl: string | null;

  // Technical Specifications
  @Prop({
    type: [
      {
        group: { type: String, default: 'General' },
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    default: [],
  })
  specifications: ProductSpecification[];

  // Variant Matrix
  @Prop({ type: Boolean, default: false, index: true })
  hasVariants: boolean;

  @Prop({
    type: [
      {
        sku: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        salePrice: { type: Number, default: null },
        stockQuantity: { type: Number, required: true, default: 0, min: 0 },
        attributes: { type: MongooseSchema.Types.Mixed, default: {} },
        imageUrl: { type: String, default: null },
        isActive: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  variants: ProductVariant[];

  // Status & Merchandising
  @Prop({
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
    index: true,
  })
  status: ProductStatus;

  @Prop({ type: Boolean, default: false, index: true })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isNewArrival: boolean;

  @Prop({ type: Number, default: 0, min: 0, max: 5, index: true })
  ratingAverage: number;

  @Prop({ type: Number, default: 0 })
  ratingCount: number;

  // SEO
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
  seo: ProductSeo;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Query Optimization Indexes
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ categoryId: 1, status: 1, basePrice: 1 });
ProductSchema.index({ brandId: 1, status: 1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isNewArrival: 1, status: 1 });
ProductSchema.index({ stockQuantity: 1, lowStockThreshold: 1 });
ProductSchema.index(
  { name: 'text', description: 'text', sku: 'text', tags: 'text' },
  { weights: { name: 10, sku: 8, tags: 5, description: 2 } },
);
