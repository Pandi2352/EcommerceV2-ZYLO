import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@shared/auth/AuthContext';
import { wishlistService } from '@shared/api/wishlist.service';
import type { WishlistItem } from '@shared/types/wishlist';
import { useCart } from '../../cart/context/CartContext';
import { toast } from '@shared/ui/Toast';

const GUEST_WISHLIST_STORAGE_KEY = 'zylo_guest_wishlist';

interface WishlistContextType {
  items: WishlistItem[];
  totalCount: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: any, variantSku?: string | null) => Promise<boolean>;
  addToWishlist: (product: any, variantSku?: string | null) => Promise<boolean>;
  removeFromWishlist: (identifier: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (identifier: string) => Promise<void>;
  moveAllToCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToCart, refreshCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fast set lookup for productIds
  const wishlistedProductIds = useMemo(() => {
    return new Set(items.map((i) => i.productId));
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => {
      if (!productId) return false;
      return wishlistedProductIds.has(productId);
    },
    [wishlistedProductIds],
  );

  // Load wishlist (authenticated from API or guest from localStorage)
  const refreshWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Authenticated user: fetch from server
        const res = await wishlistService.getWishlist();
        setItems(res.items || []);
        setTotalCount(res.totalCount || 0);
      } else {
        // Guest user: fetch from localStorage
        const saved = localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);
        if (saved) {
          try {
            const parsed: WishlistItem[] = JSON.parse(saved);
            setItems(parsed);
            setTotalCount(parsed.length);
          } catch {
            setItems([]);
            setTotalCount(0);
          }
        } else {
          setItems([]);
          setTotalCount(0);
        }
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load or on user auth change (with guest merge)
  useEffect(() => {
    let active = true;

    const init = async () => {
      if (user) {
        // Check if there are guest items to merge
        const guestSaved = localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);
        if (guestSaved) {
          try {
            const guestItems: WishlistItem[] = JSON.parse(guestSaved);
            if (guestItems.length > 0) {
              const payload = {
                items: guestItems.map((item) => ({
                  productId: item.productId,
                  variantSku: item.variantSku || undefined,
                })),
              };
              const merged = await wishlistService.mergeWishlist(payload);
              localStorage.removeItem(GUEST_WISHLIST_STORAGE_KEY);
              if (active) {
                setItems(merged.items || []);
                setTotalCount(merged.totalCount || 0);
                setIsLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error('Failed to merge guest wishlist:', e);
          }
        }
      }
      if (active) {
        await refreshWishlist();
      }
    };

    init();
    return () => {
      active = false;
    };
  }, [user, refreshWishlist]);

  // Helper to persist guest wishlist
  const saveGuestWishlist = (newItems: WishlistItem[]) => {
    setItems(newItems);
    setTotalCount(newItems.length);
    localStorage.setItem(GUEST_WISHLIST_STORAGE_KEY, JSON.stringify(newItems));
  };

  // Add item
  const addToWishlist = useCallback(
    async (product: any, variantSku?: string | null): Promise<boolean> => {
      if (!product) return false;
      const productId = product._id || product.id;
      if (!productId) return false;

      try {
        if (user) {
          const res = await wishlistService.addItem({
            productId,
            variantSku: variantSku || undefined,
          });
          setItems(res.items);
          setTotalCount(res.totalCount);
        } else {
          // Guest mode
          const exists = items.some((i) => i.productId === productId);
          if (!exists) {
            const effectivePrice = product.salePrice ?? product.basePrice ?? 0;
            const originalPrice = product.basePrice ?? effectivePrice;
            const savings = originalPrice > effectivePrice ? originalPrice - effectivePrice : 0;
            const primaryImg =
              product.thumbnailUrl ||
              (product.images && product.images[0]?.url) ||
              '';

            const newItem: WishlistItem = {
              id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              productId,
              productSlug: product.slug || '',
              name: product.name,
              brandName: (product as any).brandName || product.brandId?.name,
              image: primaryImg,
              variantSku: variantSku || null,
              variantTitle: null,
              price: effectivePrice,
              originalPrice,
              savings,
              inStock: product.trackInventory ? (product.stockQuantity || 0) > 0 : true,
              stockQuantity: product.stockQuantity || 10,
              rating: product.ratingAverage || 4.5,
              reviewCount: product.ratingCount || 10,
              addedAt: new Date(),
            };

            const updated = [newItem, ...items];
            saveGuestWishlist(updated);
          }
        }
        toast.success(`"${product.name}" added to your Wishlist`);
        return true;
      } catch (err: any) {
        toast.error(err?.message || 'Failed to add item to wishlist');
        return false;
      }
    },
    [user, items],
  );

  // Remove item
  const removeFromWishlist = useCallback(
    async (identifier: string) => {
      try {
        if (user) {
          const res = await wishlistService.removeItem(identifier);
          setItems(res.items);
          setTotalCount(res.totalCount);
        } else {
          const updated = items.filter(
            (i) => i.id !== identifier && i.productId !== identifier,
          );
          saveGuestWishlist(updated);
        }
        toast.info('Item removed from wishlist');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to remove item');
      }
    },
    [user, items],
  );

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (product: any, variantSku?: string | null): Promise<boolean> => {
      const productId = product?._id || product?.id;
      if (!productId) return false;

      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        return false;
      } else {
        return await addToWishlist(product, variantSku);
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist],
  );

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    try {
      if (user) {
        await wishlistService.clearWishlist();
      } else {
        localStorage.removeItem(GUEST_WISHLIST_STORAGE_KEY);
      }
      setItems([]);
      setTotalCount(0);
      toast.info('Wishlist cleared');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to clear wishlist');
    }
  }, [user]);

  // Move single item to Cart
  const moveToCart = useCallback(
    async (identifier: string) => {
      const item = items.find((i) => i.id === identifier || i.productId === identifier);
      if (!item) return;

      try {
        if (user) {
          const res = await wishlistService.moveToCart(identifier);
          setItems(res.wishlist.items);
          setTotalCount(res.wishlist.totalCount);
          await refreshCart();
        } else {
          // Guest flow
          await addToCart(
            {
              id: item.productId,
              _id: item.productId,
              name: item.name,
              slug: item.productSlug,
              basePrice: item.originalPrice,
              salePrice: item.price,
              thumbnailUrl: item.image,
              stockQuantity: item.stockQuantity,
              trackInventory: true,
            },
            item.variantSku,
            1,
          );
          const updated = items.filter(
            (i) => i.id !== identifier && i.productId !== identifier,
          );
          saveGuestWishlist(updated);
        }
        toast.success(`"${item.name}" moved to Cart`);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to move item to cart');
      }
    },
    [user, items, refreshCart, addToCart],
  );

  // Move all items to Cart
  const moveAllToCart = useCallback(async () => {
    if (items.length === 0) return;

    try {
      if (user) {
        const res = await wishlistService.moveAllToCart();
        setItems(res.wishlist.items);
        setTotalCount(res.wishlist.totalCount);
        await refreshCart();
        toast.success(`${res.movedCount} items moved to your Cart`);
      } else {
        // Guest flow
        let count = 0;
        for (const item of items) {
          if (item.inStock) {
            await addToCart(
              {
                id: item.productId,
                _id: item.productId,
                name: item.name,
                slug: item.productSlug,
                basePrice: item.originalPrice,
                salePrice: item.price,
                thumbnailUrl: item.image,
                stockQuantity: item.stockQuantity,
                trackInventory: true,
              },
              item.variantSku,
              1,
            );
            count++;
          }
        }
        saveGuestWishlist([]);
        toast.success(`${count} items moved to your Cart`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to move all items to cart');
    }
  }, [user, items, refreshCart, addToCart]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalCount,
        isLoading,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        moveToCart,
        moveAllToCart,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
