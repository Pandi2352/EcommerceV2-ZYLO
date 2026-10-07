export type CouponDiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

export interface UserCouponUsage {
  userId: string;
  count: number;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  perUserLimit: number;
  usedCount: number;
  userUsage?: UserCouponUsage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  inactiveCoupons: number;
  totalRedemptions: number;
}

export interface CouponQuery {
  search?: string;
  discountType?: CouponDiscountType;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  page?: number;
  limit?: number;
}

export interface CouponListResponse {
  items: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidateCouponPayload {
  code: string;
  subtotal: number;
  userId?: string;
}

export interface ValidateCouponResult {
  isValid: boolean;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number;
  isFreeShipping: boolean;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  message?: string;
  coupon?: Coupon;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number;
  isActive?: boolean;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {}
