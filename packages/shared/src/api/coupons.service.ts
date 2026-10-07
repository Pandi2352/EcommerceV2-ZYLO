import { api, unwrap } from './client';
import type {
  Coupon,
  CouponStats,
  CouponQuery,
  CouponListResponse,
  ValidateCouponPayload,
  ValidateCouponResult,
  CreateCouponPayload,
  UpdateCouponPayload,
} from '../types/coupon';

export const couponsService = {
  // Admin Operations
  getStats: () =>
    unwrap<CouponStats>(api.get('/admin/coupons/stats')),

  list: (params?: CouponQuery) =>
    unwrap<CouponListResponse>(api.get('/admin/coupons', { params })),

  getById: (id: string) =>
    unwrap<Coupon>(api.get(`/admin/coupons/${id}`)),

  create: (payload: CreateCouponPayload) =>
    unwrap<Coupon>(api.post('/admin/coupons', payload)),

  update: (id: string, payload: UpdateCouponPayload) =>
    unwrap<Coupon>(api.patch(`/admin/coupons/${id}`, payload)),

  toggleStatus: (id: string, isActive?: boolean) =>
    unwrap<Coupon>(api.patch(`/admin/coupons/${id}/status`, { isActive })),

  delete: (id: string) =>
    unwrap<{ success: boolean; message: string }>(api.delete(`/admin/coupons/${id}`)),

  // Public / Storefront Operations
  validate: (payload: ValidateCouponPayload) =>
    unwrap<ValidateCouponResult>(api.post('/coupons/validate', payload)),

  getActive: () =>
    unwrap<Partial<Coupon>[]>(api.get('/coupons/active')),
};
