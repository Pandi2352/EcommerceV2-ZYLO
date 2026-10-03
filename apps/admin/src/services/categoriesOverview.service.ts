import { api, unwrap } from '@shared/api/client';

export interface CategoryOverviewData {
  generatedAt: string;
  summary: {
    total: number;
    active: number;
    inactive: number;
    rootCount: number;
    subCount: number;
    featuredCount: number;
    menuCount: number;
    withBanners: number;
    withSeo: number;
    withBadges: number;
  };
  levelDistribution: {
    level: number;
    label: string;
    count: number;
    color: string;
  }[];
  departmentDistribution: {
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
    thumbnailUrl: string | null;
    status: string;
    isFeatured: boolean;
    badge: { text: string; color?: string } | null;
    childCount: number;
  }[];
  merchandising: {
    featured: number;
    standard: number;
    inMenu: number;
    catalogOnly: number;
    withBadges: number;
    noBadges: number;
  };
  health: {
    missingBanners: number;
    missingSeo: number;
    inactive: number;
    attentionCategories: {
      id: string;
      name: string;
      slug: string;
      level: number;
      status: string;
      missingBanner: boolean;
      missingSeo: boolean;
    }[];
  };
  recentCategories: {
    id: string;
    name: string;
    slug: string;
    level: number;
    status: string;
    isFeatured: boolean;
    badge: { text: string; color?: string } | null;
    createdAt?: string;
  }[];
}

export const categoriesOverviewService = {
  get: () => unwrap<CategoryOverviewData>(api.get('/admin/categories/overview')),
};
