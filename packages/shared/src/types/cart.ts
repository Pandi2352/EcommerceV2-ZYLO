import type { VolumePricingTier } from './product';

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  brandName?: string;
  image: string;
  variantSku?: string | null;
  variantTitle?: string | null;
  price: number;
  originalPrice: number;
  savings: number;
  quantity: number;
  selected: boolean;
  stockQuantity: number;
  inStock: boolean;
  trackInventory: boolean;
  lineTotal: number;
  volumeDiscountPercent?: number;
  isVolumeDiscounted?: boolean;
  volumeTiers?: VolumePricingTier[];
}

export interface CartCalculation {
  items: CartItem[];
  savedForLater: CartItem[];
  itemCount: number;
  totalCount: number;
  subtotal: number;
  savings: number;
  qualifiesForFreeShipping: boolean;
  amountToFreeShipping: number;
  estimatedShipping: number;
  estimatedTax: number;
  discount: number;
  appliedCoupon?: string | null;
  grandTotal: number;
}

export interface AddToCartPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity?: number;
  selected?: boolean;
}

export interface MergeCartPayload {
  items: AddToCartPayload[];
}
