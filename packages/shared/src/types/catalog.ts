export interface CategoryAncestor {
  _id: string;
  name: string;
  slug: string;
  level: number;
}

export interface CategoryBadge {
  text: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

export interface CategorySeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string | null;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | { _id: string; name: string; slug: string } | null;
  ancestors: CategoryAncestor[];
  level: number;
  iconUrl: string | null;
  thumbnailUrl: string | null;
  bannerDesktopUrl: string | null;
  bannerMobileUrl: string | null;
  imageAltText: string;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
  includeInMenu: boolean;
  isFeatured: boolean;
  badge: CategoryBadge | null;
  filterableAttributes: string[];
  seo: CategorySeo;
  productCount: number;
  activeProductCount: number;
  subcategoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode extends CategoryItem {
  children: CategoryTreeNode[];
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  rootCount: number;
  subCount: number;
  featuredCount: number;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  iconUrl?: string | null;
  thumbnailUrl?: string | null;
  bannerDesktopUrl?: string | null;
  bannerMobileUrl?: string | null;
  imageAltText?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  displayOrder?: number;
  includeInMenu?: boolean;
  isFeatured?: boolean;
  badge?: CategoryBadge | null;
  filterableAttributes?: string[];
  seo?: Partial<CategorySeo>;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface CategoryQueryParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  parentId?: string;
  level?: number;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCategories {
  items: CategoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
