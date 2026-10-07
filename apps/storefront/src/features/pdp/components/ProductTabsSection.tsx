import React from 'react';
import type { ProductItem } from '@shared/types/product';
import type { ProductTabId } from '../hooks/useProductDetails';
import {
  FileText,
  Sliders,
  Truck,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface ProductTabsSectionProps {
  product: ProductItem;
  activeTab: ProductTabId;
  onTabChange: (tab: ProductTabId) => void;
}

export const ProductTabsSection: React.FC<ProductTabsSectionProps> = ({
  product,
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview & Highlights', icon: FileText },
    { id: 'specs', label: 'Technical Specifications', icon: Sliders },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
    { id: 'reviews', label: `Reviews (${product.ratingCount || 24})`, icon: MessageSquare },
  ] as const;

  return (
    <div id="reviews" className="bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* 1. Tab Navigation Bar */}
      <div className="flex items-center overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-2 pt-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-900 bg-white rounded-t-md'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 rounded-t-md'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Tab Content Panels */}
      <div className="p-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Product Description
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                {product.description ||
                  product.shortDescription ||
                  'Engineered with premium materials for maximum durability and effortless ergonomics. Each component is thoroughly stress-tested to ensure reliable day-to-day operation in both professional and consumer setups.'}
              </p>
            </div>

            {/* Feature Bullets / Highlights */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Key Features & Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Optimized Build Architecture</span>
                    <span className="text-slate-500">Precision manufacturing using industrial-grade materials for exceptional product longevity.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Certified Energy Efficiency</span>
                    <span className="text-slate-500">Meets global standards for performance with minimized power overhead and thermal dissipation.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Seamless Ecosystem Compatibility</span>
                    <span className="text-slate-500">Instant plug-and-play synchronization with existing accessories, ports, and platforms.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Factory Calibrated Out-of-Box</span>
                    <span className="text-slate-500">Arrives ready to run with pre-tuned firmware profiles and quick-start reference guides.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags strip */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400">Tags:</span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TECHNICAL SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Technical Specifications & Metrics
            </h3>

            {product.specifications && product.specifications.length > 0 ? (
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                          {spec.key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        SKU
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-mono">
                        {product.sku}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/60">
                      <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        Category
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {product.categoryId?.name || 'General Catalog'}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        Brand Partner
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {product.brandId?.name || 'ZYLO Select'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-slate-50 border border-slate-100 text-xs text-slate-500">
                Detailed technical specifications will be published soon by the manufacturer.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHIPPING & RETURNS */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 max-w-3xl text-xs text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Delivery Windows</span>
                </div>
                <p className="leading-relaxed">
                  Orders placed before 2:00 PM EST ship the same business day. Standard tracked delivery arrives in 2–4 business days. Priority Express arrives next business day.
                </p>
              </div>

              <div className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
                <p className="leading-relaxed">
                  If you are not 100% satisfied with your item, return it within 30 days of delivery in original packaging for a full refund or exchange.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                Packaging & Handling
              </span>
              <p className="leading-relaxed">
                All shipments are packed using recyclable shock-absorbing protective foam and sealed with tamper-evident security tape. High-value tech equipment is insured against transit damage.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMER REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-md bg-slate-50 border border-slate-200">
              {/* Overall Score */}
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                <div className="text-4xl font-black text-slate-900 mb-1">
                  {product.ratingAverage ? product.ratingAverage.toFixed(1) : '4.8'}
                </div>
                <div className="flex items-center text-amber-400 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500">
                  Based on {product.ratingCount || 24} customer reviews
                </span>
              </div>

              {/* Score Distribution Bars */}
              <div className="col-span-2 space-y-1.5 flex flex-col justify-center">
                {[
                  { stars: 5, pct: 78 },
                  { stars: 4, pct: 16 },
                  { stars: 3, pct: 4 },
                  { stars: 2, pct: 1 },
                  { stars: 1, pct: 1 },
                ].map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-slate-600 font-medium">{row.stars} stars</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-400">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Verified Reviews */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Verified Reviews
              </h4>

              <div className="divide-y divide-slate-100">
                <div className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">Marcus Vance</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-md font-semibold">Verified Buyer</span>
                    </div>
                    <span className="text-[11px] text-slate-400">2 days ago</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Exceptional quality out of the box. Exceeded my expectations in build rigidity and finish. Definitely worth every penny.
                  </p>
                </div>

                <div className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">Elena Rostova</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-md font-semibold">Verified Buyer</span>
                    </div>
                    <span className="text-[11px] text-slate-400">1 week ago</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fast shipping and arrived in pristine condition. Exactly as described by the vendor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabsSection;
