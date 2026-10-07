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
  defaultOnlineProvider?: 'stripe' | 'razorpay' | 'paypal';
  paymentProviders?: {
    stripe?: { enabled: boolean; mode: string; publishableKey: string };
    razorpay?: { enabled: boolean; mode: string; keyId: string };
    paypal?: { enabled: boolean; mode: string; clientId: string };
  };
}

export interface BusinessSettings extends PublicBusinessSettings {
  _id?: string;
  orderNumberPrefix: string;
  stripeEnabled?: boolean;
  stripeMode?: 'test' | 'live';
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  razorpayEnabled?: boolean;
  razorpayMode?: 'test' | 'live';
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  paypalEnabled?: boolean;
  paypalMode?: 'sandbox' | 'live';
  paypalClientId?: string;
  paypalClientSecret?: string;
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
  defaultOnlineProvider?: 'stripe' | 'razorpay' | 'paypal';
  stripeEnabled?: boolean;
  stripeMode?: 'test' | 'live';
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  razorpayEnabled?: boolean;
  razorpayMode?: 'test' | 'live';
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  paypalEnabled?: boolean;
  paypalMode?: 'sandbox' | 'live';
  paypalClientId?: string;
  paypalClientSecret?: string;
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
