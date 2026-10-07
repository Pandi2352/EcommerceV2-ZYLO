import { api, unwrap } from './client';
import type {
  AdminReturnSummary,
  CreateReturnRequestInput,
  ProcessRefundInput,
  ReturnRequest,
  ReviewReturnInput,
} from '../types/return';

export interface AdminReturnsQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';
}

export interface AdminReturnsListResponse {
  items: ReturnRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const returnsService = {
  // Customer Storefront
  createReturnRequest: (payload: CreateReturnRequestInput) =>
    unwrap<{ returnRequest: ReturnRequest; message: string }>(
      api.post('/returns', payload),
    ),

  getCustomerReturns: () =>
    unwrap<{ items: ReturnRequest[]; total: number }>(api.get('/returns')),

  getCustomerReturnById: (id: string) =>
    unwrap<{ returnRequest: ReturnRequest }>(api.get(`/returns/${id}`)),

  // Admin Console
  getAdminSummary: () =>
    unwrap<AdminReturnSummary>(api.get('/admin/returns/summary')),

  getAdminReturns: (params?: AdminReturnsQuery) =>
    unwrap<AdminReturnsListResponse>(api.get('/admin/returns', { params })),

  getAdminReturnById: (id: string) =>
    unwrap<ReturnRequest & { order?: any }>(api.get(`/admin/returns/${id}`)),

  reviewReturn: (id: string, payload: ReviewReturnInput) =>
    unwrap<{ returnRequest: ReturnRequest; message: string }>(
      api.patch(`/admin/returns/${id}/review`, payload),
    ),

  processRefund: (id: string, payload: ProcessRefundInput) =>
    unwrap<{ returnRequest: ReturnRequest; message: string }>(
      api.post(`/admin/returns/${id}/refund`, payload),
    ),
};
