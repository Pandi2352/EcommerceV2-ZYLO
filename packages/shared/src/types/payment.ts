export const TransactionStatus = {
  INITIALIZED: 'INITIALIZED',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export interface PaymentIntentResponse {
  transactionId: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  publishableKey: string;
  isSimulated: boolean;
}

export interface CreatePaymentIntentPayload {
  orderId?: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentPayload {
  paymentIntentId: string;
  orderId?: string;
  cardBrand?: string;
  cardLast4?: string;
}

export interface PaymentFailurePayload {
  paymentIntentId: string;
  errorCode?: string;
  errorMessage: string;
  orderId?: string;
}

export interface PaymentTransaction {
  _id: string;
  transactionId: string;
  orderId?: string;
  orderNumber?: string;
  userId: string;
  gateway: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  clientSecret: string;
  status: TransactionStatus;
  paymentMethodType: string;
  cardLast4?: string;
  cardBrand?: string;
  errorCode?: string;
  errorMessage?: string;
  stripeEventId?: string;
  metadata?: Record<string, any>;
  refundTransactionId?: string;
  refundAmount?: number;
  isSimulated: boolean;
  createdAt: string;
  updatedAt: string;
}
