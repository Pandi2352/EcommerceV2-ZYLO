import { api, unwrap } from './client';
import type {
  ProductItem,
  ProductMetrics,
  ProductOverviewData,
  CreateProductPayload,
  UpdateProductPayload,
  QueryProductParams,
  PaginatedProducts,
  ProductStatus,
  ProductFacets,
  SearchSuggestion,
} from '../types/product';

export const productsService = {
  // Admin Operations
  getMetrics: () =>
    unwrap<ProductMetrics>(api.get('/admin/products/metrics')),

  getOverview: () =>
    unwrap<ProductOverviewData>(api.get('/admin/products/overview')),

  list: (params?: QueryProductParams) =>
    unwrap<PaginatedProducts>(api.get('/admin/products', { params })),

  getById: (id: string) =>
    unwrap<ProductItem>(api.get(`/admin/products/${id}`)),

  create: (payload: CreateProductPayload) =>
    unwrap<ProductItem>(api.post('/admin/products', payload)),

  update: (id: string, payload: UpdateProductPayload) =>
    unwrap<ProductItem>(api.patch(`/admin/products/${id}`, payload)),

  updateStatus: (id: string, status: ProductStatus) =>
    unwrap<ProductItem>(api.patch(`/admin/products/${id}/status`, { status })),

  toggleFeatured: (id: string) =>
    unwrap<ProductItem>(api.patch(`/admin/products/${id}/featured`)),

  delete: (id: string) =>
    unwrap<{ success: boolean; message: string }>(api.delete(`/admin/products/${id}`)),

  // Storefront Public Operations
  getPublicProducts: (params?: QueryProductParams) =>
    unwrap<PaginatedProducts>(api.get('/products', { params })),

  getFeaturedProducts: (limit = 8) =>
    unwrap<PaginatedProducts>(api.get('/products/featured', { params: { limit } })),

  getBySlug: (slug: string) =>
    unwrap<ProductItem>(api.get(`/products/${slug}`)),

  getFacets: () =>
    unwrap<ProductFacets>(api.get('/products/facets')),

  getSuggestions: (q: string) =>
    unwrap<SearchSuggestion[]>(api.get('/products/suggestions', { params: { q } })),
};
