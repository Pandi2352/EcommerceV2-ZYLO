import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true, collection: 'settings' })
export class Setting {
  // Store Identity
  @Prop({ default: 'ZYLO Commerce', trim: true })
  storeName: string;

  @Prop({ default: 'Mega Store & Supermarket', trim: true })
  tagline: string;

  @Prop({ default: 'Zylo Global Retail Inc.', trim: true })
  companyLegalName: string;

  @Prop({ default: 'Free shipping for all orders over $50.00', trim: true })
  announcementBarText: string;

  // Currency & Localization
  @Prop({ default: 'USD', uppercase: true, trim: true })
  currencyCode: string; // e.g. USD, INR, EUR, GBP

  @Prop({ default: '$', trim: true })
  currencySymbol: string; // e.g. $, ₹, €, £

  @Prop({ default: 'prefix', enum: ['prefix', 'suffix'] })
  currencyPlacement: 'prefix' | 'suffix';

  @Prop({ default: 2, min: 0, max: 4 })
  decimalPlaces: number;

  @Prop({ default: 8, min: 0 })
  taxRate: number; // percentage, e.g. 8%

  @Prop({ default: 50, min: 0 })
  freeShippingThreshold: number;

  @Prop({ default: 10, min: 0 })
  defaultShippingFee: number;

  @Prop({ default: 25, min: 0 })
  expressShippingFee: number;

  // Contact & Support Details
  @Prop({ default: 'support@zylo.com', lowercase: true, trim: true })
  supportEmail: string;

  @Prop({ default: 'sales@zylo.com', lowercase: true, trim: true })
  salesEmail: string;

  @Prop({ default: '+1 800 900 2956', trim: true })
  phone: string;

  @Prop({ default: '+1 800 900 2956', trim: true })
  whatsapp: string;

  @Prop({ default: '5171 W Campbell Ave, San Jose, CA 95124, United States', trim: true })
  address: string;

  @Prop({ default: 'San Jose', trim: true })
  city: string;

  @Prop({ default: 'CA', trim: true })
  state: string;

  @Prop({ default: '95124', trim: true })
  postalCode: string;

  @Prop({ default: 'United States', trim: true })
  country: string;

  @Prop({ default: 'Mon - Fri: 9:00 AM - 8:00 PM EST', trim: true })
  operatingHours: string;

  @Prop({ default: '', trim: true })
  googleMapsUrl: string;

  // Social Media Links
  @Prop({ default: 'https://facebook.com', trim: true })
  facebook: string;

  @Prop({ default: 'https://twitter.com', trim: true })
  twitter: string;

  @Prop({ default: 'https://instagram.com', trim: true })
  instagram: string;

  @Prop({ default: 'https://linkedin.com', trim: true })
  linkedin: string;

  @Prop({ default: 'https://youtube.com', trim: true })
  youtube: string;

  // Order & Operational Policies
  @Prop({ default: 'ZYLO-', trim: true })
  orderNumberPrefix: string;

  @Prop({ default: true })
  enableCod: boolean;

  @Prop({ default: false })
  enableMaintenanceMode: boolean;

  // Multi Payment Providers Configuration
  @Prop({ default: 'stripe', enum: ['stripe', 'razorpay', 'paypal'] })
  defaultOnlineProvider: 'stripe' | 'razorpay' | 'paypal';

  // Stripe Credentials
  @Prop({ default: true })
  stripeEnabled: boolean;

  @Prop({ default: 'test', enum: ['test', 'live'] })
  stripeMode: 'test' | 'live';

  @Prop({ default: '', trim: true })
  stripePublishableKey: string;

  @Prop({ default: '', trim: true })
  stripeSecretKey: string;

  @Prop({ default: '', trim: true })
  stripeWebhookSecret: string;

  // Razorpay Credentials (Multi-Provider Future Ready)
  @Prop({ default: false })
  razorpayEnabled: boolean;

  @Prop({ default: 'test', enum: ['test', 'live'] })
  razorpayMode: 'test' | 'live';

  @Prop({ default: '', trim: true })
  razorpayKeyId: string;

  @Prop({ default: '', trim: true })
  razorpayKeySecret: string;

  @Prop({ default: '', trim: true })
  razorpayWebhookSecret: string;

  // PayPal Credentials (Multi-Provider Future Ready)
  @Prop({ default: false })
  paypalEnabled: boolean;

  @Prop({ default: 'sandbox', enum: ['sandbox', 'live'] })
  paypalMode: 'sandbox' | 'live';

  @Prop({ default: '', trim: true })
  paypalClientId: string;

  @Prop({ default: '', trim: true })
  paypalClientSecret: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
