export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  COD: 'COD',
  ONLINE: 'ONLINE',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const DeliveryMethod = {
  STANDARD: 'STANDARD',
  EXPRESS: 'EXPRESS',
} as const;
export type DeliveryMethod = (typeof DeliveryMethod)[keyof typeof DeliveryMethod];

export interface OrderItem {
  id?: string;
  _id?: string;
  productId: string;
  productSlug: string;
  name: string;
  brandName: string;
  image: string;
  variantSku?: string | null;
  variantTitle?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string | Date;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  shippingFee: number;
  discount: number;
  appliedCoupon?: string | null;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  estimatedDeliveryDate: string | Date;
  notes?: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  cancelledAt?: string | Date | null;
  cancellationReason?: string | null;
}

export interface CreateOrderPayload {
  shippingAddress: OrderShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  termsAccepted: boolean;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
}

export interface AdminOrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  paymentMethod?: PaymentMethod | 'ALL';
  deliveryMethod?: DeliveryMethod | 'ALL';
  startDate?: string;
  endDate?: string;
}

export interface AdminOrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  metrics: AdminOrderMetrics;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}

export interface UpdateOrderTrackingPayload {
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  status?: OrderStatus;
  note?: string;
}

export interface UpdatePaymentStatusPayload {
  paymentStatus: PaymentStatus;
  note?: string;
}
