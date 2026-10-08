import React, { useState, useEffect } from 'react';
import {
  Layers,
  Image as ImageIcon,
  Sparkles,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  Check,
  Star,
} from 'lucide-react';
import Drawer from '@shared/ui/Drawer';
import Tabs from '@shared/ui/Tabs';
import Button from '@shared/ui/Button';
import InputField from '@shared/ui/InputField';
import Dropdown, { type DropdownOption } from '@shared/ui/Dropdown';
import Alert from '@shared/ui/Alert';
import TagInput from '@shared/ui/TagInput';
import SeoSnippetPreview from '@shared/ui/SeoSnippetPreview';
import ImageUploadDropzone from '@shared/ui/ImageUploadDropzone';
import type {
  BrandItem,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '@shared/types/brand';

export interface BrandFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateBrandPayload | UpdateBrandPayload) => Promise<void>;
  initialData?: BrandItem | null;
}

type TabKey = 'general' | 'media' | 'merchandising' | 'seo';

const COUNTRY_OPTIONS: DropdownOption<string>[] = [
  { value: 'United States', label: '🇺🇸 United States' },
  { value: 'Japan', label: '🇯🇵 Japan' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'Switzerland', label: '🇨🇭 Switzerland' },
  { value: 'South Korea', label: '🇰🇷 South Korea' },
  { value: 'Taiwan', label: '🇹🇼 Taiwan' },
  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'Denmark', label: '🇩🇰 Denmark' },
  { value: 'Sweden', label: '🇸🇪 Sweden' },
  { value: 'Italy', label: '🇮🇹 Italy' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands' },
  { value: 'Spain', label: '🇪🇸 Spain' },
  { value: 'China', label: '🇨🇳 China' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Finland', label: '🇫🇮 Finland' },
  { value: 'Austria', label: '🇦🇹 Austria' },
  { value: 'Other', label: '🌐 Other / Multinational' },
];

export const BrandFormDrawer: React.FC<BrandFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
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
  const [website, setWebsite] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');

  // Media
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Merchandising
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Reset or populate form
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setIsSlugManual(true);
      setDescription(initialData.description || '');
      setWebsite(initialData.website || '');
      setCountryOfOrigin(initialData.countryOfOrigin || '');
      setLogoUrl(initialData.logoUrl || '');
      setBannerUrl(initialData.bannerUrl || '');
      setStatus(initialData.status);
      setIsFeatured(initialData.isFeatured);
      setDisplayOrder(initialData.displayOrder ?? 0);
      setMetaTitle(initialData.seo?.metaTitle || '');
      setMetaDescription(initialData.seo?.metaDescription || '');
      setKeywords(initialData.seo?.keywords || []);
      setCanonicalUrl(initialData.seo?.canonicalUrl || '');
    } else {
      setName('');
      setSlug('');
      setIsSlugManual(false);
      setDescription('');
      setWebsite('');
      setCountryOfOrigin('');
      setLogoUrl('');
      setBannerUrl('');
      setStatus('ACTIVE');
      setIsFeatured(false);
      setDisplayOrder(0);
      setMetaTitle('');
      setMetaDescription('');
      setKeywords([]);
      setCanonicalUrl('');
    }
    setErrorMsg(null);
    setActiveTab('general');
  }, [initialData, isOpen]);

  // Handle name change and auto-generate slug
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Brand name is required');
      setActiveTab('general');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: CreateBrandPayload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        website: website.trim() || undefined,
        countryOfOrigin: countryOfOrigin || undefined,
        logoUrl: logoUrl.trim() || null,
        bannerUrl: bannerUrl.trim() || null,
        status,
        isFeatured,
        displayOrder: Number(displayOrder) || 0,
        seo: {
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          keywords,
          canonicalUrl: canonicalUrl.trim() || undefined,
          ogImage: bannerUrl.trim() || logoUrl.trim() || null,
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save brand';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Brand: ${initialData?.name}` : 'Create Brand Partner'}
      size="lg"
      headerExtra={
        <Tabs<TabKey>
          value={activeTab}
          onChange={setActiveTab}
          className="pb-0"
          items={[
            { key: 'general', label: 'General', icon: <Layers /> },
            { key: 'media', label: 'Media & Assets', icon: <ImageIcon /> },
            { key: 'merchandising', label: 'Merchandising', icon: <Sparkles /> },
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
            {isEditing ? 'Save Changes' : 'Create Brand'}
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

        {/* ─── TAB 1: General ─────────────────────────────────────────────────── */}
        {activeTab === 'general' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <InputField
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Sony, Apple, Nike"
                required
              />
            </div>

            {/* Slug configuration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Brand URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setIsSlugManual(!isSlugManual)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {isSlugManual ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock (Auto-generate)</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock manual edit</span>
                    </>
                  )}
                </button>
              </div>
              <InputField
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={!isSlugManual}
                placeholder="e.g. sony"
              />
              <p className="mt-1 text-xs text-slate-500">
                Storefront route:{' '}
                <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">
                  /brands/{slug || '...'}
                </code>
              </p>
            </div>

            {/* Country of Origin */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Country of Origin
              </label>
              <Dropdown
                value={countryOfOrigin}
                onChange={(val) => setCountryOfOrigin(val || '')}
                options={COUNTRY_OPTIONS}
                placeholder="Select country of origin..."
                searchable
                clearable
              />
              <p className="mt-1 text-xs text-slate-400">
                Primary corporate headquarters or brand founding origin
              </p>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Website
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.brand.com"
                  />
                </div>
                {website && (
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center px-3 py-1.5 border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
                    title="Open website in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand Story & Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full text-sm border border-slate-200 rounded-md p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-y text-slate-800"
                placeholder="Describe brand heritage, signature technologies, craftsmanship, and warranty commitments..."
              />
            </div>
          </div>
        )}

        {/* ─── TAB 2: Media & Assets ─────────────────────────────────────────── */}
        {activeTab === 'media' && (
          <div className="space-y-6 pt-2">
            {/* Brand Logo Upload Dropzone */}
            <div className="p-4 border border-slate-200 rounded-md bg-slate-50/50">
              <ImageUploadDropzone
                label="Brand Logo (Square / Transparent PNG / SVG)"
                helperText="Vector SVG or high-resolution PNG (minimum 200x200px)"
                aspectRatioHint="Recommended: 1:1 Square"
                folder="brands"
                value={logoUrl}
                onChange={(val) => setLogoUrl(val || '')}
              />
            </div>

            {/* Showcase Hero Banner Upload Dropzone */}
            <div className="p-4 border border-slate-200 rounded-md bg-slate-50/50">
              <ImageUploadDropzone
                label="Showcase Hero Banner (16:9 Landscape)"
                helperText="Used for the brand collection header and featured brand spotlights"
                aspectRatioHint="Recommended: 16:9 Widescreen Landscape (1920x1080)"
                folder="brands"
                value={bannerUrl}
                onChange={(val) => setBannerUrl(val || '')}
              />
            </div>
          </div>
        )}

        {/* ─── TAB 3: Merchandising ─────────────────────────────────────────── */}
        {activeTab === 'merchandising' && (
          <div className="space-y-4 pt-2">
            {/* Status Switch */}
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md bg-white">
              <div>
                <p className="text-sm font-semibold text-slate-900">Brand Status</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  When active, brand appears in storefront filter facets and directory listings.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={status === 'ACTIVE'}
                onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-none ring-0 transition duration-200 ease-in-out ${
                    status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Featured Spotlight Switch */}
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md bg-white">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-600 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Featured Partner Spotlight</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Highlight in storefront homepage brand carousels and top brand bars.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isFeatured}
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFeatured ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-none ring-0 transition duration-200 ease-in-out ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Display Order */}
            <div className="p-4 border border-slate-200 rounded-md bg-white">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Display Order Sort Rank
              </label>
              <InputField
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
              />
              <p className="mt-1 text-xs text-slate-500">
                Lower numerical values appear first in brand indexes and storefront carousels (e.g. 1, 2, 3).
              </p>
            </div>
          </div>
        )}

        {/* ─── TAB 4: SEO ───────────────────────────────────────────────────── */}
        {activeTab === 'seo' && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Meta Title
                </label>
                <span className="text-xs text-slate-400">{metaTitle.length}/60 characters</span>
              </div>
              <InputField
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={`${name || 'Brand'} Official Store | ZYLO`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Meta Description
                </label>
                <span className="text-xs text-slate-400">{metaDescription.length}/160 characters</span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-md p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-y text-slate-800"
                placeholder={`Discover authentic ${name || 'brand'} gear, warranty coverage, and fast worldwide delivery at ZYLO.`}
              />
            </div>

            {/* Keywords Tag Manager */}
            <TagInput
              label="Keywords & Search Tags"
              tags={keywords}
              onChange={setKeywords}
              placeholder="Type keyword and press Enter..."
              helperText="Press Enter or click Add to append search tags."
            />

            {/* Canonical URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Canonical URL Override
              </label>
              <InputField
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder={`https://zylo.com/brands/${slug || 'brand'}`}
              />
            </div>

            {/* Google Search Live Preview */}
            <SeoSnippetPreview
              title={metaTitle || `${name || 'Brand Name'} Products & Official Store | ZYLO`}
              description={
                metaDescription ||
                description ||
                `Explore premier products from ${name || 'this brand'} with express shipping and genuine manufacturer warranties at ZYLO.`
              }
              slug={slug}
              modulePath="brands"
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default BrandFormDrawer;
