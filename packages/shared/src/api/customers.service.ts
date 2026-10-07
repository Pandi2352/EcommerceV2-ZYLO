import { api, unwrap } from './client';
import type {
  AdminCustomerItem,
  AdminCustomerStats,
  AdminCustomerQuery,
  AdminCustomersResponse,
  AdminCustomerDetails,
} from '../types/customer';

export const customersService = {
  getStats: () =>
    unwrap<AdminCustomerStats>(api.get('/admin/customers/stats')),

  list: (params?: AdminCustomerQuery) =>
    unwrap<AdminCustomersResponse>(api.get('/admin/customers', { params })),

  getDetails: (id: string) =>
    unwrap<AdminCustomerDetails>(api.get(`/admin/customers/${id}`)),

  toggleStatus: (id: string, isActive?: boolean) =>
    unwrap<{ customer: AdminCustomerItem; message: string }>(
      api.patch(`/admin/customers/${id}/status`, { isActive }),
    ),

  export: async (format: 'csv' | 'json' = 'csv') => {
    const res = await api.get(`/admin/customers/export?format=${format}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
