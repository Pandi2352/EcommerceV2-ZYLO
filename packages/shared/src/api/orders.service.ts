import { api, unwrap } from './client';
import type {
  AdminOrderMetrics,
  AdminOrderQuery,
  AdminOrdersListResponse,
  CreateOrderPayload,
  Order,
  OrdersListResponse,
  UpdateOrderStatusPayload,
  UpdateOrderTrackingPayload,
  UpdatePaymentStatusPayload,
} from '../types/order';

export const ordersService = {
  // Customer Storefront
  checkout: (payload: CreateOrderPayload) =>
    unwrap<{ order: Order; message: string }>(api.post('/orders/checkout', payload)),

  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    unwrap<OrdersListResponse>(api.get('/orders', { params })),

  getOrder: (idOrNumber: string) =>
    unwrap<{ order: Order }>(api.get(`/orders/${idOrNumber}`)),

  cancelOrder: (id: string, reason?: string) =>
    unwrap<{ order: Order; message: string }>(api.post(`/orders/${id}/cancel`, { reason })),

  // Admin Console
  getAdminOrders: (params?: AdminOrderQuery) =>
    unwrap<AdminOrdersListResponse>(api.get('/admin/orders', { params })),

  getAdminMetrics: () =>
    unwrap<AdminOrderMetrics>(api.get('/admin/orders/metrics')),

  getAdminOrder: (id: string) =>
    unwrap<{ order: Order }>(api.get(`/admin/orders/${id}`)),

  updateAdminOrderStatus: (id: string, payload: UpdateOrderStatusPayload) =>
    unwrap<{ order: Order; message: string }>(api.patch(`/admin/orders/${id}/status`, payload)),

  updateAdminOrderTracking: (id: string, payload: UpdateOrderTrackingPayload) =>
    unwrap<{ order: Order; message: string }>(api.patch(`/admin/orders/${id}/tracking`, payload)),

  updateAdminOrderPayment: (id: string, payload: UpdatePaymentStatusPayload) =>
    unwrap<{ order: Order; message: string }>(api.patch(`/admin/orders/${id}/payment`, payload)),

  cancelAdminOrder: (id: string, reason?: string) =>
    unwrap<{ order: Order; message: string }>(api.post(`/admin/orders/${id}/cancel`, { reason })),

  exportAdminOrders: (format: 'json' | 'csv' = 'json') =>
    unwrap<{ data: any; filename: string }>(api.get('/admin/orders/export', { params: { format } })),
};
