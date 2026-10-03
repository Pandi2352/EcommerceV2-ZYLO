import { api, unwrap } from './client';
import type {
  CategoryItem,
  CategoryTreeNode,
  CategoryStats,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryQueryParams,
  PaginatedCategories,
} from '../types/catalog';

export const categoriesService = {
  // Admin Operations
  getStats: () => unwrap<CategoryStats>(api.get('/admin/categories/stats')),

  getTree: (status?: 'ACTIVE' | 'INACTIVE' | 'ALL') =>
    unwrap<CategoryTreeNode[]>(api.get('/admin/categories/tree', { params: { status } })),

  list: (params?: CategoryQueryParams) =>
    unwrap<PaginatedCategories>(api.get('/admin/categories', { params })),

  getById: (id: string) =>
    unwrap<CategoryItem>(api.get(`/admin/categories/${id}`)),

  create: (payload: CreateCategoryPayload) =>
    unwrap<CategoryItem>(api.post('/admin/categories', payload)),

  update: (id: string, payload: UpdateCategoryPayload) =>
    unwrap<CategoryItem>(api.patch(`/admin/categories/${id}`, payload)),

  toggleStatus: (id: string) =>
    unwrap<CategoryItem>(api.patch(`/admin/categories/${id}/status`)),

  reorder: (items: { id: string; displayOrder: number; parentId?: string | null }[]) =>
    unwrap<{ success: boolean; count: number }>(api.patch('/admin/categories/reorder', { items })),

  delete: (id: string, reassignToId?: string) =>
    unwrap<{ success: boolean; message: string }>(
      api.delete(`/admin/categories/${id}`, { params: { reassignToId } }),
    ),

  exportData: (format: 'json' | 'csv' = 'json') =>
    unwrap<{ format: string; data: any; filename: string }>(
      api.get('/admin/categories/export', { params: { format } }),
    ),

  importData: (items: any[]) =>
    unwrap<{
      totalProcessed: number;
      createdCount: number;
      updatedCount: number;
      errorsCount: number;
      errors: Array<{ index: number; name?: string; error: string }>;
    }>(api.post('/admin/categories/import', items)),

  // Storefront Public Operations
  getPublicTree: () =>
    unwrap<CategoryTreeNode[]>(api.get('/categories/tree')),

  getBySlug: (slug: string) =>
    unwrap<CategoryItem>(api.get(`/categories/slug/${slug}`)),
};
