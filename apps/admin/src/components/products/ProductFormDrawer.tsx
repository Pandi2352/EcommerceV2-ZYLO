import React, { useState, useEffect } from 'react';
import {
  Layers,
  DollarSign,
  Image as ImageIcon,
  Boxes,
  ListPlus,
  Search,
  Check,
  Plus,
  Trash2,
  Lock,
  Unlock,
  FileText,
  FolderTree,
  Sparkles,
  Tag,
  Barcode,
  UploadCloud,
  TrendingUp,
} from 'lucide-react';
import Drawer from '@shared/ui/Drawer';
import Tabs from '@shared/ui/Tabs';
import Button from '@shared/ui/Button';
import InputField from '@shared/ui/InputField';
import Dropdown, { type DropdownOption } from '@shared/ui/Dropdown';
import Alert from '@shared/ui/Alert';
import TagInput from '@shared/ui/TagInput';
import SeoSnippetPreview from '@shared/ui/SeoSnippetPreview';
import { categoriesService } from '@shared/api/categories.service';
import { brandsService } from '@shared/api/brands.service';
import type {
  ProductItem,
  CreateProductPayload,
  UpdateProductPayload,
  ProductImage,
  ProductSpecification,
  ProductVariant,
  ProductStatus,
} from '@shared/types/product';

export interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => Promise<void>;
  initialData?: ProductItem | null;
}

type TabKey = 'general' | 'pricing' | 'media' | 'variants' | 'specs' | 'seo';

