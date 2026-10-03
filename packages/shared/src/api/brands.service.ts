import { api, unwrap } from './client';
import type {
  BrandItem,
  BrandStats,
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandQueryParams,
  PaginatedBrands,
} from '../types/brand';

export const brandsService = {
  // Admin Operations
  getStats: () => unwrap<BrandStats>(api.get('/admin/brands/stats')),

  list: (params?: BrandQueryParams) =>
    unwrap<PaginatedBrands>(api.get('/admin/brands', { params })),

  getById: (id: string) =>
    unwrap<BrandItem>(api.get(`/admin/brands/${id}`)),

  create: (payload: CreateBrandPayload) =>
    unwrap<BrandItem>(api.post('/admin/brands', payload)),

  update: (id: string, payload: UpdateBrandPayload) =>
    unwrap<BrandItem>(api.patch(`/admin/brands/${id}`, payload)),

  toggleStatus: (id: string) =>
    unwrap<BrandItem>(api.patch(`/admin/brands/${id}/status`)),

  toggleFeatured: (id: string) =>
    unwrap<BrandItem>(api.patch(`/admin/brands/${id}/featured`)),

  delete: (id: string) =>
    unwrap<{ success: boolean; message: string }>(api.delete(`/admin/brands/${id}`)),

  // Storefront Public Operations
  getPublicBrands: () =>
    unwrap<BrandItem[]>(api.get('/brands')),

  getFeaturedBrands: () =>
    unwrap<BrandItem[]>(api.get('/brands/featured')),

  getBySlug: (slug: string) =>
    unwrap<BrandItem>(api.get(`/brands/slug/${slug}`)),
};
