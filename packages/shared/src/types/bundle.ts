export interface BundleItemProductSummary {
  productId: string;
  variantSku?: string | null;
  name: string;
  slug: string;
  image: string;
  basePrice: number;
  salePrice: number;
  bundlePrice: number;
  savings: number;
  discountPercent: number;
  stockQuantity: number;
  trackInventory: boolean;
  inStock: boolean;
  isPrimary: boolean;
  isOptional: boolean;
}

export interface EnrichedProductBundle {
  _id: string;
  title: string;
  slug: string;
  badgeText: string;
  description?: string | null;
  primaryProductId: string;
  items: BundleItemProductSummary[];
  totalOriginalPrice: number;
  totalBundlePrice: number;
  totalSavings: number;
  effectiveDiscountPercent: number;
  bundleDiscountPercent: number;
  isActive: boolean;
}

export interface RawBundleItemConfig {
  productId: any;
  variantSku?: string | null;
  discountPercent?: number;
  isOptional?: boolean;
  displayOrder?: number;
}

export interface AdminProductBundle {
  _id: string;
  title: string;
  slug: string;
  badgeText: string;
  description?: string | null;
  primaryProductId: {
    _id: string;
    name: string;
    slug: string;
    basePrice: number;
    thumbnailUrl?: string;
  };
  items: {
    productId: {
      _id: string;
      name: string;
      slug: string;
      basePrice: number;
      thumbnailUrl?: string;
    };
    variantSku?: string | null;
    discountPercent?: number;
    isOptional?: boolean;
    displayOrder?: number;
  }[];
  bundleDiscountPercent: number;
  bundleFixedPrice?: number | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BundleMetrics {
  totalBundles: number;
  activeBundles: number;
  inactiveBundles: number;
  averageDiscountPercent: number;
  fixedPriceBundles: number;
}

export interface CreateBundlePayload {
  title: string;
  slug?: string;
  badgeText?: string;
  description?: string;
  primaryProductId: string;
  items: {
    productId: string;
    variantSku?: string | null;
    discountPercent?: number;
    isOptional?: boolean;
    displayOrder?: number;
  }[];
  bundleDiscountPercent?: number;
  bundleFixedPrice?: number | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateBundlePayload extends Partial<CreateBundlePayload> {}
