import { api, unwrap } from './client';
import type {
  EnrichedProductBundle,
  AdminProductBundle,
  BundleMetrics,
  CreateBundlePayload,
  UpdateBundlePayload,
} from '../types/bundle';

export interface BundlesListResult {
  items: AdminProductBundle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const bundlesService = {
  /** Public: Get active bundles for product */
  async getBundlesForProduct(idOrSlug: string): Promise<EnrichedProductBundle[]> {
    return unwrap<EnrichedProductBundle[]>(api.get(`/bundles/product/${idOrSlug}`));
  },

  /** Admin: Get bundle KPI metrics */
  async getMetrics(): Promise<BundleMetrics> {
    return unwrap<BundleMetrics>(api.get('/admin/bundles/metrics'));
  },

  /** Admin: List all bundles */
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
    productId?: string;
  }): Promise<BundlesListResult> {
    return unwrap<BundlesListResult>(
      api.get('/admin/bundles', {
        params,
      }),
    );
  },

  /** Admin: Get bundle by ID */
  async getById(id: string): Promise<AdminProductBundle> {
    return unwrap<AdminProductBundle>(api.get(`/admin/bundles/${id}`));
  },

  /** Admin: Create bundle */
  async create(payload: CreateBundlePayload): Promise<AdminProductBundle> {
    return unwrap<AdminProductBundle>(api.post('/admin/bundles', payload));
  },

  /** Admin: Update bundle */
  async update(id: string, payload: UpdateBundlePayload): Promise<AdminProductBundle> {
    return unwrap<AdminProductBundle>(api.put(`/admin/bundles/${id}`, payload));
  },

  /** Admin: Toggle active */
  async toggle(id: string): Promise<AdminProductBundle> {
    return unwrap<AdminProductBundle>(api.patch(`/admin/bundles/${id}/toggle`));
  },

  /** Admin: Delete bundle */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return unwrap<{ success: boolean; message: string }>(api.delete(`/admin/bundles/${id}`));
  },
};
