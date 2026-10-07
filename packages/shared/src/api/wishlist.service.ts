import { api, unwrap } from './client';
import type {
  AddWishlistPayload,
  MergeWishlistPayload,
  WishlistCalculation,
} from '../types/wishlist';
import type { CartCalculation } from '../types/cart';

export const wishlistService = {
  getWishlist: () =>
    unwrap<WishlistCalculation>(api.get('/wishlist')),

  addItem: (payload: AddWishlistPayload) =>
    unwrap<WishlistCalculation & { message: string }>(api.post('/wishlist/items', payload)),

  removeItem: (itemId: string) =>
    unwrap<WishlistCalculation & { message: string }>(api.delete(`/wishlist/items/${itemId}`)),

  clearWishlist: () =>
    unwrap<WishlistCalculation & { message: string }>(api.delete('/wishlist')),

  moveToCart: (itemId: string) =>
    unwrap<{ wishlist: WishlistCalculation; cart: CartCalculation; message: string }>(
      api.post(`/wishlist/items/${itemId}/move-to-cart`),
    ),

  moveAllToCart: () =>
    unwrap<{ wishlist: WishlistCalculation; cart: CartCalculation; movedCount: number; message: string }>(
      api.post('/wishlist/move-all-to-cart'),
    ),

  mergeWishlist: (payload: MergeWishlistPayload) =>
    unwrap<WishlistCalculation & { message: string }>(api.post('/wishlist/merge', payload)),
};
