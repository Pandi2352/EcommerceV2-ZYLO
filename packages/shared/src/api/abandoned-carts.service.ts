import { api, unwrap } from './client';
import type {
  AbandonedCartRecord,
  AbandonedCartMetrics,
  RestoreCartResponse,
  AbandonedCartStage,
  AbandonedCartStatus,
} from '../types/abandoned-cart';

export interface AbandonedCartsListResult {
  items: AbandonedCartRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const abandonedCartsService = {
  /** Public: Restore cart via token from email link */
  async restoreCart(token: string): Promise<RestoreCartResponse> {
    return unwrap<RestoreCartResponse>(api.get(`/abandoned-carts/restore/${token}`));
  },

  /** Admin: Aggregated KPI metrics */
  async getMetrics(): Promise<AbandonedCartMetrics> {
    return unwrap<AbandonedCartMetrics>(api.get('/admin/abandoned-carts/metrics'));
  },

  /** Admin: List abandoned carts with filters */
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: AbandonedCartStage;
    status?: AbandonedCartStatus;
  }): Promise<AbandonedCartsListResult> {
    return unwrap<AbandonedCartsListResult>(
      api.get('/admin/abandoned-carts', {
        params,
      }),
    );
  },

  /** Admin: Trigger automated evaluation job on-demand */
  async triggerJob(): Promise<{ processedCount: number; emailsSent: number; errors: number }> {
    return unwrap<{ processedCount: number; emailsSent: number; errors: number }>(
      api.post('/admin/abandoned-carts/trigger-job'),
    );
  },

  /** Admin: Manually send recovery email for a single cart */
  async sendEmail(id: string): Promise<{ success: boolean; message: string }> {
    return unwrap<{ success: boolean; message: string }>(
      api.post(`/admin/abandoned-carts/${id}/send-email`),
    );
  },

  /** Admin: Manually mark an abandoned cart as recovered */
  async markRecovered(id: string): Promise<AbandonedCartRecord> {
    return unwrap<AbandonedCartRecord>(
      api.patch(`/admin/abandoned-carts/${id}/mark-recovered`),
    );
  },
};
