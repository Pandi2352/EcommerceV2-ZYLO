export interface BrandSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string | null;
}

export interface BrandItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  website: string;
  countryOfOrigin: string;
  isFeatured: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
  productCount: number;
  seo: BrandSeo;
  createdAt: string;
  updatedAt: string;
}

export interface BrandStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  countriesCount: number;
  topCountries: Array<{ country: string; count: number }>;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  website?: string;
  countryOfOrigin?: string;
  isFeatured?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  displayOrder?: number;
  seo?: Partial<BrandSeo>;
}

export type UpdateBrandPayload = Partial<CreateBrandPayload>;

export interface BrandQueryParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  country?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedBrands {
  items: BrandItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
