import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, ShoppingBag, Sparkles, ShieldCheck, Tag } from 'lucide-react';
import { bundlesService } from '@shared/api/bundles.service';
import type { EnrichedProductBundle } from '@shared/types/bundle';
import { useCart } from '../../cart/context/CartContext';
import { useSettings } from '../../settings/context/SettingsContext';

interface ProductBundlesSectionProps {
  productIdOrSlug: string;
}

export const ProductBundlesSection: React.FC<ProductBundlesSectionProps> = ({ productIdOrSlug }) => {
  const [bundles, setBundles] = useState<EnrichedProductBundle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, Record<string, boolean>>>({});
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { addMultipleToCart } = useCart();
  const { formatPrice } = useSettings();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    bundlesService
      .getBundlesForProduct(productIdOrSlug)
      .then((data) => {
        if (!isMounted) return;
        setBundles(data || []);

        // Initialize all items as selected by default
        const initialSelections: Record<string, Record<string, boolean>> = {};
        (data || []).forEach((b) => {
          initialSelections[b._id] = {};
          b.items.forEach((item) => {
            initialSelections[b._id][item.productId] = true;
          });
        });
        setSelectedItemIds(initialSelections);
      })
      .catch((err) => {
        console.error('Failed to load product bundles:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productIdOrSlug]);

  if (loading || bundles.length === 0) {
    return null;
  }

  const toggleItem = (bundleId: string, productId: string, isOptional: boolean) => {
    if (!isOptional) return; // Primary item cannot be unselected

    setSelectedItemIds((prev) => {
      const currentBundleSelections = { ...(prev[bundleId] || {}) };
      currentBundleSelections[productId] = !currentBundleSelections[productId];
      return {
        ...prev,
        [bundleId]: currentBundleSelections,
      };
    });
  };

  const handleAddBundleToCart = async (bundle: EnrichedProductBundle) => {
    const bundleSelections = selectedItemIds[bundle._id] || {};
    const itemsToAdd = bundle.items.filter((item) => bundleSelections[item.productId]);

    if (itemsToAdd.length === 0) return;

    setIsAdding(true);
    try {
      const payload = itemsToAdd.map((item) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        basePrice: item.basePrice,
        price: item.bundlePrice,
        quantity: 1,
        variantSku: item.variantSku || null,
        discountPercent: item.discountPercent,
      }));

      await addMultipleToCart(payload);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 my-10">
      {bundles.map((bundle) => {
        const bundleSelections = selectedItemIds[bundle._id] || {};
        const activeItems = bundle.items.filter((item) => bundleSelections[item.productId]);

        // Reactive totals based on checked items
        const currentRegularTotal = activeItems.reduce((acc, it) => acc + it.basePrice, 0);
        const currentBundleTotal = activeItems.reduce((acc, it) => acc + it.bundlePrice, 0);
        const currentSavings = Math.max(0, +(currentRegularTotal - currentBundleTotal).toFixed(2));
        const effectiveDisc =
          currentRegularTotal > 0 ? Math.round((currentSavings / currentRegularTotal) * 100) : 0;

        return (
          <section
            key={bundle._id}
            aria-label={bundle.title}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm transition-all"
          >
            {/* Header Badge & Title */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {bundle.badgeText || 'Frequently Bought Together'}
                  </span>
                  {bundle.bundleDiscountPercent > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                      <Tag className="w-3 h-3 text-amber-600" />
                      Save {bundle.bundleDiscountPercent}% Bundle Discount
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {bundle.title}
                </h3>
                {bundle.description && (
                  <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                    {bundle.description}
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Visual Chain + Total Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Items Horizontal Chain */}
              <div className="lg:col-span-8 flex flex-wrap items-center gap-3 sm:gap-4">
                {bundle.items.map((item, idx) => {
                  const isChecked = Boolean(bundleSelections[item.productId]);

                  return (
                    <React.Fragment key={item.productId}>
                      {idx > 0 && (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-400 font-bold shrink-0">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}

                      {/* Item Card */}
                      <div
                        onClick={() => toggleItem(bundle._id, item.productId, item.isOptional)}
                        className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer w-[140px] sm:w-[160px] text-center ${
                          isChecked
                            ? 'border-emerald-500/80 bg-emerald-50/20 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-80'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        {item.isPrimary && (
                          <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider bg-slate-900 text-white px-1.5 py-0.5 rounded">
                            This Item
                          </span>
                        )}

                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 my-2 flex items-center justify-center p-1 bg-white rounded-lg border border-slate-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>

                        {/* Product Title */}
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-slate-800 line-clamp-2 hover:text-emerald-600 transition-colors"
                          title={item.name}
                        >
                          {item.name}
                        </Link>

                        {/* Price Details */}
                        <div className="mt-2 pt-1 border-t border-slate-100 w-full">
                          <div className="text-xs font-bold text-emerald-700">
                            {formatPrice(item.bundlePrice)}
                          </div>
                          {item.basePrice > item.bundlePrice && (
                            <div className="text-[10px] text-slate-400 line-through">
                              {formatPrice(item.basePrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Bundle Action & Commercial Summary Card */}
              <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Selected Items:</span>
                    <span className="font-semibold text-slate-800">
                      {activeItems.length} of {bundle.items.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {formatPrice(currentBundleTotal)}
                      </span>
                      {currentRegularTotal > currentBundleTotal && (
                        <span className="text-sm text-slate-400 line-through font-medium">
                          {formatPrice(currentRegularTotal)}
                        </span>
                      )}
                    </div>

                    {currentSavings > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Save {formatPrice(currentSavings)} ({effectiveDisc}% Bundle Discount)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    disabled={activeItems.length === 0 || isAdding}
                    onClick={() => handleAddBundleToCart(bundle)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {isAdding
                        ? 'Adding Bundle...'
                        : `Add All ${activeItems.length} to Cart`}
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free shipping & 30-day returns on entire kit</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