export const ProductFormDrawer: React.FC<ProductFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dropdown options loaded from APIs
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption<string>[]>([]);
  const [brandOptions, setBrandOptions] = useState<DropdownOption<string>[]>([]);

  // Tab 1: General & Taxonomy
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<ProductStatus>('DRAFT');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  // Tab 2: Pricing & Inventory
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorders, setAllowBackorders] = useState(false);

  // Tab 3: Media
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Tab 4: Variants
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantSku, setVariantSku] = useState('');
  const [variantTitle, setVariantTitle] = useState('');
  const [variantPrice, setVariantPrice] = useState<number | ''>('');
  const [variantStock, setVariantStock] = useState<number | ''>(10);

  // Tab 5: Specifications
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [specGroup, setSpecGroup] = useState('Technical');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Tab 6: SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Load Categories & Brands for Dropdowns
  useEffect(() => {
    if (!isOpen) return;

    categoriesService
      .list({ limit: 100 })
      .then((res) => {
        const opts = (res.items || []).map((c) => ({
          value: c._id,
          label: c.name,
        }));
        setCategoryOptions(opts);
        if (!categoryId && opts.length > 0 && !initialData) {
          setCategoryId(opts[0].value);
        }
      })
      .catch((err: unknown) => console.error('Failed to load categories', err));

    brandsService
      .list({ limit: 100 })
      .then((res) => {
        const opts = (res.items || []).map((b) => ({
          value: b._id,
          label: b.name,
        }));
        setBrandOptions(opts);
        if (!brandId && opts.length > 0 && !initialData) {
          setBrandId(opts[0].value);
        }
      })
      .catch((err) => console.error('Failed to load brands', err));
  }, [isOpen]);

  // Reset or Populate on initialData / isOpen change
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setIsSlugManual(true);
      setCategoryId(initialData.categoryId?._id || '');
      setBrandId(initialData.brandId?._id || '');
      setShortDescription(initialData.shortDescription || '');
      setDescription(initialData.description || '');
      setTags(initialData.tags || []);
      setStatus(initialData.status || 'DRAFT');
      setIsFeatured(initialData.isFeatured || false);
      setIsNewArrival(initialData.isNewArrival || false);

      setBasePrice(initialData.basePrice ?? '');
      setSalePrice(initialData.salePrice ?? '');
      setCostPrice(initialData.costPrice ?? '');
      setCurrency(initialData.currency || 'USD');
      setSku(initialData.sku || '');
      setBarcode(initialData.barcode || '');
      setStockQuantity(initialData.stockQuantity ?? 0);
      setLowStockThreshold(initialData.lowStockThreshold ?? 5);
      setTrackInventory(initialData.trackInventory ?? true);
      setAllowBackorders(initialData.allowBackorders ?? false);

      setImages(initialData.images || []);
      setHasVariants(initialData.hasVariants || false);
      setVariants(initialData.variants || []);
      setSpecifications(initialData.specifications || []);

      setMetaTitle(initialData.seo?.metaTitle || '');
      setMetaDescription(initialData.seo?.metaDescription || '');
      setKeywords(initialData.seo?.keywords || []);
      setCanonicalUrl(initialData.seo?.canonicalUrl || '');
    } else {
      setName('');
      setSlug('');
      setIsSlugManual(false);
      setShortDescription('');
      setDescription('');
      setTags([]);
      setStatus('DRAFT');
      setIsFeatured(false);
      setIsNewArrival(false);

      setBasePrice('');
      setSalePrice('');
      setCostPrice('');
      setCurrency('USD');
      setSku('');
      setBarcode('');
      setStockQuantity(0);
      setLowStockThreshold(5);
      setTrackInventory(true);
      setAllowBackorders(false);

      setImages([]);
      setHasVariants(false);
      setVariants([]);
      setSpecifications([]);

      setMetaTitle('');
      setMetaDescription('');
      setKeywords([]);
      setCanonicalUrl('');
    }
    setErrorMsg(null);
    setActiveTab('general');
  }, [initialData, isOpen]);

  // Slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Image actions
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const isFirst = images.length === 0;
    setImages([
      ...images,
      {
        url: newImageUrl.trim(),
        altText: name || 'Product image',
        isPrimary: isFirst,
        displayOrder: images.length,
      },
    ]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  // Variant actions
  const handleAddVariant = () => {
    if (!variantSku.trim() || !variantTitle.trim() || variantPrice === '') return;
    setVariants([
      ...variants,
      {
        sku: variantSku.trim().toUpperCase(),
        title: variantTitle.trim(),
        price: Number(variantPrice),
        stockQuantity: Number(variantStock) || 0,
        attributes: {},
        isActive: true,
      },
    ]);
    setVariantSku('');
    setVariantTitle('');
    setVariantPrice('');
    setVariantStock(10);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Spec actions
  const handleAddSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setSpecifications([
      ...specifications,
      {
        group: specGroup.trim() || 'General',
        key: specKey.trim(),
        value: specValue.trim(),
      },
    ]);
    setSpecKey('');
    setSpecValue('');
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required');
      setActiveTab('general');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Category selection is required');
      setActiveTab('general');
      return;
    }
    if (!brandId) {
      setErrorMsg('Brand selection is required');
      setActiveTab('general');
      return;
    }
    if (basePrice === '' || Number(basePrice) < 0) {
      setErrorMsg('Valid base price is required');
      setActiveTab('pricing');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const primaryImg = images.find((img) => img.isPrimary) || images[0];

      const payload: CreateProductPayload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        sku: sku.trim().toUpperCase() || undefined,
        barcode: barcode.trim() || null,
        description: description.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        categoryId,
        brandId,
        tags,
        basePrice: Number(basePrice),
        salePrice: salePrice !== '' ? Number(salePrice) : null,
        costPrice: costPrice !== '' ? Number(costPrice) : null,
        currency,
        trackInventory,
        stockQuantity: Number(stockQuantity) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        allowBackorders,
        images,
        thumbnailUrl: primaryImg?.url || null,
        specifications,
        hasVariants,
        variants: hasVariants ? variants : [],
        status,
        isFeatured,
        isNewArrival,
        seo: {
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          keywords,
          canonicalUrl: canonicalUrl.trim() || undefined,
          ogImage: primaryImg?.url || null,
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save product';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Product: ${initialData?.name}` : 'Create Catalog Product'}
      size="2xl"
      headerExtra={
        <Tabs<TabKey>
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'general', label: 'General & Taxonomy', icon: <Layers /> },
            { key: 'pricing', label: 'Pricing & Inventory', icon: <DollarSign /> },
            { key: 'media', label: 'Media Gallery', icon: <ImageIcon />, count: images.length },
            { key: 'variants', label: 'Variants Matrix', icon: <Boxes />, count: variants.length },
            { key: 'specs', label: 'Specifications', icon: <ListPlus />, count: specifications.length },
            { key: 'seo', label: 'SEO & Search', icon: <Search /> },
          ]}
        />
      }
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md shadow-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="rounded-md shadow-none"
          >
            <Check className="w-4 h-4 mr-1.5" />
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errorMsg && (
          <Alert tone="error" onDismiss={() => setErrorMsg(null)} className="shrink-0">
            {errorMsg}
          </Alert>
        )}

        {/* ─── TAB 1: General & Taxonomy ────────────────────────────────────── */}
        {activeTab === 'general' && (
          <div className="space-y-4 pt-1">
            {/* Card 1: Core Product Identity */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Core Identification</h4>
                </div>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/60">
                  Essential Info
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Product Title <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-normal">Customer-facing title</span>
                  </div>
                  <InputField
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Product URL Slug
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSlugManual(!isSlugManual)}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {isSlugManual ? <Unlock className="w-3 h-3 text-amber-500" /> : <Lock className="w-3 h-3 text-blue-500" />}
                      {isSlugManual ? 'Switch to Auto-generate' : 'Manual Override'}
                    </button>
                  </div>
                  <InputField
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={!isSlugManual}
                    placeholder="sony-wh-1000xm5-wireless-headphones"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    {isSlugManual ? (
                      <span className="text-amber-600 font-medium">Custom slug override enabled. Ensure uniqueness.</span>
                    ) : (
                      <span className="text-slate-500">Auto-generated from title for clean canonical routing.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Catalog Taxonomy & Partner */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <FolderTree className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Catalog Taxonomy & Brand</h4>
                </div>
                <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100/60">
                  Taxonomy
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category Department <span className="text-rose-500">*</span>
                    </label>
                    <Dropdown
                      value={categoryId}
                      onChange={(val) => setCategoryId(val)}
                      options={categoryOptions}
                      placeholder="Select Category"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Brand Partner <span className="text-rose-500">*</span>
                    </label>
                    <Dropdown
                      value={brandId}
                      onChange={(val) => setBrandId(val)}
                      options={brandOptions}
                      placeholder="Select Brand"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Descriptions & Marketing Copy */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-purple-50 text-purple-600 border border-purple-100">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Merchandising Copy & Discovery</h4>
                </div>
                <span className="text-[11px] text-purple-600 font-medium bg-purple-50/60 px-2 py-0.5 rounded border border-purple-100/60">
                  Content
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Short Description / Snippet
                    </label>
                    <span className="text-[11px] text-slate-400">{shortDescription.length}/300 chars</span>
                  </div>
                  <InputField
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief summary displayed on catalog cards and search previews..."
                    maxLength={300}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Comprehensive Product Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Comprehensive marketing copy, technical highlights, and product story..."
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <TagInput
                  label="Catalog Search Tags"
                  tags={tags}
                  onChange={setTags}
                  placeholder="Type tag and press Enter (e.g. wireless, anc, audiophile)..."
                  helperText="Search indexing tags aid customers in multi-attribute search and catalog discovery."
                />
              </div>
            </div>

            {/* Card 4: Publishing Status & Highlights */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-100">
                    <Tag className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Publishing Status & Merchandising</h4>
                </div>
                <span className="text-[11px] text-amber-600 font-medium bg-amber-50/60 px-2 py-0.5 rounded border border-amber-100/60">
                  Storefront Rules
                </span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Catalog Status
                    </label>
                    <Dropdown<ProductStatus>
                      value={status}
                      onChange={(val) => {
                        if (val) setStatus(val as ProductStatus);
                      }}
                      options={[
                        { value: 'DRAFT', label: 'Draft (Hidden from Store)' },
                        { value: 'PUBLISHED', label: 'Published (Active & Live)' },
                        { value: 'ARCHIVED', label: 'Archived (Discontinued)' },
                      ]}
                    />
                  </div>

                  <div className="p-2.5 rounded-md border border-slate-200 bg-slate-50/50 flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="prod-featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <label htmlFor="prod-featured" className="text-xs font-medium text-slate-800 select-none cursor-pointer">
                      Featured Spotlight
                      <span className="block text-[10px] text-amber-700 font-normal">Showcase on Homepage</span>
                    </label>
                  </div>

                  <div className="p-2.5 rounded-md border border-slate-200 bg-slate-50/50 flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="prod-new-arrival"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <label htmlFor="prod-new-arrival" className="text-xs font-medium text-slate-800 select-none cursor-pointer">
                      New Arrival Badge
                      <span className="block text-[10px] text-emerald-700 font-normal">Display 'NEW' ribbon</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Pricing & Inventory ───────────────────────────────────── */}
        {activeTab === 'pricing' && (
          <div className="space-y-4 pt-1">
            {/* Card 1: Pricing Structure & Margins */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <DollarSign className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Pricing Strategy & Commercial Terms</h4>
                </div>
                <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-100/60">
                  Currency: USD ($)
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Base Retail Price ($) <span className="text-rose-500">*</span>
                    </label>
                    <InputField
                      type="number"
                      min="0"
                      step="0.01"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="199.99"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sale Promotional Price ($)
                    </label>
                    <InputField
                      type="number"
                      min="0"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="179.99"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Cost of Goods ($)
                    </label>
                    <InputField
                      type="number"
                      min="0"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="110.00"
                    />
                  </div>
                </div>

                {/* Live Profit Margin & Promotional Discount Calculation Badge */}
                {(basePrice !== '' || costPrice !== '' || salePrice !== '') && (
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {basePrice !== '' && costPrice !== '' && Number(basePrice) > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Estimated Margin:{' '}
                          <span className="font-semibold text-emerald-800">
                            ${(Number(basePrice) - Number(costPrice)).toFixed(2)}
                          </span>{' '}
                          ({(((Number(basePrice) - Number(costPrice)) / Number(basePrice)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                    {basePrice !== '' && salePrice !== '' && Number(salePrice) < Number(basePrice) && (
                      <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          Promo Discount:{' '}
                          <span className="font-semibold text-blue-800">
                            -${(Number(basePrice) - Number(salePrice)).toFixed(2)}
                          </span>{' '}
                          ({(((Number(basePrice) - Number(salePrice)) / Number(basePrice)) * 100).toFixed(0)}% OFF)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: SKU & Barcode Tracking */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    <Barcode className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Stock Identifiers & Barcode</h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium bg-slate-100/70 px-2 py-0.5 rounded border border-slate-200/60">
                  Logistics
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Stock Keeping Unit (SKU)
                    </label>
                    <InputField
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. SNY-WH1000XM5 (Auto-generated if left blank)"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Leave blank to automatically generate unique SKU standard format: <span className="font-mono text-slate-600">ZY-[PRE]-[RND]</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Barcode / UPC / EAN
                    </label>
                    <InputField
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="12-digit UPC or 13-digit EAN"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Compatible with optical warehouse barcode scanners.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Inventory Control & Replenishment */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                    <Boxes className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Warehouse Inventory & Stock Rules</h4>
                </div>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/60">
                  Fulfillment
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Available Stock Quantity <span className="text-rose-500">*</span>
                      </label>
                      {/* Live Stock Indicator Pill */}
                      {stockQuantity !== '' && (
                        Number(stockQuantity) === 0 ? (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Out of Stock
                          </span>
                        ) : Number(stockQuantity) <= Number(lowStockThreshold || 5) ? (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            In Stock
                          </span>
                        )
                      )}
                    </div>
                    <InputField
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Low Stock Alert Threshold
                    </label>
                    <InputField
                      type="number"
                      min="0"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-md border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackInventory}
                      onChange={(e) => setTrackInventory(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-medium text-slate-800 block">Automated Stock Tracking</span>
                      <span className="text-[10px] text-slate-500 block">Deduct quantities automatically upon order placement</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-md border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowBackorders}
                      onChange={(e) => setAllowBackorders(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-medium text-slate-800 block">Allow Backorders</span>
                      <span className="text-[10px] text-slate-500 block">Accept orders even when available inventory drops to zero</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Media Gallery ─────────────────────────────────────────── */}
        {activeTab === 'media' && (
          <div className="space-y-4 pt-1">
            {/* Card 1: Add Image Asset */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Media Resource Uploader</h4>
                </div>
                <span className="text-[11px] text-sky-600 font-medium bg-sky-50/60 px-2 py-0.5 rounded border border-sky-100/60">
                  CDN & URL
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      placeholder="Paste high-res CDN or Unsplash photo link (https://images.unsplash.com/...)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddImage}
                    className="rounded-md shrink-0 shadow-none border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1 text-blue-600" />
                    Add Photo
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400">
                  First added image will be configured as the primary storefront catalog cover thumbnail.
                </p>
              </div>
            </div>

            {/* Card 2: Product Gallery Showcase */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Catalog Image Gallery</h4>
                </div>
                <span className="text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                  {images.length} Image{images.length === 1 ? '' : 's'} Attached
                </span>
              </div>
              <div className="p-4">
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group border rounded-md p-2 flex flex-col items-center transition-all ${
                          img.isPrimary
                            ? 'border-blue-400 bg-blue-50/20 ring-1 ring-blue-300'
                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-32 bg-white rounded flex items-center justify-center overflow-hidden mb-2 border border-slate-100">
                          <img
                            src={img.url}
                            alt={img.altText || 'Product'}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="w-full flex items-center justify-between text-xs pt-1.5 border-t border-slate-200">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700">
                            <input
                              type="radio"
                              name="primaryImage"
                              checked={img.isPrimary}
                              onChange={() => handleSetPrimaryImage(idx)}
                              className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                            />
                            {img.isPrimary ? (
                              <span className="font-semibold text-blue-600">Cover Primary</span>
                            ) : (
                              'Set Primary'
                            )}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-md text-slate-400 text-xs">
                    No images added yet. Paste direct image CDN URLs above to build the product gallery.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: Variants Matrix ───────────────────────────────────────── */}
        {activeTab === 'variants' && (
          <div className="space-y-4 pt-1">
            {/* Card 1: Configuration Switch */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Boxes className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Multi-SKU Variant Strategy</h4>
                </div>
                <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100/60">
                  Matrix Config
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">
                      Enable Multi-Option SKU Variants
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Distinguish distinct colors, storage capacities, or dimensions under a parent product.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {hasVariants && (
              <>
                {/* Card 2: Add SKU Variant Row */}
                <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
                  <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Add SKU Variant Option</h4>
                    </div>
                    <span className="text-[11px] text-slate-500">Quick Insert</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <InputField
                        value={variantSku}
                        onChange={(e) => setVariantSku(e.target.value)}
                        placeholder="Variant SKU (e.g. SNY-BLK-256)"
                      />
                      <InputField
                        value={variantTitle}
                        onChange={(e) => setVariantTitle(e.target.value)}
                        placeholder="Title (e.g. Midnight Black / 256GB)"
                      />
                      <InputField
                        type="number"
                        min="0"
                        step="0.01"
                        value={variantPrice}
                        onChange={(e) => setVariantPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Price ($)"
                      />
                      <div className="flex gap-2">
                        <InputField
                          type="number"
                          min="0"
                          value={variantStock}
                          onChange={(e) => setVariantStock(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Stock"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          onClick={handleAddVariant}
                          className="rounded-md shrink-0 shadow-none"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Variants Matrix Table */}
                <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
                  <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Active Variant Items</h4>
                    <span className="text-[11px] text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                      {variants.length} Configured
                    </span>
                  </div>
                  {variants.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Variant Title</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock Quantity</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono text-slate-800 text-[11px]">{v.sku}</td>
                            <td className="p-3 font-medium text-slate-900">{v.title}</td>
                            <td className="p-3 font-semibold text-emerald-700">${v.price}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                {v.stockQuantity} units
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No variants added yet. Use the input form above to populate variant rows.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── TAB 5: Technical Specifications ──────────────────────────────── */}
        {activeTab === 'specs' && (
          <div className="space-y-4 pt-1">
            {/* Card 1: Add Specification Attribute */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-cyan-50 text-cyan-600 border border-cyan-100">
                    <ListPlus className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Technical Specification Builder</h4>
                </div>
                <span className="text-[11px] text-cyan-600 font-medium bg-cyan-50/60 px-2 py-0.5 rounded border border-cyan-100/60">
                  Data Specs
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <InputField
                    value={specGroup}
                    onChange={(e) => setSpecGroup(e.target.value)}
                    placeholder="Group (e.g. Audio, Connectivity)"
                  />
                  <InputField
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Attribute (e.g. Battery Life)"
                  />
                  <div className="flex gap-2">
                    <InputField
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      placeholder="Value (e.g. Up to 30 hours)"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAddSpec}
                      className="rounded-md shrink-0 shadow-none"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Grouped specifications render as structured technical tables on the storefront product page.
                </p>
              </div>
            </div>

            {/* Card 2: Specification Attributes Table */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Configured Specifications</h4>
                <span className="text-[11px] text-cyan-700 font-medium bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/60">
                  {specifications.length} Attributes Defined
                </span>
              </div>
              {specifications.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Section Group</th>
                      <th className="p-3">Specification Key</th>
                      <th className="p-3">Value</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specifications.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                            {s.group || 'General'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{s.key}</td>
                        <td className="p-3 text-slate-600">{s.value}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No technical specifications added yet. Fill in the group, attribute, and value above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 6: SEO & Social ──────────────────────────────────────────── */}
        {activeTab === 'seo' && (
          <div className="space-y-4 pt-1">
            {/* Card 1: Meta Tags & Directives */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Search Engine Optimization (SEO)</h4>
                </div>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/60">
                  SERP Directives
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Meta Title
                    </label>
                    <span className={`text-[11px] ${metaTitle.length > 60 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                      {metaTitle.length}/60 characters {metaTitle.length <= 60 && '(Optimal)'}
                    </span>
                  </div>
                  <InputField
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={`${name || 'Product'} | Official Store at ZYLO`}
                    maxLength={100}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Meta Description
                    </label>
                    <span className={`text-[11px] ${metaDescription.length > 160 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                      {metaDescription.length}/160 characters {metaDescription.length <= 160 && '(Optimal)'}
                    </span>
                  </div>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="High-converting search engine description highlighting benefits and warranty..."
                    maxLength={250}
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <TagInput
                  label="Keywords & Search Queries"
                  tags={keywords}
                  onChange={setKeywords}
                  placeholder="Type keyword and press Enter..."
                  helperText="Search bots use index keywords to associate relevant customer queries."
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Canonical URL Override
                  </label>
                  <InputField
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder={`https://zylo.com/products/${slug || 'product-slug'}`}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: SERP Snippet Preview */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
              <div className="bg-slate-50/75 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-800 tracking-wide">Live Google SERP Snippet Preview</h4>
                <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  Search Engine Simulation
                </span>
              </div>
              <div className="p-4">
                <SeoSnippetPreview
                  title={metaTitle || `${name || 'Product Title'} | Official Store at ZYLO`}
                  description={
                    metaDescription ||
                    shortDescription ||
                    description ||
                    `Explore ${name || 'this product'} with authentic manufacturer warranty and express shipping at ZYLO.`
                  }
                  slug={slug}
                  modulePath="products"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default ProductFormDrawer;
