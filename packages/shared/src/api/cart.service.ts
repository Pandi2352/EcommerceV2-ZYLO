import { api, unwrap } from './client';
import type {
  AddToCartPayload,
  CartCalculation,
  MergeCartPayload,
  UpdateCartItemPayload,
} from '../types/cart';

export const cartService = {
  getCart: () =>
    unwrap<CartCalculation>(api.get('/cart')),

  addItem: (payload: AddToCartPayload) =>
    unwrap<CartCalculation & { message: string }>(api.post('/cart/items', payload)),

  updateItem: (itemId: string, payload: UpdateCartItemPayload) =>
    unwrap<CartCalculation & { message: string }>(api.patch(`/cart/items/${itemId}`, payload)),

  removeItem: (itemId: string) =>
    unwrap<CartCalculation & { message: string }>(api.delete(`/cart/items/${itemId}`)),

  saveForLater: (itemId: string) =>
    unwrap<CartCalculation & { message: string }>(api.post(`/cart/items/${itemId}/save-for-later`)),

  moveToCart: (itemId: string) =>
    unwrap<CartCalculation & { message: string }>(api.post(`/cart/saved-items/${itemId}/move-to-cart`)),

  deleteSavedItem: (itemId: string) =>
    unwrap<CartCalculation & { message: string }>(api.delete(`/cart/saved-items/${itemId}`)),

  clearCart: () =>
    unwrap<CartCalculation & { message: string }>(api.delete('/cart')),

  mergeCart: (payload: MergeCartPayload) =>
    unwrap<CartCalculation & { message: string }>(api.post('/cart/merge', payload)),

  applyCoupon: (code: string) =>
    unwrap<CartCalculation & { message: string }>(api.post('/cart/coupon', { code })),

  removeCoupon: () =>
    unwrap<CartCalculation & { message: string }>(api.delete('/cart/coupon')),
};
