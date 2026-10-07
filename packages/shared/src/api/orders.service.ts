import { api, unwrap } from './client';
import type {
  CreateOrderPayload,
  Order,
  OrdersListResponse,
} from '../types/order';

export const ordersService = {
  checkout: (payload: CreateOrderPayload) =>
    unwrap<{ order: Order; message: string }>(api.post('/orders/checkout', payload)),

  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    unwrap<OrdersListResponse>(api.get('/orders', { params })),

  getOrder: (idOrNumber: string) =>
    unwrap<{ order: Order }>(api.get(`/orders/${idOrNumber}`)),

  cancelOrder: (id: string, reason?: string) =>
    unwrap<{ order: Order; message: string }>(api.post(`/orders/${id}/cancel`, { reason })),
};
