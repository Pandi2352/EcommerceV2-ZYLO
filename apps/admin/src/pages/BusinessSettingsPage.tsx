import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { settingsService } from '@shared/api/settings.service';
import type {
  ContactInquiryItem,
  UpdateBusinessSettingsPayload,
} from '@shared/types/settings';
import { POPULAR_CURRENCIES, formatPrice } from '@shared/utils/currency';

type TabId = 'currency' | 'branding' | 'contact' | 'social' | 'policies' | 'inquiries';

export const BusinessSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('currency');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UpdateBusinessSettingsPayload>({
    storeName: 'ZYLO Commerce',
    tagline: 'Mega Store & Supermarket',
    companyLegalName: 'Zylo Global Retail Inc.',
    announcementBarText: 'Free shipping for all orders over $50.00',
    currencyCode: 'USD',
    currencySymbol: '$',
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
  });

  // Customer Inquiries
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

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
        currencyCode: data.currencyCode || 'USD',
        currencySymbol: data.currencySymbol || '$',
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

  // Handle Preset Currency Selection
  const handleSelectCurrencyPreset = (code: string) => {
    const found = POPULAR_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        currencyCode: found.code,
        currencySymbol: found.symbol,
        currencyPlacement: found.placement,
      }));
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      await settingsService.updateInquiryStatusAdmin(id, status);
      toast.success(`Inquiry updated to ${status}`);
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item)),
      );
    } catch {
      toast.error('Failed to update inquiry status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-100 rounded-md" />
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
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Store & Business Settings"
        description="Configure your multi-currency localization (Rupees, Dollars, Euros), brand identity, support contact details, and customer policies."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className={isLoading ? 'animate-spin' : undefined} />}
              onClick={fetchSettings}
            >
              Reload
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Save className={isSaving ? 'animate-spin' : undefined} />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 rounded-lg">
        {[
          { id: 'currency', label: 'Currency & Localization', icon: DollarSign },
          { id: 'branding', label: 'Store Identity & Branding', icon: Building2 },
          { id: 'contact', label: 'Contact Us & Support', icon: Phone },
          { id: 'social', label: 'Social Networks', icon: Share2 },
          { id: 'policies', label: 'Orders & Policies', icon: Sliders },
          { id: 'inquiries', label: `Customer Inquiries (${inquiries.length})`, icon: MessageSquare },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as TabId)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: CURRENCY & LOCALIZATION */}
        {activeTab === 'currency' && (
          <div className="space-y-6 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
            {/* Live Preview Card */}
            <div className="p-4 rounded-md bg-amber-50/70 border border-amber-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
                  {formData.currencySymbol}
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                    Customer Storefront Preview
                  </span>
                  <span className="text-sm text-slate-600">
                    Product prices will appear as:{' '}
                    <span className="font-extrabold text-slate-900 text-base ml-1">
                      {pricePreview}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-white/80 px-3 py-1.5 rounded border border-amber-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live in Product Catalog, Cart, & Checkout</span>
              </div>
            </div>

            {/* Currency Quick Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Popular Currency Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {POPULAR_CURRENCIES.map((c) => {
                  const isSelected = formData.currencyCode === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCurrencyPreset(c.code)}
                      className={`p-2.5 rounded-md border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-lg font-black block text-slate-800">{c.symbol}</span>
                      <span className="text-xs font-bold text-slate-700 block">{c.code}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Currency Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Currency Code (ISO)
                </label>
                <input
                  type="text"
                  value={formData.currencyCode}
                  onChange={(e) => handleChange('currencyCode', e.target.value.toUpperCase())}
                  placeholder="USD or INR"
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                  placeholder="$ or ₹ or €"
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Symbol Placement
                </label>
                <select
                  value={formData.currencyPlacement}
                  onChange={(e) => handleChange('currencyPlacement', e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 font-medium"
                >
                  <option value="prefix">Prefix (e.g. $100 or ₹100)</option>
                  <option value="suffix">Suffix (e.g. 100 $ or 100 ₹)</option>
                </select>
              </div>
            </div>

            {/* Financial Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Decimal Places
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.decimalPlaces}
                  onChange={(e) => handleChange('decimalPlaces', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tax / GST Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Free Shipping Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Standard Shipping Fee
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.defaultShippingFee}
                  onChange={(e) => handleChange('defaultShippingFee', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORE IDENTITY & BRANDING */}
        {activeTab === 'branding' && (
          <div className="space-y-4 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Store Public Name
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Store Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company Legal Entity Name
                </label>
                <input
                  type="text"
                  value={formData.companyLegalName}
                  onChange={(e) => handleChange('companyLegalName', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Top Announcement Bar Message
                </label>
                <input
                  type="text"
                  value={formData.announcementBarText}
                  onChange={(e) => handleChange('announcementBarText', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT US & SUPPORT */}
        {activeTab === 'contact' && (
          <div className="space-y-4 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Commercial / Sales Email
                </label>
                <input
                  type="email"
                  value={formData.salesEmail}
                  onChange={(e) => handleChange('salesEmail', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Helpline Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => handleChange('operatingHours', e.target.value)}
                  placeholder="e.g. Mon - Fri: 9:00 AM - 8:00 PM EST"
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Store Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL NETWORKS */}
        {activeTab === 'social' && (
          <div className="space-y-4 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={formData.youtube}
                  onChange={(e) => handleChange('youtube', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS & POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-4 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Order Number Prefix
                </label>
                <input
                  type="text"
                  value={formData.orderNumberPrefix}
                  onChange={(e) => handleChange('orderNumberPrefix', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="enableCod"
                  checked={formData.enableCod}
                  onChange={(e) => handleChange('enableCod', e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300"
                />
                <label htmlFor="enableCod" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Enable Cash on Delivery (COD) Payment
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMER INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Customer Inquiries from Contact Us Page
              </h3>
              <Button size="sm" variant="outline" onClick={fetchInquiries}>
                Refresh Inquiries
              </Button>
            </div>

            {isLoadingInquiries ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No customer inquiries received yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {inquiries.map((inq) => (
                  <div key={inq._id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{inq.name}</span>
                        <span className="text-slate-400 text-xs">({inq.email})</span>
                        {inq.phone && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            • {inq.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            inq.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inq.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inq.status}
                        </span>
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            handleUpdateInquiryStatus(inq._id, e.target.value as any)
                          }
                          className="text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                        >
                          <option value="NEW">NEW</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </div>
                    </div>
                    <div className="font-semibold text-slate-800 text-xs">
                      Subject: {inq.subject}
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 leading-relaxed whitespace-pre-line">
                      {inq.message}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Received:{' '}
                      {new Date(inq.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global Save Button at bottom of form */}
        {activeTab !== 'inquiries' && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className={isSaving ? 'animate-spin' : undefined} />}
              disabled={isSaving}
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
