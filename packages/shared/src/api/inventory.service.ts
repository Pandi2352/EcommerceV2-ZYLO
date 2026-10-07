import { api, unwrap } from './client';
import type {
  InventorySummaryMetrics,
  AdminInventoryQuery,
  AdminInventoryResponse,
  AdjustStockPayload,
  AdjustStockResponse,
} from '../types/inventory';

export const inventoryService = {
  getSummary: () =>
    unwrap<InventorySummaryMetrics>(api.get('/admin/inventory/summary')),

  list: (params?: AdminInventoryQuery) =>
    unwrap<AdminInventoryResponse>(api.get('/admin/inventory', { params })),

  adjustStock: (id: string, payload: AdjustStockPayload) =>
    unwrap<AdjustStockResponse>(api.patch(`/admin/inventory/${id}/adjust`, payload)),
};
