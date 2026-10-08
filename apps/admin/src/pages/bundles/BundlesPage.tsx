import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  RefreshCw,
  Sparkles,
  Tag,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Package,
  Percent,
} from 'lucide-react';
import {
  FcPackage,
  FcPositiveDynamic,
  FcSalesPerformance,
  FcParallelTasks,
} from 'react-icons/fc';
import { bundlesService } from '@shared/api/bundles.service';
import { productsService } from '@shared/api/products.service';
import type {
  AdminProductBundle,
  BundleMetrics,
  CreateBundlePayload,
} from '@shared/types/bundle';
import type { ProductItem } from '@shared/types/product';
import { toast } from '@shared/ui/Toast';
import { Button } from '@shared/ui/Button';
import InputField from '@shared/ui/InputField';
import Drawer from '@shared/ui/Drawer';

const BADGE_PRESETS = [
  'Frequently Bought Together',
  'Complete Creator Kit',
  'Starter Pack',
  'Power User Suite',
  'Pro Studio Bundle',
  'Ultimate Bundle',
];

export const BundlesPage: React.FC = () => {
  const [bundles, setBundles] = useState<AdminProductBundle[]>([]);
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Available catalog products for picking primary & companions
  const [catalogProducts, setCatalogProducts] = useState<ProductItem[]>([]);

  // Drawer Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingBundle, setEditingBundle] = useState<AdminProductBundle | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSlug, setFormSlug] = useState<string>('');
  const [formBadge, setFormBadge] = useState<string>('Frequently Bought Together');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPrimaryProductId, setFormPrimaryProductId] = useState<string>('');
  const [formDiscountPercent, setFormDiscountPercent] = useState<number>(10);
  const [formFixedPrice, setFormFixedPrice] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Companion Items in Builder: array of { productId, discountPercent, isOptional }
  const [formCompanionItems, setFormCompanionItems] = useState<
    { productId: string; discountPercent?: number; isOptional: boolean }[]
  >([]);

  // Search filter inside companion item picker
  const [companionSearch, setCompanionSearch] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [bundlesRes, metricsRes] = await Promise.all([
        bundlesService.list({ limit: 100 }),
        bundlesService.getMetrics(),
      ]);
      setBundles(bundlesRes.items || []);
      setMetrics(metricsRes);
    } catch (err) {
      console.error('Failed to load bundles:', err);
      toast.error('Failed to load product bundles');
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogProducts = async () => {
    if (catalogProducts.length > 0) return;
    try {
      const res = await productsService.list({ limit: 100 });
      setCatalogProducts(res.items || []);
    } catch (err) {
      console.error('Failed to load catalog products:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadCatalogProducts();
  }, []);

  const handleOpenCreateDrawer = () => {
    setEditingBundle(null);
    setFormTitle('');
    setFormSlug('');
    setFormBadge('Frequently Bought Together');
    setFormDescription('');
    setFormPrimaryProductId(catalogProducts[0]?._id || '');
    setFormDiscountPercent(15);
    setFormFixedPrice('');
    setFormIsActive(true);
    setFormCompanionItems([]);
    setCompanionSearch('');
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (bundle: AdminProductBundle) => {
    setEditingBundle(bundle);
    setFormTitle(bundle.title);
    setFormSlug(bundle.slug);
    setFormBadge(bundle.badgeText || 'Frequently Bought Together');
    setFormDescription(bundle.description || '');
    setFormPrimaryProductId(bundle.primaryProductId?._id || '');
    setFormDiscountPercent(bundle.bundleDiscountPercent ?? 10);
    setFormFixedPrice(bundle.bundleFixedPrice ? String(bundle.bundleFixedPrice) : '');
    setFormIsActive(bundle.isActive);
    setFormCompanionItems(
      (bundle.items || []).map((it) => ({
        productId: it.productId?._id || (it.productId as any),
        discountPercent: it.discountPercent ?? bundle.bundleDiscountPercent,
        isOptional: it.isOptional ?? true,
      })),
    );
    setCompanionSearch('');
    setIsDrawerOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await bundlesService.toggle(id);
      setBundles((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive: updated.isActive } : b)),
      );
      toast.success(
        `Bundle is now ${updated.isActive ? 'Active' : 'Inactive'} on storefront`,
      );
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete bundle "${title}"?`)) return;
    try {
      await bundlesService.delete(id);
      setBundles((prev) => prev.filter((b) => b._id !== id));
      toast.success('Bundle deleted successfully');
    } catch (err) {
      toast.error('Failed to delete bundle');
    }
  };

  const handleAddCompanion = (prod: ProductItem) => {
    if (formCompanionItems.some((it) => it.productId === prod._id)) return;
    setFormCompanionItems((prev) => [
      ...prev,
      {
        productId: prod._id,
        discountPercent: formDiscountPercent,
        isOptional: true,
      },
    ]);
  };

  const handleRemoveCompanion = (productId: string) => {
    setFormCompanionItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a bundle title');
      return;
    }
    if (!formPrimaryProductId) {
      toast.error('Please select a primary product');
      return;
    }
    if (formCompanionItems.length === 0) {
      toast.error('Please add at least 1 companion product to complete the bundle');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload: CreateBundlePayload = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        badgeText: formBadge.trim() || 'Frequently Bought Together',
        description: formDescription.trim() || undefined,
        primaryProductId: formPrimaryProductId,
        items: formCompanionItems.map((it, idx) => ({
          productId: it.productId,
          discountPercent: it.discountPercent ?? formDiscountPercent,
          isOptional: it.isOptional,
          displayOrder: idx,
        })),
        bundleDiscountPercent: Number(formDiscountPercent) || 0,
        bundleFixedPrice: formFixedPrice ? Number(formFixedPrice) : null,
        isActive: formIsActive,
      };

      if (editingBundle) {
        const res = await bundlesService.update(editingBundle._id, payload);
        toast.success(`Bundle "${res.title}" updated!`);
      } else {
        const res = await bundlesService.create(payload);
        toast.success(`Bundle "${res.title}" created!`);
      }

      setIsDrawerOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save bundle');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered Bundles Table Data
  const filteredBundles = useMemo(() => {
    return bundles.filter((b) => {
      const matchSearch =
        !search.trim() ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.badgeText && b.badgeText.toLowerCase().includes(search.toLowerCase())) ||
        (b.primaryProductId?.name &&
          b.primaryProductId.name.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && b.isActive) ||
        (statusFilter === 'INACTIVE' && !b.isActive);

      return matchSearch && matchStatus;
    });
  }, [bundles, search, statusFilter]);

  // Selected Primary and Companions for Live Preview
  const selectedPrimaryProduct = catalogProducts.find((p) => p._id === formPrimaryProductId);
  const selectedCompanionProducts = formCompanionItems
    .map((item) => {
      const prod = catalogProducts.find((p) => p._id === item.productId);
      return prod ? { ...item, product: prod } : null;
    })
    .filter(Boolean) as {
    productId: string;
    discountPercent?: number;
    isOptional: boolean;
    product: ProductItem;
  }[];

  // Calculated Preview Totals
  const previewOriginalTotal = useMemo(() => {
    const primaryPrice = selectedPrimaryProduct?.basePrice || 0;
    const companionsPrice = selectedCompanionProducts.reduce(
      (sum, it) => sum + (it.product.basePrice || 0),
      0,
    );
    return +(primaryPrice + companionsPrice).toFixed(2);
  }, [selectedPrimaryProduct, selectedCompanionProducts]);

  const previewDiscountedTotal = useMemo(() => {
    if (formFixedPrice && Number(formFixedPrice) > 0) {
      return Number(formFixedPrice);
    }
    const primaryDiscounted =
      (selectedPrimaryProduct?.basePrice || 0) * (1 - formDiscountPercent / 100);
    const companionsDiscounted = selectedCompanionProducts.reduce((sum, it) => {
      const disc = it.discountPercent ?? formDiscountPercent;
      return sum + (it.product.basePrice || 0) * (1 - disc / 100);
    }, 0);
    return +(primaryDiscounted + companionsDiscounted).toFixed(2);
  }, [
    selectedPrimaryProduct,
    selectedCompanionProducts,
    formDiscountPercent,
    formFixedPrice,
  ]);

  return (
    <div className="w-full space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/80">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Product Bundles & "Buy Together" Kits
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Increase Average Order Value (AOV) by offering discounted multi-product companion bundles directly on product pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateDrawer}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Bundle
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Bundles
            </span>
            <FcPackage className="w-6 h-6" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics?.totalBundles ?? bundles.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Configured commercial kits</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Kits
            </span>
            <FcPositiveDynamic className="w-6 h-6" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {metrics?.activeBundles ?? bundles.filter((b) => b.isActive).length}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Live on storefront PDPs</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Kit Discount
            </span>
            <FcSalesPerformance className="w-6 h-6" />
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">
            {metrics?.averageDiscountPercent ?? 12}%
          </div>
          <div className="text-[11px] text-indigo-700/80 mt-1">Target customer incentive</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fixed Price Bundles
            </span>
            <FcParallelTasks className="w-6 h-6" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics?.fixedPriceBundles ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Set package price overrides</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bundle title or primary product..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Bundles Table */}
      <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3">Bundle Info</th>
                <th className="px-4 py-3">Anchor Product (PDP)</th>
                <th className="px-4 py-3">Companion Accessories</th>
                <th className="px-4 py-3">Bundle Discount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading product bundles...
                  </td>
                </tr>
              ) : filteredBundles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No product bundles match your query.
                  </td>
                </tr>
              ) : (
                filteredBundles.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Bundle Info */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <Sparkles className="w-2.5 h-2.5" />
                          {b.badgeText || 'Frequently Bought Together'}
                        </span>
                        <div className="font-bold text-slate-900 text-xs">{b.title}</div>
                        {b.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {b.description}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Anchor Product */}
                    <td className="px-4 py-3.5">
                      {b.primaryProductId ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                            {b.primaryProductId.thumbnailUrl ? (
                              <img
                                src={b.primaryProductId.thumbnailUrl}
                                alt={b.primaryProductId.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 line-clamp-1 text-xs">
                              {b.primaryProductId.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              ${b.primaryProductId.basePrice}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-medium text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Companion Accessories */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden">
                          {b.items.map((it, idx) => {
                            const prod = it.productId;
                            return (
                              <div
                                key={idx}
                                title={prod?.name || 'Companion item'}
                                className="inline-block w-8 h-8 rounded-full ring-2 ring-white bg-slate-100 border border-slate-200 overflow-hidden p-0.5"
                              >
                                {prod?.thumbnailUrl ? (
                                  <img
                                    src={prod.thumbnailUrl}
                                    alt={prod.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package className="w-3.5 h-3.5 text-slate-400 mx-auto mt-1" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 ml-1">
                          +{b.items.length} {b.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </td>

                    {/* Bundle Discount */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 font-extrabold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                          <Tag className="w-3 h-3 text-amber-600" />
                          {b.bundleDiscountPercent}% OFF
                        </span>
                        {b.bundleFixedPrice != null && b.bundleFixedPrice > 0 && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Override: ${b.bundleFixedPrice}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(b._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {b.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditDrawer(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit bundle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b._id, b.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete bundle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingBundle ? 'Edit Product Bundle' : 'Create New Product Bundle'}
        size="xl"
      >
        <form onSubmit={handleSaveBundle} className="space-y-6 p-6">
          {/* Section 1: Commercial Header */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Bundle Merchandising Info
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bundle Title *
              </label>
              <InputField
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Apple iPhone 16 Pro Max Creator Suite"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Badge Label
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {BADGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormBadge(preset)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      formBadge === preset
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <InputField
                type="text"
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                placeholder="Frequently Bought Together"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marketing Description (Optional)
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Explain why these items complement each other..."
              />
            </div>
          </div>

          {/* Section 2: Anchor Product */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              Primary Anchor Product (Displayed on this PDP) *
            </h4>

            <select
              value={formPrimaryProductId}
              onChange={(e) => setFormPrimaryProductId(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              required
            >
              <option value="">Select Anchor Product...</option>
              {catalogProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ${p.basePrice} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Section 3: Companion Accessories */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                Bundled Companion Products ({formCompanionItems.length}) *
              </h4>
              <span className="text-[11px] text-slate-400">Add 1 or more products</span>
            </div>

            {/* Selected Companion Items List */}
            {selectedCompanionProducts.length > 0 && (
              <div className="space-y-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                {selectedCompanionProducts.map((it) => (
                  <div
                    key={it.productId}
                    className="flex items-center justify-between gap-3 p-2 bg-white rounded-md border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {it.product.thumbnailUrl ? (
                          <img
                            src={it.product.thumbnailUrl}
                            alt={it.product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {it.product.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Regular: ${it.product.basePrice}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500">Discount %:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={it.discountPercent ?? formDiscountPercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormCompanionItems((prev) =>
                              prev.map((ci) =>
                                ci.productId === it.productId
                                  ? { ...ci, discountPercent: val }
                                  : ci,
                              ),
                            );
                          }}
                          className="w-14 p-1 text-xs text-center border border-slate-200 rounded"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCompanion(it.productId)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Remove from bundle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Companion Search Picker */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block">
                Search & Add Companion Products:
              </span>
              <input
                type="text"
                value={companionSearch}
                onChange={(e) => setCompanionSearch(e.target.value)}
                placeholder="Type to filter catalog..."
                className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
              />

              <div className="max-h-36 overflow-y-auto space-y-1">
                {catalogProducts
                  .filter(
                    (p) =>
                      p._id !== formPrimaryProductId &&
                      !formCompanionItems.some((ci) => ci.productId === p._id) &&
                      (!companionSearch.trim() ||
                        p.name.toLowerCase().includes(companionSearch.toLowerCase()) ||
                        p.sku.toLowerCase().includes(companionSearch.toLowerCase())),
                  )
                  .slice(0, 8)
                  .map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-white text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">${p.basePrice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddCompanion(p)}
                        className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Section 4: Discount & Commercials */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-600" />
              Bundle Pricing & Discounts
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Global Kit Discount % *
                </label>
                <InputField
                  type="number"
                  min="0"
                  max="100"
                  value={formDiscountPercent}
                  onChange={(e) => setFormDiscountPercent(Number(e.target.value))}
                  placeholder="15"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fixed Package Price Override (Optional)
                </label>
                <InputField
                  type="number"
                  min="0"
                  step="0.01"
                  value={formFixedPrice}
                  onChange={(e) => setFormFixedPrice(e.target.value)}
                  placeholder="Leave empty for auto %"
                />
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Regular Combined:</span>
                <span className="font-semibold text-slate-900 line-through">
                  ${previewOriginalTotal.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Bundle Price:</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ${previewDiscountedTotal.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Customer Saves:</span>
                <span className="font-extrabold text-emerald-600">
                  ${Math.max(0, +(previewOriginalTotal - previewDiscountedTotal).toFixed(2))}
                </span>
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="formIsActive"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="formIsActive" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Publish bundle immediately to storefront
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={formSubmitting}
            >
              {formSubmitting
                ? 'Saving...'
                : editingBundle
                ? 'Update Bundle'
                : 'Create Bundle'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default BundlesPage;
