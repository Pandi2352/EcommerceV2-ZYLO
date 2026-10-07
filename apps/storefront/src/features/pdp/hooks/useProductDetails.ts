import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsService } from '@shared/api/products.service';
import type { ProductItem, ProductVariant } from '@shared/types/product';
import { toast } from '@shared/ui/Toast';
import { ROUTES } from '../../../routes/routePaths';
import { useCart } from '../../cart/context/CartContext';
import { useWishlist } from '../../wishlist/context/WishlistContext';

export type ProductTabId = 'overview' | 'specs' | 'shipping' | 'reviews';

export function useProductDetails() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist: contextToggleWishlist } = useWishlist();

  const productIdentifier = slug || id;

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTabId>('overview');

  const isWishlisted = product ? isInWishlist(product._id) : false;

  // Fetch Product & Related
  const fetchProductData = useCallback(async () => {
    if (!productIdentifier) return;

    try {
      setIsLoading(true);
      setIsError(false);

      const data = await productsService.getBySlug(productIdentifier);
      setProduct(data);

      // Default variant
      if (data.hasVariants && data.variants && data.variants.length > 0) {
        const defaultVar = data.variants.find((v) => v.isActive && v.stockQuantity > 0) || data.variants[0];
        setSelectedVariant(defaultVar);
      } else {
        setSelectedVariant(null);
      }

      setSelectedImageIndex(0);
      setQuantity(1);

      // Fetch related products
      try {
        const related = await productsService.getRelated(data.slug, 4);
        setRelatedProducts(related);
      } catch (rErr) {
        console.error('Failed to load related products:', rErr);
        setRelatedProducts([]);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
      setIsError(true);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [productIdentifier]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Gallery image list
  const images = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];

    // If variant has unique image, add first
    if (selectedVariant?.imageUrl) {
      list.push(selectedVariant.imageUrl);
    }

    if (product.images && product.images.length > 0) {
      const sorted = [...product.images].sort((a, b) => a.displayOrder - b.displayOrder);
      sorted.forEach((img) => {
        if (!list.includes(img.url)) list.push(img.url);
      });
    } else if (product.thumbnailUrl) {
      if (!list.includes(product.thumbnailUrl)) list.push(product.thumbnailUrl);
    }

    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
    }
    return list;
  }, [product, selectedVariant]);

  // Pricing calculations
  const basePrice = selectedVariant
    ? selectedVariant.price
    : product?.basePrice || 0;

  const salePrice = selectedVariant
    ? selectedVariant.salePrice
    : product?.salePrice;

  const effectivePrice = salePrice && salePrice > 0 ? salePrice : basePrice;
  const hasDiscount = Boolean(salePrice && salePrice > 0 && salePrice < basePrice);
  const discountPercent = hasDiscount && basePrice > 0
    ? Math.round(((basePrice - salePrice!) / basePrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? basePrice - salePrice! : 0;

  // Stock calculations
  const effectiveStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product?.stockQuantity || 0;

  const trackInventory = product?.trackInventory ?? true;
  const isOutOfStock = trackInventory && effectiveStock <= 0;
  const isLowStock =
    trackInventory &&
    effectiveStock > 0 &&
    product?.lowStockThreshold !== undefined &&
    effectiveStock <= product.lowStockThreshold;

  const effectiveSku = selectedVariant ? selectedVariant.sku : product?.sku || '';

  // Stepper handlers
  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    if (trackInventory && newQty > effectiveStock) {
      toast.warning(`Only ${effectiveStock} units available in stock.`);
      return;
    }
    setQuantity(newQty);
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    // Switch to variant image if present
    if (variant.imageUrl) {
      setSelectedImageIndex(0);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    await contextToggleWishlist(product, selectedVariant?.sku);
  };

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    await addToCart(product, selectedVariant?.sku, quantity);
  };

  const handleBuyNow = async () => {
    if (!product || isOutOfStock) return;
    await addToCart(product, selectedVariant?.sku, quantity);
    navigate(ROUTES.CUSTOMER.CART);
  };

  return {
    product,
    relatedProducts,
    isLoading,
    isError,
    selectedVariant,
    selectedImageIndex,
    setSelectedImageIndex,
    images,
    basePrice,
    salePrice,
    effectivePrice,
    hasDiscount,
    discountPercent,
    savingsAmount,
    effectiveStock,
    effectiveSku,
    trackInventory,
    isOutOfStock,
    isLowStock,
    quantity,
    handleQuantityChange,
    handleSelectVariant,
    activeTab,
    setActiveTab,
    isWishlisted,
    toggleWishlist,
    handleAddToCart,
    handleBuyNow,
    refetchProduct: fetchProductData,
  };
}
