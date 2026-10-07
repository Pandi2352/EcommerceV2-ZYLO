import { api, unwrap } from './client';
import type {
  ConfirmPaymentPayload,
  CreatePaymentIntentPayload,
  PaymentFailurePayload,
  PaymentIntentResponse,
  PaymentTransaction,
} from '../types/payment';
import type { Order } from '../types/order';

export const paymentsService = {
  createPaymentIntent: (payload: CreatePaymentIntentPayload) =>
    unwrap<PaymentIntentResponse>(api.post('/payments/create-intent', payload)),

  confirmPayment: (payload: ConfirmPaymentPayload) =>
    unwrap<{ success: boolean; transaction: PaymentTransaction; order?: Order; message: string }>(
      api.post('/payments/confirm', payload),
    ),

  recordFailure: (payload: PaymentFailurePayload) =>
    unwrap<{ success: boolean; transaction: PaymentTransaction; order?: Order; message: string }>(
      api.post('/payments/fail', payload),
    ),

  retryPayment: (orderId: string) =>
    unwrap<{ order: Order } & PaymentIntentResponse>(
      api.post(`/payments/retry/${orderId}`),
    ),

  getOrderTransactions: (orderId: string) =>
    unwrap<{ order: Order; transactions: PaymentTransaction[] }>(
      api.get(`/payments/order/${orderId}`),
    ),

  testProviderConnection: (payload: { provider: string; secretKey?: string; publishableKey?: string }) =>
    unwrap<{ success: boolean; provider: string; mode?: string; message: string }>(
      api.post('/payments/test-provider', payload),
    ),
};
