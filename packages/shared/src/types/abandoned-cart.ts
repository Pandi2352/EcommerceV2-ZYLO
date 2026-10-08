export type AbandonedCartStage =
  | 'STAGE_1_REMINDER'
  | 'STAGE_2_DISCOUNT'
  | 'STAGE_3_FINAL'
  | 'RECOVERED'
  | 'EXPIRED';

export type AbandonedCartStatus = 'ABANDONED' | 'RECOVERED' | 'EXPIRED';

export interface AbandonedCartItemSnapshot {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  variantSku?: string | null;
}

export interface AbandonedCartRecord {
  _id: string;
  cartId: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  cartTotal: number;
  subtotal: number;
  itemCount: number;
  items: AbandonedCartItemSnapshot[];
  recoveryToken: string;
  discountCouponCode?: string | null;
  stage: AbandonedCartStage;
  status: AbandonedCartStatus;
  stage1SentAt?: string | null;
  stage2SentAt?: string | null;
  stage3SentAt?: string | null;
  emailsSentCount: number;
  recoveredAt?: string | null;
  recoveredOrderId?: string | null;
  recoveredRevenue: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbandonedCartMetrics {
  totalAbandoned: number;
  abandonedCartValue: number;
  recoveredCount: number;
  recoveredRevenue: number;
  conversionRate: number;
  totalEmailsSent: number;
  stageStats: Record<string, { count: number; value: number }>;
}

export interface RestoreCartResponse {
  success: boolean;
  alreadyRecovered?: boolean;
  message: string;
  cartId?: string;
  items: AbandonedCartItemSnapshot[];
  cartTotal: number;
  coupon?: string | null;
  customerEmail?: string;
}
