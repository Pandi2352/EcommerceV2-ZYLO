import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageX, ArrowLeft, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import type { ProductItem } from '@shared/types/product';
import Button from '@shared/ui/Button';

import { useProductDetails } from '../../features/pdp/hooks/useProductDetails';
import { ProductImageGallery } from '../../features/pdp/components/ProductImageGallery';
import { ProductHeaderMeta } from '../../features/pdp/components/ProductHeaderMeta';
import { ProductPriceAndBadges } from '../../features/pdp/components/ProductPriceAndBadges';
import { ProductVariantSelector } from '../../features/pdp/components/ProductVariantSelector';
import { ProductPurchaseCard } from '../../features/pdp/components/ProductPurchaseCard';
import { ProductTabsSection } from '../../features/pdp/components/ProductTabsSection';
import { RelatedProductsCarousel } from '../../features/pdp/components/RelatedProductsCarousel';
import { ProductQuickViewModal } from '../../features/shop/components/ProductQuickViewModal';

export const ProductDetailsPage: React.FC = () => {
  const {
    product,
    relatedProducts,
    isLoading,
    isError,
    selectedVariant,
    selectedImageIndex,
    setSelectedImageIndex,
    images,
    basePrice,
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
    refetchProduct,
  } = useProductDetails();

  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  // Scroll to top whenever the product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.slug]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="w-full bg-[#f8f9fa] min-h-screen py-6 overflow-x-hidden">
        <div className="max-w-[1140px] mx-auto px-4 space-y-6 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-slate-200 rounded w-1/4" />

          {/* Main Card Skeleton */}
          <div className="bg-white rounded-md border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 aspect-square bg-slate-100 rounded-md" />
              <div className="md:col-span-7 space-y-4">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-8 bg-slate-100 rounded w-4/5" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-10 bg-slate-100 rounded w-1/2" />
                <div className="h-16 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found / Error state
  if (isError || !product) {
    return (
      <div className="w-full bg-[#f8f9fa] min-h-[60vh] flex items-center justify-center py-16 px-4 overflow-x-hidden">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-md p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mx-auto flex items-center justify-center">
            <PackageX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The product you are looking for may have been removed, renamed, or is currently unavailable in our catalog.
          </p>
          <div className="pt-2">
            <Link to={ROUTES.CUSTOMER.SHOP}>
              <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Explore Shop Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-16 overflow-x-hidden">
      <div className="max-w-[1140px] mx-auto px-4 py-5 space-y-6">
        {/* 1. Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
          <Link to={ROUTES.CUSTOMER.HOME} className="hover:text-amber-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link to={ROUTES.CUSTOMER.SHOP} className="hover:text-amber-600 transition-colors">
            Shop
          </Link>
          {product.categoryId?.name && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <Link
                to={`/shop?categoryIds=${product.categoryId._id}`}
                className="hover:text-amber-600 transition-colors"
              >
                {product.categoryId.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-[420px]">
            {product.name}
          </span>
        </nav>

        {/* 2. Top Product Showcase Card */}
        <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Gallery (5 / 12 on desktop, max-w 400px) */}
            <div className="md:col-span-5 w-full">
              <div className="sticky top-20">
                <ProductImageGallery
                  images={images}
                  selectedIndex={selectedImageIndex}
                  onSelectIndex={setSelectedImageIndex}
                  productName={product.name}
                  hasDiscount={hasDiscount}
                  discountPercent={discountPercent}
                  isNewArrival={product.isNewArrival}
                  isFeatured={product.isFeatured}
                />
              </div>
            </div>

            {/* Right Column: Commercial Details & Actions (7 / 12 on desktop) */}
            <div className="md:col-span-7 flex flex-col gap-4 min-w-0">
              {/* Header Meta: Brand Badge, Title, Rating, SKU */}
              <ProductHeaderMeta
                product={product}
                effectiveSku={effectiveSku}
              />

              {/* Price and Savings pill */}
              <ProductPriceAndBadges
                basePrice={basePrice}
                effectivePrice={effectivePrice}
                hasDiscount={hasDiscount}
                discountPercent={discountPercent}
                savingsAmount={savingsAmount}
                currency={product.currency || 'USD'}
              />

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Variant Configurator (if product has variants) */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <ProductVariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={handleSelectVariant}
                />
              )}

              {/* Purchase Actions, Stock Meter, Stepper & Guarantees */}
              <ProductPurchaseCard
                isOutOfStock={isOutOfStock}
                isLowStock={isLowStock}
                effectiveStock={effectiveStock}
                trackInventory={trackInventory}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
              />
            </div>
          </div>
        </div>

        {/* 3. Middle: Tabbed Sections (Overview, Specs Table, Shipping, Reviews) */}
        <ProductTabsSection
          product={product}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onReviewSubmitted={refetchProduct}
        />

        {/* 4. Bottom: Related Products Recommendation Carousel */}
        {relatedProducts.length > 0 && (
          <RelatedProductsCarousel
            products={relatedProducts}
            categoryName={product.categoryId?.name}
            categoryId={product.categoryId?._id}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}
      </div>

      {/* Quick View Modal for Related Products */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default ProductDetailsPage;
