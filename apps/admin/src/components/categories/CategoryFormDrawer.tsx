import React, { useState, useEffect } from 'react';
import {
  Layers,
  Image as ImageIcon,
  Sparkles,
  Search,
  Filter,
  X,
  Info,
  Plus,
} from 'lucide-react';
import Drawer from '@shared/ui/Drawer';
import Tabs from '@shared/ui/Tabs';
import Button from '@shared/ui/Button';
import InputField from '@shared/ui/InputField';
import Dropdown from '@shared/ui/Dropdown';
import Alert from '@shared/ui/Alert';
import ImageUploadDropzone from '@shared/ui/ImageUploadDropzone';
import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@shared/types/catalog';

export interface CategoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => Promise<void>;
  initialData?: CategoryItem | null;
  initialParentId?: string | null;
  allCategories: CategoryItem[];
}

type TabKey = 'general' | 'media' | 'merchandising' | 'seo' | 'facets';

export const CategoryFormDrawer: React.FC<CategoryFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialParentId,
  allCategories,
}) => {
  const isEditing = Boolean(initialData);
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('root');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Media
  const [iconUrl, setIconUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bannerDesktopUrl, setBannerDesktopUrl] = useState('');
  const [bannerMobileUrl, setBannerMobileUrl] = useState('');
  const [imageAltText, setImageAltText] = useState('');

  // Merchandising
  const [includeInMenu, setIncludeInMenu] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [badgeText, setBadgeText] = useState('');
  const [badgeColor, setBadgeColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose'>('indigo');
  const [badgeExpiresAt, setBadgeExpiresAt] = useState('');

  // Phase 2: Dynamic Smart Collection Rules
  const [isSmartCollection, setIsSmartCollection] = useState(false);
  const [rulesCondition, setRulesCondition] = useState<'ALL' | 'ANY'>('ALL');
  const [rules, setRules] = useState<Array<{ field: string; operator: string; value: string }>>([]);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');

  // Facets
  const [facets, setFacets] = useState<string[]>([]);
  const [facetInput, setFacetInput] = useState('');

  // Initialize form on open or data change
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setIsSlugManual(true);
      setDescription(initialData.description || '');
      let parentVal = 'root';
      if (typeof initialData.parentId === 'object' && initialData.parentId) {
        parentVal = initialData.parentId._id;
      } else if (typeof initialData.parentId === 'string' && initialData.parentId) {
        parentVal = initialData.parentId;
      }
      setParentId(parentVal);
      setDisplayOrder(initialData.displayOrder ?? 0);
      setStatus(initialData.status || 'ACTIVE');

      setIconUrl(initialData.iconUrl || '');
      setThumbnailUrl(initialData.thumbnailUrl || '');
      setBannerDesktopUrl(initialData.bannerDesktopUrl || '');
      setBannerMobileUrl(initialData.bannerMobileUrl || '');
      setImageAltText(initialData.imageAltText || '');

      setIncludeInMenu(initialData.includeInMenu ?? true);
      setIsFeatured(initialData.isFeatured ?? false);
      setBadgeText(initialData.badge?.text || '');
      setBadgeColor(initialData.badge?.color || 'indigo');
      setBadgeExpiresAt(
        initialData.badgeExpiresAt
          ? new Date(initialData.badgeExpiresAt).toISOString().slice(0, 16)
          : ''
      );

      setIsSmartCollection(initialData.isSmartCollection ?? false);
      setRulesCondition(initialData.rulesCondition || 'ALL');
      setRules(initialData.rules || []);

      setMetaTitle(initialData.seo?.metaTitle || '');
      setMetaDescription(initialData.seo?.metaDescription || '');
      setKeywords(initialData.seo?.keywords || []);
      setCanonicalUrl(initialData.seo?.canonicalUrl || '');
      setOgImage(initialData.seo?.ogImage || '');

      setFacets(initialData.filterableAttributes || []);
    } else {
      setName('');
      setSlug('');
      setIsSlugManual(false);
      setDescription('');
      setParentId(initialParentId || 'root');
      setDisplayOrder(0);
      setStatus('ACTIVE');

      setIconUrl('');
      setThumbnailUrl('');
      setBannerDesktopUrl('');
      setBannerMobileUrl('');
      setImageAltText('');

      setIncludeInMenu(true);
      setIsFeatured(false);
      setBadgeText('');
      setBadgeColor('indigo');
      setBadgeExpiresAt('');

      setIsSmartCollection(false);
      setRulesCondition('ALL');
      setRules([]);

      setMetaTitle('');
      setMetaDescription('');
      setKeywords([]);
      setCanonicalUrl('');
      setOgImage('');

      setFacets([]);
    }
    setActiveTab('general');
    setErrorMsg(null);
  }, [isOpen, initialData, initialParentId]);

  // Auto-slug generation
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

  // Keyword tags handling
  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (tag: string) => {
    setKeywords(keywords.filter((k) => k !== tag));
  };

  // Facet tags handling
  const addFacet = (attr: string) => {
    const trimmed = attr.trim().toLowerCase().replace(/\s+/g, '_');
    if (trimmed && !facets.includes(trimmed)) {
      setFacets([...facets, trimmed]);
      setFacetInput('');
    }
  };

  const removeFacet = (attr: string) => {
    setFacets(facets.filter((f) => f !== attr));
  };

  const PRESET_FACETS = ['brand', 'color', 'size', 'ram', 'storage', 'screen_size', 'material', 'gender', 'weight'];

  // Cycle check: collect self and descendants to exclude from parent dropdown
  const disabledParentIds = React.useMemo(() => {
    if (!initialData) return new Set<string>();
    const blocked = new Set<string>([initialData._id]);
    for (const cat of allCategories) {
      if (cat.ancestors && cat.ancestors.some((a: { _id: string }) => a._id === initialData._id)) {
        blocked.add(cat._id);
      }
    }
    return blocked;
  }, [initialData, allCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required');
      setActiveTab('general');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: CreateCategoryPayload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        parentId: parentId === 'root' ? null : parentId,
        displayOrder: Number(displayOrder) || 0,
        status,
        iconUrl: iconUrl.trim() || null,
        thumbnailUrl: thumbnailUrl.trim() || null,
        bannerDesktopUrl: bannerDesktopUrl.trim() || null,
        bannerMobileUrl: bannerMobileUrl.trim() || null,
        imageAltText: imageAltText.trim() || undefined,
        includeInMenu,
        isFeatured,
        badge: badgeText.trim()
          ? { text: badgeText.trim().toUpperCase(), color: badgeColor }
          : null,
        badgeExpiresAt: badgeExpiresAt ? new Date(badgeExpiresAt).toISOString() : null,
        isSmartCollection,
        rulesCondition,
        rules: isSmartCollection ? rules : [],
        filterableAttributes: facets,
        seo: {
          metaTitle: metaTitle.trim() || name.trim(),
          metaDescription: metaDescription.trim() || description.trim() || '',
          keywords,
          canonicalUrl: canonicalUrl.trim() || '',
          ogImage: ogImage.trim() || thumbnailUrl.trim() || null,
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const badgeColorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={isEditing ? `Edit Category: ${initialData?.name}` : 'Create Catalog Category'}
      description="Define category taxonomy, multimedia assets, storefront badges, and faceted filter attributes."
      headerExtra={
        <Tabs<TabKey>
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'general', label: 'General', icon: <Layers /> },
            { key: 'media', label: 'Media & Assets', icon: <ImageIcon /> },
            { key: 'merchandising', label: 'Merchandising', icon: <Sparkles /> },
            { key: 'seo', label: 'SEO & Social', icon: <Search /> },
            { key: 'facets', label: 'Filter Facets', icon: <Filter />, count: facets.length },
          ]}
        />
      }
      onSubmit={handleSubmit}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {errorMsg && (
          <Alert tone="error" title="Validation Error">
            {errorMsg}
          </Alert>
        )}

        {/* ─── TAB 1: General & Taxonomy ────────────────────────────────────── */}
        {activeTab === 'general' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <InputField
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Laptops & Notebooks"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <InputField
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManual(true);
                  }}
                  placeholder="e.g. laptops-notebooks"
                />
                {isSlugManual && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setIsSlugManual(false);
                      handleNameChange(name);
                    }}
                  >
                    Reset Auto
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Storefront route: <code className="font-mono text-slate-600">/categories/{slug || '...'}</code>
              </p>
            </div>

            <div>
              <Dropdown
                label="Parent Category (Hierarchy Level)"
                value={parentId}
                onChange={(val) => setParentId(val || 'root')}
                searchable={allCategories.length > 4}
                placeholder="Select parent category..."
                helperText="Nesting a category automatically materializes ancestor breadcrumb trails."
                options={[
                  { value: 'root', label: 'None (Top-Level Root Department)' },
                  ...allCategories.map((c) => {
                    const isDisabled = disabledParentIds.has(c._id);
                    const indent = '— '.repeat(Math.max(0, c.level - 1));
                    return {
                      value: c._id,
                      label: `${indent}${c.name}${isDisabled ? ' (Current / Descendant)' : ''}`,
                      disabled: isDisabled,
                    };
                  }),
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Overview description displayed on top of the storefront category page..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Order
                </label>
                <InputField
                  type="number"
                  min={0}
                  value={String(displayOrder)}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div>
                <Dropdown<'ACTIVE' | 'INACTIVE'>
                  label="Catalog Status"
                  value={status}
                  onChange={(val) => setStatus((val as 'ACTIVE' | 'INACTIVE') || 'ACTIVE')}
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE (Visible in Storefront)' },
                    { value: 'INACTIVE', label: 'INACTIVE (Hidden / Draft)' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Media & Assets ────────────────────────────────────────── */}
        {activeTab === 'media' && (
          <div className="space-y-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Provide direct image URLs (CDN or Cloudinary). Real-time visual previews will confirm whether each image link resolves properly.
              </span>
            </div>

            {/* Thumbnail Upload Dropzone */}
            <div className="p-3 border border-slate-200 rounded-md bg-slate-50/50">
              <ImageUploadDropzone
                label="Thumbnail Image (Square 400x400)"
                helperText="Square image used on category lists and cards"
                aspectRatioHint="Recommended: 1:1 Square (400x400)"
                folder="categories"
                value={thumbnailUrl}
                onChange={(val) => setThumbnailUrl(val || '')}
              />
            </div>

            {/* Category Icon Upload Dropzone */}
            <div className="p-3 border border-slate-200 rounded-md bg-slate-50/50">
              <ImageUploadDropzone
                label="Category Icon (SVG or PNG 64x64)"
                helperText="Icon displayed in the mega-menu and sidebar tree"
                aspectRatioHint="Recommended: 64x64 SVG or PNG"
                folder="categories"
                value={iconUrl}
                onChange={(val) => setIconUrl(val || '')}
              />
            </div>

            {/* Desktop Hero Banner */}
            <div className="p-3 border border-slate-200 rounded-md bg-slate-50/50">
              <ImageUploadDropzone
                label="Desktop Hero Banner (1920x400 Landscape)"
                helperText="Wide hero banner displayed at the top of category landing pages"
                aspectRatioHint="Recommended: 1920x400 Widescreen"
                folder="categories"
                value={bannerDesktopUrl}
                onChange={(val) => setBannerDesktopUrl(val || '')}
              />
            </div>

            {/* Mobile Hero Banner */}
            <div className="p-3 border border-slate-200 rounded-md bg-slate-50/50">
              <ImageUploadDropzone
                label="Mobile Hero Banner (800x400)"
                helperText="Optimized banner for smartphones and compact screens"
                aspectRatioHint="Recommended: 800x400"
                folder="categories"
                value={bannerMobileUrl}
                onChange={(val) => setBannerMobileUrl(val || '')}
              />
            </div>

            {/* Alt text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Image Alt Text (Accessibility & SEO)
              </label>
              <InputField
                value={imageAltText}
                onChange={(e) => setImageAltText(e.target.value)}
                placeholder="e.g. Collection of high performance ultrabooks and laptops"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 3: Merchandising ────────────────────────────────────────── */}
        {activeTab === 'merchandising' && (
          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-md cursor-pointer hover:border-slate-300">
                <input
                  type="checkbox"
                  checked={includeInMenu}
                  onChange={(e) => setIncludeInMenu(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">
                    Show in Mega Navigation Menu
                  </span>
                  <span className="text-xs text-slate-500">
                    Category appears in the main navbar dropdown on the storefront.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-md cursor-pointer hover:border-slate-300">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">
                    Feature on Homepage Carousel
                  </span>
                  <span className="text-xs text-slate-500">
                    Highlighted in the homepage curated departments grid.
                  </span>
                </div>
              </label>
            </div>

            {/* Promotional Badge */}
            <div className="border border-slate-200 rounded-md p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Promotional Badge
                </span>
                {badgeText && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      badgeColorMap[badgeColor]
                    }`}
                  >
                    PREVIEW: {badgeText.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Badge Text (e.g. HOT, NEW, SALE)
                  </label>
                  <InputField
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. TRENDING"
                    maxLength={15}
                  />
                </div>

                <div>
                  <Dropdown<'indigo' | 'emerald' | 'amber' | 'rose'>
                    label="Badge Color Variant"
                    value={badgeColor}
                    onChange={(val) =>
                      setBadgeColor((val as 'indigo' | 'emerald' | 'amber' | 'rose') || 'indigo')
                    }
                    options={[
                      { value: 'indigo', label: 'Indigo (Default / Primary)' },
                      { value: 'emerald', label: 'Emerald (New / Fresh)' },
                      { value: 'amber', label: 'Amber (Hot / Trending)' },
                      { value: 'rose', label: 'Rose (Sale / Clearance)' },
                    ]}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-slate-600 mb-1">
                    Scheduled Badge Expiration (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={badgeExpiresAt}
                    onChange={(e) => setBadgeExpiresAt(e.target.value)}
                    className="w-full text-xs rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    The promotional badge will automatically deactivate on this date.
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Smart Collection & Rule Engine */}
            <div className="border border-slate-200 rounded-md p-4 bg-white space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSmartCollection}
                  onChange={(e) => setIsSmartCollection(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    Dynamic Smart Collection (Rules-Based)
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      SMART ENGINE
                    </span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Products matching the configured rules will automatically populate this category.
                  </span>
                </div>
              </label>

              {isSmartCollection && (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Matching Conditions
                    </span>
                    <div className="w-56">
                      <Dropdown<'ALL' | 'ANY'>
                        size="sm"
                        value={rulesCondition}
                        onChange={(val) => setRulesCondition((val as 'ALL' | 'ANY') || 'ALL')}
                        options={[
                          { value: 'ALL', label: 'Match ALL rules (AND)' },
                          { value: 'ANY', label: 'Match ANY rule (OR)' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Rules list */}
                  {rules.length === 0 ? (
                    <div className="p-3 rounded-md bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      No rules added yet. Click &quot;Add Rule Condition&quot; below to build dynamic criteria.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md"
                        >
                          <div className="w-36">
                            <Dropdown
                              size="sm"
                              value={rule.field}
                              onChange={(val) => {
                                const next = [...rules];
                                next[idx] = { ...next[idx], field: val || 'tags' };
                                setRules(next);
                              }}
                              options={[
                                { value: 'tags', label: 'Product Tags' },
                                { value: 'price', label: 'Price (USD)' },
                                { value: 'discountPercent', label: 'Discount %' },
                                { value: 'rating', label: 'Customer Rating' },
                                { value: 'inventoryQuantity', label: 'Stock Level' },
                                { value: 'brand', label: 'Brand Name' },
                              ]}
                            />
                          </div>

                          <div className="w-36">
                            <Dropdown
                              size="sm"
                              value={rule.operator}
                              onChange={(val) => {
                                const next = [...rules];
                                next[idx] = { ...next[idx], operator: val || 'equals' };
                                setRules(next);
                              }}
                              options={[
                                { value: 'equals', label: 'Equals' },
                                { value: 'contains', label: 'Contains' },
                                { value: 'greaterThan', label: 'Greater than (>)' },
                                { value: 'lessThan', label: 'Less than (<)' },
                                { value: 'in', label: 'In List' },
                              ]}
                            />
                          </div>

                          <div className="flex-1 min-w-[120px]">
                            <InputField
                              value={rule.value}
                              onChange={(e) => {
                                const next = [...rules];
                                next[idx] = { ...next[idx], value: e.target.value };
                                setRules(next);
                              }}
                              placeholder="Value..."
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setRules(rules.filter((_, rIdx) => rIdx !== idx));
                            }}
                            className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Remove rule"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setRules([
                        ...rules,
                        { field: 'tags', operator: 'contains', value: '' },
                      ]);
                    }}
                  >
                    Add Rule Condition
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: SEO & Social ─────────────────────────────────────────── */}
        {activeTab === 'seo' && (
          <div className="space-y-4 pt-2">
            {/* SERP Preview */}
            <div className="border border-slate-200 rounded-md p-4 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Google Search Result Preview
              </p>
              <div className="bg-white border border-slate-200 rounded-md p-3 space-y-1">
                <p className="text-xs text-emerald-700 font-medium">
                  https://zylo.com › categories › {slug || 'category'}
                </p>
                <h4 className="text-base font-semibold text-blue-800 hover:underline cursor-pointer truncate">
                  {metaTitle || name || 'Category Name'} | ZYLO Store
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {metaDescription ||
                    description ||
                    'Shop high quality products in this category at the best prices with fast delivery.'}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Meta Title
                </label>
                <span className="text-[11px] text-slate-400">
                  {metaTitle.length}/60 recommended
                </span>
              </div>
              <InputField
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. Buy Premium Laptops & Ultrabooks Online"
                maxLength={100}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Meta Description
                </label>
                <span className="text-[11px] text-slate-400">
                  {metaDescription.length}/160 recommended
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Compelling search snippet describing top deals and features..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 resize-none"
                maxLength={250}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Search Engine Keywords
              </label>
              <div className="flex items-center gap-2 mb-2">
                <InputField
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Type keyword and press Enter..."
                />
                <Button type="button" size="sm" variant="outline" onClick={addKeyword}>
                  Add
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-700"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Canonical URL Override
              </label>
              <InputField
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://zylo.com/categories/primary-slug"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 5: Filter Facets ────────────────────────────────────────── */}
        {activeTab === 'facets' && (
          <div className="space-y-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Filterable attributes dynamically empower the storefront sidebar filters for this category (e.g. Brand, RAM, Storage). Instead of creating hundreds of subcategories, use filter facets!
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Add Filter Attribute Key
              </label>
              <div className="flex items-center gap-2 mb-2">
                <InputField
                  value={facetInput}
                  onChange={(e) => setFacetInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFacet(facetInput);
                    }
                  }}
                  placeholder="e.g. processor_generation, battery_life"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addFacet(facetInput)}
                >
                  Add Facet
                </Button>
              </div>

              {/* Preset Chips */}
              <div className="mt-2">
                <p className="text-[11px] font-medium text-slate-500 mb-1.5">
                  Popular attribute suggestions (click to add):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_FACETS.map((chip) => {
                    const isAdded = facets.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => (isAdded ? removeFacet(chip) : addFacet(chip))}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          isAdded
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isAdded ? `✓ ${chip}` : `+ ${chip}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Facets List */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Active Filter Facets for Category ({facets.length})
                </p>
                {facets.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No attribute facets selected yet. Products will only be filtered by standard attributes (price, status).
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {facets.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700"
                      >
                        {f}
                        <button
                          type="button"
                          onClick={() => removeFacet(f)}
                          className="text-indigo-400 hover:text-indigo-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default CategoryFormDrawer;
