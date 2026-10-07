import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { settingsService } from '@shared/api/settings.service';
import type { PublicBusinessSettings } from '@shared/types/settings';
import { formatPrice as baseFormatPrice } from '@shared/utils/currency';

const DEFAULT_SETTINGS: PublicBusinessSettings = {
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
  enableCod: true,
  enableMaintenanceMode: false,
};

interface SettingsContextType {
  settings: PublicBusinessSettings;
  isLoading: boolean;
  currencySymbol: string;
  currencyCode: string;
  formatPrice: (amount: number | null | undefined) => string;
  refetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicBusinessSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsService.getPublicSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Failed to fetch public business settings, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const currencySymbol = settings.currencySymbol || '$';
  const currencyCode = settings.currencyCode || 'USD';

  const formatPrice = useCallback(
    (amount: number | null | undefined): string => {
      return baseFormatPrice(amount, {
        currencySymbol: settings.currencySymbol,
        currencyPlacement: settings.currencyPlacement,
        decimalPlaces: settings.decimalPlaces,
      });
    },
    [settings.currencySymbol, settings.currencyPlacement, settings.decimalPlaces],
  );

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      currencySymbol,
      currencyCode,
      formatPrice,
      refetchSettings: fetchSettings,
    }),
    [settings, isLoading, currencySymbol, currencyCode, formatPrice, fetchSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
