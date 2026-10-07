export interface WishlistItem {
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
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  addedAt: string | Date;
}

export interface WishlistCalculation {
  items: WishlistItem[];
  totalCount: number;
}

export interface AddWishlistPayload {
  productId: string;
  variantSku?: string;
}

export interface MergeWishlistPayload {
  items: AddWishlistPayload[];
}
