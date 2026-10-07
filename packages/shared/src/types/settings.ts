export type CurrencyPlacement = 'prefix' | 'suffix';

export interface PublicBusinessSettings {
  storeName: string;
  tagline: string;
  companyLegalName: string;
  announcementBarText: string;
  currencyCode: string;
  currencySymbol: string;
  currencyPlacement: CurrencyPlacement;
  decimalPlaces: number;
  taxRate: number;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  expressShippingFee: number;
  supportEmail: string;
  salesEmail: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  operatingHours: string;
  googleMapsUrl: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  enableCod: boolean;
  enableMaintenanceMode: boolean;
}

export interface BusinessSettings extends PublicBusinessSettings {
  _id?: string;
  orderNumberPrefix: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateBusinessSettingsPayload {
  storeName?: string;
  tagline?: string;
  companyLegalName?: string;
  announcementBarText?: string;
  currencyCode?: string;
  currencySymbol?: string;
  currencyPlacement?: CurrencyPlacement;
  decimalPlaces?: number;
  taxRate?: number;
  freeShippingThreshold?: number;
  defaultShippingFee?: number;
  expressShippingFee?: number;
  supportEmail?: string;
  salesEmail?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  operatingHours?: string;
  googleMapsUrl?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  orderNumberPrefix?: string;
  enableCod?: boolean;
  enableMaintenanceMode?: boolean;
}

export interface ContactInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactInquiryItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}
