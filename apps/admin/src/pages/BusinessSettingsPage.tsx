import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  DollarSign,
  Phone,
  Share2,
  Sliders,
  Save,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Mail,
  MessageCircle,
  Clock,
  Search,
  AlertTriangle,
  Inbox,
  Calendar,
  CheckCheck,
  Tag,
  CreditCard,
  Eye,
  EyeOff,
  Key,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import InputField from '@shared/ui/InputField';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { settingsService } from '@shared/api/settings.service';
import { paymentsService } from '@shared/api/payments.service';
import type {
  ContactInquiryItem,
  UpdateBusinessSettingsPayload,
} from '@shared/types/settings';
import { POPULAR_CURRENCIES, formatPrice } from '@shared/utils/currency';

type TabId =
  | 'currency'
  | 'branding'
  | 'contact'
  | 'social'
  | 'policies'
  | 'payments'
  | 'inquiries';

export const BusinessSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('currency');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UpdateBusinessSettingsPayload>({
    storeName: 'ZYLO Commerce',
    tagline: 'Mega Store & Supermarket',
    companyLegalName: 'Zylo Global Retail Inc.',
    announcementBarText: 'Free shipping for all orders over ₹500.00',
    currencyCode: 'INR',
    currencySymbol: '₹',
    currencyPlacement: 'prefix',
    decimalPlaces: 2,
    taxRate: 8,
    freeShippingThreshold: 50,
    defaultShippingFee: 10,
    expressShippingFee: 25,
    supportEmail: 'support@zylo.com',
    salesEmail: 'sales@zylo.com',
    phone: '+1 800 900 2956',
    whatsapp: '+1 800 900 2956',
    address: '5171 W Campbell Ave, San Jose, CA 95124, United States',
    city: 'San Jose',
    state: 'CA',
    postalCode: '95124',
    country: 'United States',
    operatingHours: 'Mon - Fri: 9:00 AM - 8:00 PM EST',
    googleMapsUrl: '',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
    orderNumberPrefix: 'ZYLO-',
    enableCod: true,
    enableMaintenanceMode: false,
    defaultOnlineProvider: 'stripe',
    stripeEnabled: true,
    stripeMode: 'test',
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    razorpayEnabled: false,
    razorpayMode: 'test',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayWebhookSecret: '',
    paypalEnabled: false,
    paypalMode: 'sandbox',
    paypalClientId: '',
    paypalClientSecret: '',
  });

  // Secret toggles & Test Connection State
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [isTestingProvider, setIsTestingProvider] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'ALL' | 'NEW' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  // Load Settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getAdminSettings();
      setFormData({
        storeName: data.storeName || '',
        tagline: data.tagline || '',
        companyLegalName: data.companyLegalName || '',
        announcementBarText: data.announcementBarText || '',
        currencyCode: data.currencyCode || 'INR',
        currencySymbol: data.currencySymbol || '₹',
        currencyPlacement: data.currencyPlacement || 'prefix',
        decimalPlaces: data.decimalPlaces ?? 2,
        taxRate: data.taxRate ?? 8,
        freeShippingThreshold: data.freeShippingThreshold ?? 50,
        defaultShippingFee: data.defaultShippingFee ?? 10,
        expressShippingFee: data.expressShippingFee ?? 25,
        supportEmail: data.supportEmail || '',
        salesEmail: data.salesEmail || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country || '',
        operatingHours: data.operatingHours || '',
        googleMapsUrl: data.googleMapsUrl || '',
        facebook: data.facebook || '',
        twitter: data.twitter || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        youtube: data.youtube || '',
        orderNumberPrefix: data.orderNumberPrefix || 'ZYLO-',
        enableCod: data.enableCod ?? true,
        enableMaintenanceMode: data.enableMaintenanceMode ?? false,
        defaultOnlineProvider: data.defaultOnlineProvider || 'stripe',
        stripeEnabled: data.stripeEnabled ?? true,
        stripeMode: data.stripeMode || 'test',
        stripePublishableKey: data.stripePublishableKey || '',
        stripeSecretKey: data.stripeSecretKey || '',
        stripeWebhookSecret: data.stripeWebhookSecret || '',
        razorpayEnabled: data.razorpayEnabled ?? false,
        razorpayMode: data.razorpayMode || 'test',
        razorpayKeyId: data.razorpayKeyId || '',
        razorpayKeySecret: data.razorpayKeySecret || '',
        razorpayWebhookSecret: data.razorpayWebhookSecret || '',
        paypalEnabled: data.paypalEnabled ?? false,
        paypalMode: data.paypalMode || 'sandbox',
        paypalClientId: data.paypalClientId || '',
        paypalClientSecret: data.paypalClientSecret || '',
      });
    } catch {
      toast.error('Failed to load store settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Customer Inquiries
  const fetchInquiries = async () => {
    try {
      setIsLoadingInquiries(true);
      const res = await settingsService.getInquiriesAdmin(1, 50);
      setInquiries(res.inquiries || []);
    } catch {
      toast.error('Failed to load customer contact inquiries');
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const handleChange = (field: keyof UpdateBusinessSettingsPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Preset Currency Selection
  const handleSelectCurrencyPreset = (code: string) => {
    const found = POPULAR_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        currencyCode: found.code,
        currencySymbol: found.symbol,
        currencyPlacement: found.placement,
        decimalPlaces: found.code === 'JPY' ? 0 : 2,
      }));
    }
  };

  // Save Settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const res = await settingsService.updateAdminSettings(formData);
      toast.success(res.message || 'Business settings updated successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Test Payment Provider Connection
  const handleTestProvider = async (provider: 'stripe' | 'razorpay' | 'paypal') => {
    try {
      setIsTestingProvider(provider);
      const res = await paymentsService.testProviderConnection({
        provider,
        secretKey: provider === 'stripe' ? formData.stripeSecretKey : undefined,
        publishableKey: provider === 'stripe' ? formData.stripePublishableKey : undefined,
      });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to test ${provider} connection`);
    } finally {
      setIsTestingProvider(null);
    }
  };

  // Quick fill Stripe Demo Sandbox Keys
  const handleAutofillStripeTestKeys = () => {
    setFormData((prev) => ({
      ...prev,
      stripePublishableKey: 'pk_test_51MockZyloStripePublishableKeySandbox2026',
      stripeSecretKey: 'sk_test_51MockZyloStripeSecretKeySandbox2026',
      stripeWebhookSecret: 'whsec_MockZyloWebhookSecretSigningKey2026',
      stripeMode: 'test',
      stripeEnabled: true,
    }));
    toast.success('Populated Stripe sandbox developer credentials');
  };

  // Copy Webhook URL
  const handleCopyWebhookUrl = () => {
    const origin = window.location.origin.replace(':5174', ':5000').replace(':5173', ':5000');
    const webhookUrl = `${origin}/api/payments/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    toast.success('Webhook endpoint URL copied to clipboard');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      await settingsService.updateInquiryStatusAdmin(id, status);
      toast.success(`Inquiry marked as ${status}`);
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item)),
      );
    } catch {
      toast.error('Failed to update inquiry status');
    }
  };

  // Inquiry KPIs
  const inquiryCounts = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter((i) => i.status === 'NEW').length,
      inProgress: inquiries.filter((i) => i.status === 'IN_PROGRESS').length,
      resolved: inquiries.filter((i) => i.status === 'RESOLVED').length,
    };
  }, [inquiries]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (inquiryStatusFilter !== 'ALL' && inq.status !== inquiryStatusFilter) {
        return false;
      }
      if (inquirySearch.trim()) {
        const query = inquirySearch.toLowerCase();
        const matchesName = inq.name.toLowerCase().includes(query);
        const matchesEmail = inq.email.toLowerCase().includes(query);
        const matchesSubject = inq.subject.toLowerCase().includes(query);
        const matchesMessage = inq.message.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesSubject || matchesMessage;
      }
      return true;
    });
  }, [inquiries, inquiryStatusFilter, inquirySearch]);

  if (isLoading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-md w-1/3" />
        <div className="h-64 bg-slate-100 rounded-md border border-slate-200" />
      </div>
    );
  }

  const samplePrice = 1499.99;
  const pricePreview = formatPrice(samplePrice, {
    currencySymbol: formData.currencySymbol,
    currencyPlacement: formData.currencyPlacement,
    decimalPlaces: formData.decimalPlaces,
  });

  return (
    <div className="w-full space-y-4">
      {/* 1. Standard Page Header matching other admin tabs */}
      <PageHeader
        title="Store & Business Settings"
        description="Configure multi-currency localization, brand identity, support contact details, and customer policies."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Reload
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSave()}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        }
      />

      {/* 2. Light Meta Status Strip with Color Texts */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-2.5 flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Status:</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Live Synced
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Currency:</span>
          <span className="font-mono font-bold text-amber-600">
            {formData.currencyCode} ({formData.currencySymbol})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Tax:</span>
          <span className="font-bold text-sky-600">{formData.taxRate}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Free Shipping Min:</span>
          <span className="font-bold text-emerald-600">{formData.currencySymbol}{formData.freeShippingThreshold}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Helpline:</span>
          <span className="font-semibold text-slate-800">{formData.phone}</span>
        </div>
        {inquiryCounts.new > 0 && (
          <div className="ml-auto flex items-center gap-1.5 font-bold text-rose-600">
            <span className="w-2 h-2 rounded-md bg-rose-500" />
            <span>{inquiryCounts.new} Unread Inquiries</span>
          </div>
        )}
      </div>

      {/* 3. Tab Navigation: Clean Border-b with Color Texts */}
      <div className="bg-white border border-slate-200 rounded-md px-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'currency', label: 'Currency & Localization', icon: DollarSign, activeColor: 'text-emerald-600 border-emerald-600' },
            { id: 'branding', label: 'Store Identity & Branding', icon: Building2, activeColor: 'text-indigo-600 border-indigo-600' },
            { id: 'contact', label: 'Contact Us & Support', icon: Phone, activeColor: 'text-sky-600 border-sky-600' },
            { id: 'social', label: 'Social Networks', icon: Share2, activeColor: 'text-pink-600 border-pink-600' },
            { id: 'policies', label: 'Orders & Policies', icon: Sliders, activeColor: 'text-amber-600 border-amber-600' },
            { id: 'payments', label: 'Payment Providers', icon: CreditCard, activeColor: 'text-indigo-600 border-indigo-600' },
            { id: 'inquiries', label: `Customer Inquiries (${inquiries.length})`, icon: MessageSquare, activeColor: 'text-violet-600 border-violet-600', badge: inquiryCounts.new },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as TabId)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs border-b-2 transition-colors cursor-pointer select-none ${
                  isActive
                    ? `${t.activeColor} font-bold`
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge ? (
                  <span className="ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* TAB 1: CURRENCY & LOCALIZATION */}
        {activeTab === 'currency' && (
          <div className="space-y-4">
            {/* Live Storefront Showcase Banner */}
            <div className="p-4 rounded-md bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-md bg-slate-50 border border-slate-200 text-amber-600 flex items-center justify-center font-bold text-xl">
                  {formData.currencySymbol}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Customer Storefront Price Preview
                  </span>
                  <div className="text-xs text-slate-600">
                    Product prices render as:{' '}
                    <span className="font-bold text-base text-emerald-600 font-mono ml-1">
                      {pricePreview}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[11px]">Calculated Output</span>
                  <span className="font-bold text-slate-800">
                    {formData.currencyPlacement === 'prefix' ? `${formData.currencySymbol} 100` : `100 ${formData.currencySymbol}`}
                  </span>
                </div>
                <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[11px]">Precision</span>
                  <span className="font-bold text-slate-800">{formData.decimalPlaces} Decimals</span>
                </div>
              </div>
            </div>

            {/* Popular Currency Presets Grid */}
            <div className="bg-white p-5 rounded-md border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Popular Currency Presets</h3>
                  <p className="text-[11px] text-slate-400">Click any preset to automatically populate currency code, symbol, and decimals</p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600">
                  Select to Apply
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {POPULAR_CURRENCIES.map((c) => {
                  const isSelected = formData.currencyCode === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCurrencyPreset(c.code)}
                      className={`p-3 rounded-md border text-center transition-colors cursor-pointer relative ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-md bg-amber-500" />
                      )}
                      <span className={`text-xl font-bold block mb-0.5 ${isSelected ? 'text-amber-600' : 'text-slate-700'}`}>{c.symbol}</span>
                      <span className="text-xs font-bold text-slate-800 block font-mono">{c.code}</span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning & Financial Parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Currency Configuration */}
              <div className="bg-white p-5 rounded-md border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>Currency Format Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InputField
                    label="Currency Code (ISO)"
                    value={formData.currencyCode}
                    onChange={(e) => handleChange('currencyCode', e.target.value.toUpperCase())}
                    placeholder="INR or USD"
                    fieldSize="sm"
                    className="font-mono font-bold"
                  />

                  <InputField
                    label="Currency Symbol"
                    value={formData.currencySymbol}
                    onChange={(e) => handleChange('currencySymbol', e.target.value)}
                    placeholder="₹ or $"
                    fieldSize="sm"
                    className="font-bold"
                  />

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-zinc-800">
                      Placement
                    </label>
                    <select
                      value={formData.currencyPlacement}
                      onChange={(e) => handleChange('currencyPlacement', e.target.value as any)}
                      className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-900 outline-none transition-colors hover:border-zinc-300 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 cursor-pointer"
                    >
                      <option value="prefix">Prefix (₹100)</option>
                      <option value="suffix">Suffix (100 ₹)</option>
                    </select>
                  </div>
                </div>

                <InputField
                  label="Decimal Precision"
                  type="number"
                  min="0"
                  max="4"
                  value={formData.decimalPlaces}
                  onChange={(e) => handleChange('decimalPlaces', Number(e.target.value))}
                  helperText="Recommended: 2 for INR (₹), USD ($), EUR (€); 0 for JPY (¥)."
                  fieldSize="sm"
                />
              </div>

              {/* Shipping & Tax Financial Rules */}
              <div className="bg-white p-5 rounded-md border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Tax & Shipping Thresholds</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InputField
                    label="Tax / GST (%)"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                    fieldSize="sm"
                    className="font-bold"
                  />

                  <InputField
                    label="Free Shipping Above"
                    type="number"
                    min="0"
                    value={formData.freeShippingThreshold}
                    onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                    fieldSize="sm"
                    className="font-bold"
                  />

                  <InputField
                    label="Standard Shipping"
                    type="number"
                    min="0"
                    value={formData.defaultShippingFee}
                    onChange={(e) => handleChange('defaultShippingFee', Number(e.target.value))}
                    fieldSize="sm"
                    className="font-bold"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md text-xs text-slate-600 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Storefront Free Shipping Progress Goal:</span>
                  <strong className="text-emerald-600 font-mono">
                    {formData.currencySymbol}{formData.freeShippingThreshold}.00
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORE IDENTITY & BRANDING */}
        {activeTab === 'branding' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-md border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Store Identity & Public Presence</span>
              </div>

              {/* Announcement Bar Live Preview */}
              <div className="p-3.5 rounded-md bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-md bg-emerald-500" />
                  <span className="text-slate-500 font-medium">Storefront TopBar Preview:</span>
                  <span className="font-semibold text-indigo-600">
                    {formData.announcementBarText || 'Free shipping for all orders!'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Live Preview</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Store Brand Name"
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="e.g. ZYLO Commerce"
                  fieldSize="sm"
                  className="font-bold"
                />

                <InputField
                  label="Store Tagline"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="e.g. Mega Store & Supermarket"
                  fieldSize="sm"
                />

                <InputField
                  label="Company Legal Entity Name (For Invoices & Receipts)"
                  value={formData.companyLegalName}
                  onChange={(e) => handleChange('companyLegalName', e.target.value)}
                  placeholder="e.g. Zylo Global Retail Inc."
                  fieldSize="sm"
                />

                <InputField
                  label="Top Announcement Bar Text"
                  value={formData.announcementBarText}
                  onChange={(e) => handleChange('announcementBarText', e.target.value)}
                  placeholder="e.g. Free shipping for all orders over ₹500.00"
                  fieldSize="sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT US & SUPPORT */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-md border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sky-700 font-bold text-xs uppercase tracking-wider">
                <Phone className="w-4 h-4 text-sky-600" />
                <span>Customer Helpdesk Channels</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-sky-700 uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" /> Support Email
                  </span>
                  <InputField
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    fieldSize="sm"
                  />
                </div>

                <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" /> Sales Email
                  </span>
                  <InputField
                    type="email"
                    value={formData.salesEmail}
                    onChange={(e) => handleChange('salesEmail', e.target.value)}
                    fieldSize="sm"
                  />
                </div>

                <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Helpline Phone
                  </span>
                  <InputField
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    fieldSize="sm"
                  />
                </div>

                <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Hotline
                  </span>
                  <InputField
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    fieldSize="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="md:col-span-2">
                  <InputField
                    label="Operating Hours (Shown on Storefront & Contact Us Page)"
                    value={formData.operatingHours}
                    onChange={(e) => handleChange('operatingHours', e.target.value)}
                    placeholder="e.g. Mon - Fri: 9:00 AM - 8:00 PM EST"
                    fieldSize="sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="Physical Store Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="e.g. 5171 W Campbell Ave, San Jose, CA 95124"
                    fieldSize="sm"
                  />
                </div>

                <InputField
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. San Jose"
                  fieldSize="sm"
                />

                <InputField
                  label="State / Province"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="e.g. CA"
                  fieldSize="sm"
                />

                <InputField
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="e.g. 95124"
                  fieldSize="sm"
                />

                <InputField
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="e.g. United States"
                  fieldSize="sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL NETWORKS */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-md border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-pink-700 font-bold text-xs uppercase tracking-wider">
                <Share2 className="w-4 h-4 text-pink-600" />
                <span>Store Social Profiles & Public Links</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-md border border-slate-200 bg-white space-y-1.5">
                  <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                    Facebook Profile
                  </span>
                  <InputField
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => handleChange('facebook', e.target.value)}
                    fieldSize="sm"
                  />
                </div>

                <div className="p-3.5 rounded-md border border-slate-200 bg-white space-y-1.5">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    Twitter / X Handle
                  </span>
                  <InputField
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => handleChange('twitter', e.target.value)}
                    fieldSize="sm"
                  />
                </div>

                <div className="p-3.5 rounded-md border border-slate-200 bg-white space-y-1.5">
                  <span className="text-xs font-semibold text-pink-600 flex items-center gap-1.5">
                    Instagram Page
                  </span>
                  <InputField
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                    fieldSize="sm"
                  />
                </div>

                <div className="p-3.5 rounded-md border border-slate-200 bg-white space-y-1.5">
                  <span className="text-xs font-semibold text-sky-600 flex items-center gap-1.5">
                    LinkedIn Company
                  </span>
                  <InputField
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleChange('linkedin', e.target.value)}
                    fieldSize="sm"
                  />
                </div>

                <div className="p-3.5 rounded-md border border-slate-200 bg-white md:col-span-2 space-y-1.5">
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                    YouTube Channel
                  </span>
                  <InputField
                    type="url"
                    value={formData.youtube}
                    onChange={(e) => handleChange('youtube', e.target.value)}
                    fieldSize="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS & POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-md border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-amber-700 font-bold text-xs uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Order Processing Policies & Fulfillment Flags</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField
                    label="Order Tracking Number Prefix"
                    value={formData.orderNumberPrefix}
                    onChange={(e) => handleChange('orderNumberPrefix', e.target.value)}
                    helperText={`Example: ${formData.orderNumberPrefix}104829`}
                    fieldSize="sm"
                    className="font-mono font-bold"
                  />
                </div>

                <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-emerald-600">Allow customers to pay upon receiving package</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enableCod}
                    onChange={(e) => handleChange('enableCod', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md cursor-pointer border-slate-300"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Store Maintenance Mode</span>
                  </div>
                  <span className="text-[11px] text-rose-600">Display maintenance banner and temporarily suspend customer checkout</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableMaintenanceMode}
                  onChange={(e) => handleChange('enableMaintenanceMode', e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-md cursor-pointer border-slate-300"
                />
              </div>

              {/* Stripe Payment Gateway Overview */}
              <div className="p-4 rounded-md border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Payment Gateway Credentials</span>
                    <span className="text-[11px] text-slate-500 block">Manage Stripe, Razorpay, and PayPal API keys in the dedicated tab</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Configure Payment Gateways
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MULTI-PAYMENT PROVIDERS & GATEWAY CONFIGURATION */}
        {activeTab === 'payments' && (
          <div className="space-y-5">
            {/* Overview & Live Sync Banner */}
            <div className="p-5 rounded-md bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white shrink-0">
                  <CreditCard className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-wide">Multi-Payment Gateway Providers</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live In-Memory Database Synced
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Configure online payment credentials directly through the UI. No server restart or .env edits required.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutofillStripeTestKeys}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-300" />}
                >
                  Fill Sandbox Demo Keys
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave()}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Credentials
                </Button>
              </div>
            </div>

            {/* Default Online Provider Selection */}
            <div className="bg-white p-5 rounded-md border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Default Checkout Gateway</span>
                  <span className="text-[11px] text-slate-500">
                    Primary gateway used for customer credit/debit card and online payments at checkout.
                  </span>
                </div>
                <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                  Active: {(formData.defaultOnlineProvider || 'stripe').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Stripe Option */}
                <label
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    formData.defaultOnlineProvider === 'stripe'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultOnlineProvider"
                    value="stripe"
                    checked={formData.defaultOnlineProvider === 'stripe'}
                    onChange={() => handleChange('defaultOnlineProvider', 'stripe')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>Stripe</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-100 text-indigo-700 font-bold">
                        Primary
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Global cards, Apple Pay, Google Pay & 3D Secure
                    </p>
                  </div>
                </label>

                {/* Razorpay Option */}
                <label
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    formData.defaultOnlineProvider === 'razorpay'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultOnlineProvider"
                    value="razorpay"
                    checked={formData.defaultOnlineProvider === 'razorpay'}
                    onChange={() => handleChange('defaultOnlineProvider', 'razorpay')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>Razorpay</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 font-bold">
                        Multi-Provider
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      UPI, Net Banking, Indian cards & domestic wallets
                    </p>
                  </div>
                </label>

                {/* PayPal Option */}
                <label
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    formData.defaultOnlineProvider === 'paypal'
                      ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultOnlineProvider"
                    value="paypal"
                    checked={formData.defaultOnlineProvider === 'paypal'}
                    onChange={() => handleChange('defaultOnlineProvider', 'paypal')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>PayPal</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-700 font-bold">
                        Multi-Provider
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      PayPal Wallet, Pay in 4, & international buyer network
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* PROVIDER 1: STRIPE CONFIGURATION */}
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-none">
              {/* Stripe Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Stripe Payment Gateway</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          formData.stripeMode === 'live'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {formData.stripeMode === 'live' ? 'Live Production' : 'Test Sandbox'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Credit / Debit Cards, Apple Pay, Google Pay & 256-bit automated encryption
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://dashboard.stripe.com/test/apikeys"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <span>Stripe Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <span>Enable Provider</span>
                    <input
                      type="checkbox"
                      checked={formData.stripeEnabled}
                      onChange={(e) => handleChange('stripeEnabled', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer border-slate-300"
                    />
                  </label>
                </div>
              </div>

              {/* Stripe Body Form */}
              <div className="p-5 space-y-4">
                {/* Environment Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Stripe Environment Mode
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="stripeMode"
                        value="test"
                        checked={formData.stripeMode === 'test'}
                        onChange={() => handleChange('stripeMode', 'test')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Test / Sandbox Mode (Safe for local testing)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer ml-4">
                      <input
                        type="radio"
                        name="stripeMode"
                        value="live"
                        checked={formData.stripeMode === 'live'}
                        onChange={() => handleChange('stripeMode', 'live')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-rose-700 font-semibold">Live Production Mode</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Publishable Key */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stripe Publishable Key
                    </label>
                    <InputField
                      type="text"
                      value={formData.stripePublishableKey || ''}
                      onChange={(e) => handleChange('stripePublishableKey', e.target.value)}
                      placeholder="pk_test_..."
                      helperText="Public client key safely distributed to the customer storefront"
                      fieldSize="sm"
                      className="font-mono"
                    />
                  </div>

                  {/* Secret Key with Show/Hide */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Stripe Secret Key *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowStripeSecret(!showStripeSecret)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showStripeSecret ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Show
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showStripeSecret ? 'text' : 'password'}
                        value={formData.stripeSecretKey || ''}
                        onChange={(e) => handleChange('stripeSecretKey', e.target.value)}
                        placeholder="sk_test_..."
                        className="w-full text-xs py-2 px-3 pr-9 border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Key className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Confidential server secret key used to initialize charges and capture payments
                    </span>
                  </div>
                </div>

                {/* Webhook Signing Secret */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Stripe Webhook Signing Secret (Optional for local test)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {showStripeWebhook ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showStripeWebhook ? 'text' : 'password'}
                      value={formData.stripeWebhookSecret || ''}
                      onChange={(e) => handleChange('stripeWebhookSecret', e.target.value)}
                      placeholder="whsec_..."
                      className="w-full text-xs py-2 px-3 pr-9 border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Webhook URL Helper */}
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 block">Stripe Dashboard Webhook Endpoint</span>
                    <span className="text-[11px] text-slate-500">
                      Listen for <code className="text-indigo-600 font-mono">payment_intent.succeeded</code> and <code className="text-indigo-600 font-mono">payment_intent.payment_failed</code>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="py-1.5 px-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    {copiedWebhook ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Webhook URL</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Connection Button */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Verify that your credentials can connect to Stripe before saving.
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isTestingProvider === 'stripe'}
                    isLoading={isTestingProvider === 'stripe'}
                    onClick={() => handleTestProvider('stripe')}
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Test Stripe Connection
                  </Button>
                </div>
              </div>
            </div>

            {/* PROVIDER 2: RAZORPAY CONFIGURATION (MULTI-PROVIDER READY) */}
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-none">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    R
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Razorpay Payment Gateway</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Multi-Provider Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      UPI, Google Pay, Paytm, Net Banking & Indian Domestic Cards
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <span>Enable Provider</span>
                  <input
                    type="checkbox"
                    checked={formData.razorpayEnabled}
                    onChange={(e) => handleChange('razorpayEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300"
                  />
                </label>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Razorpay Key ID
                    </label>
                    <InputField
                      type="text"
                      value={formData.razorpayKeyId || ''}
                      onChange={(e) => handleChange('razorpayKeyId', e.target.value)}
                      placeholder="rzp_test_..."
                      fieldSize="sm"
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Razorpay Key Secret
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showRazorpaySecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type={showRazorpaySecret ? 'text' : 'password'}
                      value={formData.razorpayKeySecret || ''}
                      onChange={(e) => handleChange('razorpayKeySecret', e.target.value)}
                      placeholder="Key Secret..."
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isTestingProvider === 'razorpay'}
                    isLoading={isTestingProvider === 'razorpay'}
                    onClick={() => handleTestProvider('razorpay')}
                  >
                    Test Razorpay Connection
                  </Button>
                </div>
              </div>
            </div>

            {/* PROVIDER 3: PAYPAL CONFIGURATION (MULTI-PROVIDER READY) */}
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-none">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-amber-500 text-white flex items-center justify-center font-black text-sm">
                    P
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">PayPal Gateway</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Multi-Provider Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      PayPal Wallet, Pay in 4, Venmo & Global checkout
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <span>Enable Provider</span>
                  <input
                    type="checkbox"
                    checked={formData.paypalEnabled}
                    onChange={(e) => handleChange('paypalEnabled', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer border-slate-300"
                  />
                </label>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PayPal Client ID
                    </label>
                    <InputField
                      type="text"
                      value={formData.paypalClientId || ''}
                      onChange={(e) => handleChange('paypalClientId', e.target.value)}
                      placeholder="Client ID..."
                      fieldSize="sm"
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        PayPal Secret
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showPaypalSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type={showPaypalSecret ? 'text' : 'password'}
                      value={formData.paypalClientSecret || ''}
                      onChange={(e) => handleChange('paypalClientSecret', e.target.value)}
                      placeholder="Secret..."
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isTestingProvider === 'paypal'}
                    isLoading={isTestingProvider === 'paypal'}
                    onClick={() => handleTestProvider('paypal')}
                  >
                    Test PayPal Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMER INQUIRIES (FULL WIDTH & COLORFUL) */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {/* 4 Clean Metric Cards with Colored Text */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-md bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Inquiries</span>
                  <span className="text-xl font-bold text-indigo-600 mt-0.5 block">{inquiryCounts.total}</span>
                </div>
                <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">New / Unread</span>
                  <span className="text-xl font-bold text-rose-600 mt-0.5 block">{inquiryCounts.new}</span>
                </div>
                <div className="w-9 h-9 rounded-md bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">In Progress</span>
                  <span className="text-xl font-bold text-amber-600 mt-0.5 block">{inquiryCounts.inProgress}</span>
                </div>
                <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Resolved</span>
                  <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{inquiryCounts.resolved}</span>
                </div>
                <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3 rounded-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search inquiries by customer name, email, or message..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setInquiryStatusFilter(status)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                      inquiryStatusFilter === status
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'ALL' ? 'All Messages' : status.replace('_', ' ')}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={fetchInquiries}
                  className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer ml-1"
                  title="Refresh inquiries"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Inquiries Cards List */}
            {isLoadingInquiries ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-slate-100 rounded-md border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="bg-white rounded-md border border-slate-200 p-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                  <Inbox className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">No Inquiries Found</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {inquirySearch
                    ? `No messages matched your search "${inquirySearch}". Try clearing filters.`
                    : 'Customer inquiries submitted via the Contact Us storefront page will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => {
                  const initials = inq.name
                    ? inq.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'CU';

                  const statusConfig = {
                    NEW: {
                      badge: 'text-rose-700 bg-rose-50 border-rose-200',
                      bar: 'border-l-rose-500',
                      label: 'NEW UNREAD',
                    },
                    IN_PROGRESS: {
                      badge: 'text-amber-700 bg-amber-50 border-amber-200',
                      bar: 'border-l-amber-500',
                      label: 'IN PROGRESS',
                    },
                    RESOLVED: {
                      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                      bar: 'border-l-emerald-500',
                      label: 'RESOLVED',
                    },
                  }[inq.status] || {
                    badge: 'text-slate-700 bg-slate-50 border-slate-200',
                    bar: 'border-l-slate-400',
                    label: inq.status,
                  };

                  return (
                    <div
                      key={inq._id}
                      className={`bg-white rounded-md border border-slate-200 p-4 space-y-3 border-l-4 ${statusConfig.bar}`}
                    >
                      {/* Customer Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">{inq.name}</span>
                              <a
                                href={`mailto:${inq.email}`}
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                <Mail className="w-3 h-3" />
                                <span>{inq.email}</span>
                              </a>
                              {inq.phone && (
                                <a
                                  href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-medium hover:bg-emerald-100 transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>{inq.phone}</span>
                                </a>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Received on {new Date(inq.createdAt).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
                            </span>
                          </div>
                        </div>

                        {/* Status Switcher */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                          <select
                            value={inq.status}
                            onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value as any)}
                            className="text-xs px-2 py-1 rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none cursor-pointer"
                          >
                            <option value="NEW">Mark: NEW</option>
                            <option value="IN_PROGRESS">Mark: IN PROGRESS</option>
                            <option value="RESOLVED">Mark: RESOLVED</option>
                          </select>
                        </div>
                      </div>

                      {/* Subject Banner */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                          Subject: {inq.subject}
                        </span>
                      </div>

                      {/* Message Content Bubble */}
                      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-800 font-normal leading-relaxed whitespace-pre-line">
                        {inq.message}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold border border-indigo-200 transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reply via Email</span>
                          </a>
                          {inq.phone && (
                            <a
                              href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Chat</span>
                            </a>
                          )}
                        </div>

                        {inq.status !== 'RESOLVED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateInquiryStatus(inq._id, 'RESOLVED')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark as Resolved</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Global Save Button at bottom of form */}
        {activeTab !== 'inquiries' && (
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving Settings...' : 'Save All Business Settings'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BusinessSettingsPage;
