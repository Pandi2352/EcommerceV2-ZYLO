import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@shared/auth/AuthContext';
import { cartService } from '@shared/api/cart.service';
import { couponsService } from '@shared/api/coupons.service';
import type { CartCalculation, CartItem } from '@shared/types/cart';
import { calculateVolumeTieredPrice } from '@shared/utils/pricing';
import { toast } from '@shared/ui/Toast';

const GUEST_CART_STORAGE_KEY = 'zylo_guest_cart';
const GUEST_SAVED_STORAGE_KEY = 'zylo_guest_saved_for_later';
const FREE_SHIPPING_THRESHOLD = 50.0;
const STANDARD_SHIPPING_FEE = 5.99;
const ESTIMATED_TAX_RATE = 0.08;

interface CartContextType {
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
  appliedCoupon: string | null;
  grandTotal: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  lastAddedItem: CartItem | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product: any, variantSku?: string | null, quantity?: number) => Promise<boolean>;
  addMultipleToCart: (
    items: {
      productId: string;
      name: string;
      slug: string;
      image: string;
      basePrice: number;
      price: number;
      quantity?: number;
      variantSku?: string | null;
      discountPercent?: number;
    }[],
  ) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  toggleSelect: (itemId: string, selected: boolean) => Promise<void>;
  selectAll: (selected: boolean) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  deleteSavedItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateGuestTotals(items: CartItem[], saved: CartItem[], coupon?: string | null): CartCalculation {
  const selectedItems = items.filter((i) => i.selected);
  const subtotal = +selectedItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);
  const totalOriginal = +selectedItems
    .reduce((sum, item) => sum + item.originalPrice * item.quantity, 0)
    .toFixed(2);
  const savings = Math.max(0, +(totalOriginal - subtotal).toFixed(2));
  const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = qualifiesForFreeShipping
    ? 0
    : +(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);

  let estimatedShipping = subtotal === 0 ? 0 : (qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_FEE);
  let discount = 0;

  if (coupon && subtotal > 0) {
    if (coupon === 'ZYLO10') discount = +(subtotal * 0.1).toFixed(2);
    if (coupon === 'ZYLO20') discount = +(subtotal * 0.2).toFixed(2);
    if (coupon === 'WELCOME5') discount = Math.min(5, subtotal);
    if (coupon === 'FREESHIP') estimatedShipping = 0;
  }

  const estimatedTax = +(subtotal * ESTIMATED_TAX_RATE).toFixed(2);
  const grandTotal = +(Math.max(0, subtotal + estimatedShipping + estimatedTax - discount)).toFixed(2);

  return {
    items,
    savedForLater: saved,
    itemCount,
    totalCount,
    subtotal,
    savings,
    qualifiesForFreeShipping,
    amountToFreeShipping,
    estimatedShipping,
    estimatedTax,
    discount,
    appliedCoupon: coupon,
    grandTotal,
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartState, setCartState] = useState<CartCalculation>({
    items: [],
    savedForLater: [],
    itemCount: 0,
    totalCount: 0,
    subtotal: 0,
    savings: 0,
    qualifiesForFreeShipping: false,
    amountToFreeShipping: FREE_SHIPPING_THRESHOLD,
    estimatedShipping: 0,
    estimatedTax: 0,
    discount: 0,
    appliedCoupon: null,
    grandTotal: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Sync / Load Cart on mount & auth changes
  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Check if there are guest items to merge
        const guestItemsRaw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (guestItemsRaw) {
          try {
            const guestItems: CartItem[] = JSON.parse(guestItemsRaw);
            if (guestItems.length > 0) {
              const mergePayload = guestItems.map((gi) => ({
                productId: gi.productId,
                variantSku: gi.variantSku || undefined,
                quantity: gi.quantity,
              }));
              const res = await cartService.mergeCart({ items: mergePayload });
              localStorage.removeItem(GUEST_CART_STORAGE_KEY);
              localStorage.removeItem(GUEST_SAVED_STORAGE_KEY);
              setCartState(res);
              setIsLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          }
        }

        // Normal authenticated load
        const res = await cartService.getCart();
        setCartState(res);
      } else {
        // Guest mode: read from localStorage
        const localItems = JSON.parse(localStorage.getItem(GUEST_CART_STORAGE_KEY) || '[]');
        const localSaved = JSON.parse(localStorage.getItem(GUEST_SAVED_STORAGE_KEY) || '[]');
        const calc = calculateGuestTotals(localItems, localSaved, null);
        setCartState(calc);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Save guest cart helper
  const saveGuestCart = (newItems: CartItem[], newSaved: CartItem[], coupon = cartState.appliedCoupon) => {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(newItems));
    localStorage.setItem(GUEST_SAVED_STORAGE_KEY, JSON.stringify(newSaved));
    const calc = calculateGuestTotals(newItems, newSaved, coupon);
    setCartState(calc);
  };

  // Add Item to Cart
  const addToCart = async (
    product: any,
    variantSku?: string | null,
    quantity = 1,
  ): Promise<boolean> => {
    try {
      if (user) {
        const res = await cartService.addItem({
          productId: product._id || product.id,
          variantSku: variantSku || undefined,
          quantity,
        });
        setCartState(res);
        const added = res.items.find(
          (i) =>
            i.productId === (product._id || product.id) &&
            (i.variantSku || null) === (variantSku || null),
        );
        if (added) setLastAddedItem(added);
      } else {
        // Guest add
        let variant: any = null;
        if (variantSku && product.variants?.length) {
          variant = product.variants.find((v: any) => v.sku === variantSku);
        }

        const basePrice = variant ? variant.price : product.basePrice || 0;
        const salePrice = variant ? variant.salePrice : product.salePrice;
        const effectivePrice = salePrice && salePrice > 0 ? salePrice : basePrice;
        const stock = variant ? variant.stockQuantity : product.stockQuantity || 0;
        const trackInventory = product.trackInventory ?? true;

        if (trackInventory && stock <= 0) {
          toast.error('Item is out of stock');
          return false;
        }

        const existingItems = [...cartState.items];
        const existingIdx = existingItems.findIndex(
          (i) =>
            i.productId === (product._id || product.id) &&
            (i.variantSku || null) === (variantSku || null),
        );

        let createdItem: CartItem;
        const volumeTiers = product.volumeTiers || [];

        if (existingIdx > -1) {
          const current = existingItems[existingIdx];
          const newQty = current.quantity + quantity;
          if (trackInventory && newQty > stock) {
            toast.warning(`Only ${stock} units available in stock`);
            return false;
          }
          current.quantity = newQty;
          current.selected = true;

          // Apply volume pricing if product has tiers
          if (current.volumeTiers?.length || volumeTiers.length) {
            current.volumeTiers = current.volumeTiers || volumeTiers;
            const volumeRes = calculateVolumeTieredPrice(current.originalPrice, newQty, current.volumeTiers);
            current.price = volumeRes.unitPrice;
            current.savings = volumeRes.totalSavings;
            current.volumeDiscountPercent = volumeRes.discountPercent > 0 ? volumeRes.discountPercent : undefined;
            current.isVolumeDiscounted = volumeRes.isTiered;
          }

          current.lineTotal = +(current.price * newQty).toFixed(2);
          createdItem = current;
        } else {
          if (trackInventory && quantity > stock) {
            toast.warning(`Only ${stock} units available in stock`);
            return false;
          }
          const primaryImg =
            variant?.imageUrl ||
            product.images?.find((img: any) => img.isPrimary)?.url ||
            product.images?.[0]?.url ||
            '';

          // Check if initial quantity qualifies for volume discount
          const volumeRes = calculateVolumeTieredPrice(basePrice, quantity, volumeTiers);
          const finalPrice = volumeRes.isTiered ? volumeRes.unitPrice : effectivePrice;

          createdItem = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            productId: product._id || product.id,
            productSlug: product.slug,
            name: product.name,
            brandName: product.brandName || undefined,
            image: primaryImg,
            variantSku: variantSku || null,
            variantTitle: variant?.title || null,
            price: finalPrice,
            originalPrice: basePrice,
            savings: +((basePrice - finalPrice) * quantity).toFixed(2),
            quantity,
            selected: true,
            stockQuantity: stock,
            inStock: true,
            trackInventory,
            lineTotal: +(finalPrice * quantity).toFixed(2),
            volumeTiers: volumeTiers.length ? volumeTiers : undefined,
            volumeDiscountPercent: volumeRes.discountPercent > 0 ? volumeRes.discountPercent : undefined,
            isVolumeDiscounted: volumeRes.isTiered,
          };
          existingItems.push(createdItem);
        }

        saveGuestCart(existingItems, cartState.savedForLater);
        setLastAddedItem(createdItem);
      }

      // Open Amazon-style slide-over drawer
      setIsDrawerOpen(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to add item to cart';
      toast.error(msg);
      return false;
    }
  };

  // Add Multiple Items Simultaneously (e.g. Frequently Bought Together Kits)
  const addMultipleToCart = async (
    items: {
      productId: string;
      name: string;
      slug: string;
      image: string;
      basePrice: number;
      price: number;
      quantity?: number;
      variantSku?: string | null;
      discountPercent?: number;
    }[],
  ): Promise<boolean> => {
    try {
      if (!items || items.length === 0) return false;

      if (user) {
        const payload = items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku || undefined,
          quantity: i.quantity || 1,
        }));
        const res = await cartService.addMultipleItems(payload);
        setCartState(res);
      } else {
        const existingItems = [...cartState.items];
        let lastItem: CartItem | null = null;

        for (const item of items) {
          const qty = item.quantity || 1;
          const matchIdx = existingItems.findIndex(
            (ei) => ei.productId === item.productId && (ei.variantSku || null) === (item.variantSku || null),
          );

          if (matchIdx > -1) {
            existingItems[matchIdx].quantity += qty;
            existingItems[matchIdx].selected = true;
            existingItems[matchIdx].lineTotal = +(
              existingItems[matchIdx].price * existingItems[matchIdx].quantity
            ).toFixed(2);
            lastItem = existingItems[matchIdx];
          } else {
            const newItem: CartItem = {
              id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              productId: item.productId,
              productSlug: item.slug,
              name: item.name,
              image: item.image,
              variantSku: item.variantSku || null,
              price: item.price,
              originalPrice: item.basePrice,
              savings: +((item.basePrice - item.price) * qty).toFixed(2),
              quantity: qty,
              selected: true,
              stockQuantity: 99,
              inStock: true,
              trackInventory: false,
              lineTotal: +(item.price * qty).toFixed(2),
            };
            existingItems.push(newItem);
            lastItem = newItem;
          }
        }

        saveGuestCart(existingItems, cartState.savedForLater);
        if (lastItem) setLastAddedItem(lastItem);
      }

      toast.success(`Added ${items.length} bundle items to cart!`);
      setIsDrawerOpen(true);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add bundle to cart');
      return false;
    }
  };

  // Update Item Quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (user) {
        const res = await cartService.updateItem(itemId, { quantity });
        setCartState(res);
      } else {
        let newItems = [...cartState.items];
        if (quantity <= 0) {
          newItems = newItems.filter((i) => i.id !== itemId);
        } else {
          const item = newItems.find((i) => i.id === itemId);
          if (item) {
            if (item.trackInventory && quantity > item.stockQuantity) {
              toast.warning(`Only ${item.stockQuantity} units in stock`);
              return;
            }
            item.quantity = quantity;

            // Recalculate tiered volume pricing
            if (item.volumeTiers?.length) {
              const volumeRes = calculateVolumeTieredPrice(item.originalPrice, quantity, item.volumeTiers);
              item.price = volumeRes.unitPrice;
              item.savings = volumeRes.totalSavings;
              item.volumeDiscountPercent = volumeRes.discountPercent > 0 ? volumeRes.discountPercent : undefined;
              item.isVolumeDiscounted = volumeRes.isTiered;
            }

            item.lineTotal = +(item.price * quantity).toFixed(2);
          }
        }
        saveGuestCart(newItems, cartState.savedForLater);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  // Toggle Selection (Amazon Checkbox)
  const toggleSelect = async (itemId: string, selected: boolean) => {
    try {
      if (user) {
        const res = await cartService.updateItem(itemId, { selected });
        setCartState(res);
      } else {
        const newItems = cartState.items.map((i) =>
          i.id === itemId ? { ...i, selected } : i,
        );
        saveGuestCart(newItems, cartState.savedForLater);
      }
    } catch (err: any) {
      toast.error('Failed to update selection');
    }
  };

  // Select / Deselect All
  const selectAll = async (selected: boolean) => {
    try {
      if (user) {
        // update all sequentially or bulk
        for (const item of cartState.items) {
          if (item.selected !== selected) {
            await cartService.updateItem(item.id, { selected });
          }
        }
        const res = await cartService.getCart();
        setCartState(res);
      } else {
        const newItems = cartState.items.map((i) => ({ ...i, selected }));
        saveGuestCart(newItems, cartState.savedForLater);
      }
    } catch {
      toast.error('Failed to update all selections');
    }
  };

  // Remove Item
  const removeItem = async (itemId: string) => {
    try {
      if (user) {
        const res = await cartService.removeItem(itemId);
        setCartState(res);
      } else {
        const newItems = cartState.items.filter((i) => i.id !== itemId);
        saveGuestCart(newItems, cartState.savedForLater);
      }
      toast.info('Item removed from cart');
    } catch (err: any) {
      toast.error('Failed to remove item');
    }
  };

  // Save For Later (Amazon signature feature!)
  const saveForLater = async (itemId: string) => {
    try {
      if (user) {
        const res = await cartService.saveForLater(itemId);
        setCartState(res);
      } else {
        const index = cartState.items.findIndex((i) => i.id === itemId);
        if (index > -1) {
          const newItems = [...cartState.items];
          const [saved] = newItems.splice(index, 1);
          const newSaved = [...cartState.savedForLater, saved];
          saveGuestCart(newItems, newSaved);
        }
      }
      toast.info('Item moved to Saved for Later');
    } catch (err: any) {
      toast.error('Failed to save item for later');
    }
  };

  // Move back to Cart
  const moveToCart = async (itemId: string) => {
    try {
      if (user) {
        const res = await cartService.moveToCart(itemId);
        setCartState(res);
      } else {
        const index = cartState.savedForLater.findIndex((i) => i.id === itemId);
        if (index > -1) {
          const newSaved = [...cartState.savedForLater];
          const [moved] = newSaved.splice(index, 1);
          moved.selected = true;
          const newItems = [...cartState.items, moved];
          saveGuestCart(newItems, newSaved);
        }
      }
      toast.success('Item moved back to Cart');
    } catch (err: any) {
      toast.error('Failed to move item to cart');
    }
  };

  // Delete from Saved for Later
  const deleteSavedItem = async (itemId: string) => {
    try {
      if (user) {
        const res = await cartService.deleteSavedItem(itemId);
        setCartState(res);
      } else {
        const newSaved = cartState.savedForLater.filter((i) => i.id !== itemId);
        saveGuestCart(cartState.items, newSaved);
      }
      toast.info('Item removed from Saved list');
    } catch (err: any) {
      toast.error('Failed to delete item');
    }
  };

  // Clear Cart
  const clearCart = async () => {
    try {
      if (user) {
        const res = await cartService.clearCart();
        setCartState(res);
      } else {
        saveGuestCart([], cartState.savedForLater);
      }
      toast.info('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  // Apply Coupon
  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      if (user) {
        const res = await cartService.applyCoupon(code);
        setCartState(res);
      } else {
        const upper = code.trim().toUpperCase();
        const selectedItems = cartState.items.filter((i) => i.selected);
        const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const valRes = await couponsService.validate({ code: upper, subtotal });
        if (!valRes.isValid) {
          toast.error(valRes.message || 'Invalid promo code');
          return false;
        }
        saveGuestCart(cartState.items, cartState.savedForLater, upper);
      }
      toast.success(`Coupon "${code.toUpperCase()}" applied!`);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      return false;
    }
  };

  // Remove Coupon
  const removeCoupon = async () => {
    try {
      if (user) {
        const res = await cartService.removeCoupon();
        setCartState(res);
      } else {
        saveGuestCart(cartState.items, cartState.savedForLater, null);
      }
      toast.info('Coupon removed');
    } catch {
      toast.error('Failed to remove coupon');
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...cartState,
        appliedCoupon: cartState.appliedCoupon ?? null,
        isLoading,
        isDrawerOpen,
        lastAddedItem,
        openDrawer,
        closeDrawer,
        addToCart,
        addMultipleToCart,
        updateQuantity,
        toggleSelect,
        selectAll,
        removeItem,
        saveForLater,
        moveToCart,
        deleteSavedItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
