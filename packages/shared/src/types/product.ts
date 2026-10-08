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

export interface ProductSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string | null;
}

export interface VolumePricingTier {
  minQuantity: number;
  maxQuantity?: number | null;
  discountPercent?: number;
  unitPrice?: number | null;
}

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  description: string;
  shortDescription: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
    iconUrl?: string | null;
  };
  brandId: {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  tags: string[];
  basePrice: number;
  salePrice?: number | null;
  costPrice?: number | null;
  currency: string;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  images: ProductImage[];
  thumbnailUrl: string | null;
  specifications: ProductSpecification[];
  hasVariants: boolean;
  variants: ProductVariant[];
  volumeTiers?: VolumePricingTier[];
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  ratingAverage: number;
  ratingCount: number;
  seo: ProductSeo;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMetrics {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  uniqueBrandsCount: number;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  sku?: string;
  barcode?: string | null;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  brandId: string;
  tags?: string[];
  basePrice: number;
  salePrice?: number | null;
  costPrice?: number | null;
  currency?: string;
  trackInventory?: boolean;
  stockQuantity: number;
  lowStockThreshold?: number;
  allowBackorders?: boolean;
  images?: ProductImage[];
  thumbnailUrl?: string | null;
  specifications?: ProductSpecification[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  volumeTiers?: VolumePricingTier[];
  status?: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  seo?: Partial<ProductSeo>;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface QueryProductParams {
  search?: string;
  categoryId?: string;
  categoryIds?: string;
  brandId?: string;
  brandIds?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  inStockOnly?: boolean;
  minRating?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'rating' | 'stock';
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  items: ProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFacets {
  total: number;
  inStockCount: number;
  priceRange: {
    min: number;
    max: number;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    count: number;
  }[];
  brands: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    count: number;
  }[];
}

export interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  sku: string;
  thumbnailUrl: string | null;
  basePrice: number;
  salePrice: number | null;
  categoryName: string;
  brandName: string;
}

export interface ProductOverviewData {
  generatedAt: string;
  summary: {
    totalProducts: number;
    published: number;
    draft: number;
    archived: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    featured: number;
    newArrivals: number;
    withDiscount: number;
    withVariants: number;
    totalInventoryValue: number;
    averagePrice: number;
    totalStockUnits: number;
  };
  stockStatusBreakdown: {
    key: string;
    label: string;
    value: number;
    color: string;
  }[];
  priceTierBreakdown: {
    key: string;
    label: string;
    value: number;
    color: string;
  }[];
  merchandising: {
    featured: number;
    standard: number;
    newArrivals: number;
    standardArrivals: number;
    withDiscount: number;
    fullPrice: number;
    withVariants: number;
    singleSku: number;
  };
  categoryDistribution: {
    id: string;
    name: string;
    count: number;
    percentage: number;
  }[];
  brandDistribution: {
    id: string;
    name: string;
    logoUrl?: string;
    count: number;
    percentage: number;
  }[];
  recentProducts: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    thumbnailUrl: string | null;
    basePrice: number;
    salePrice: number | null;
    stockQuantity: number;
    status: ProductStatus;
    isFeatured: boolean;
    isNewArrival: boolean;
    categoryName: string;
    brandName: string;
    createdAt?: string;
  }[];
}
