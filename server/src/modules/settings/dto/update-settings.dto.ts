import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLegalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  announcementBarText?: string;

  // Currency
  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({ example: '₹' })
  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @ApiPropertyOptional({ enum: ['prefix', 'suffix'] })
  @IsOptional()
  @IsIn(['prefix', 'suffix'])
  currencyPlacement?: 'prefix' | 'suffix';

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  decimalPlaces?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  defaultShippingFee?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expressShippingFee?: number;

  // Contact
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salesEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatingHours?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  // Social
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  youtube?: string;

  // Policies
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderNumberPrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableCod?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableMaintenanceMode?: boolean;

  // Multi Payment Providers
  @ApiPropertyOptional({ enum: ['stripe', 'razorpay', 'paypal'] })
  @IsOptional()
  @IsIn(['stripe', 'razorpay', 'paypal'])
  defaultOnlineProvider?: 'stripe' | 'razorpay' | 'paypal';

  // Stripe
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  stripeEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['test', 'live'] })
  @IsOptional()
  @IsIn(['test', 'live'])
  stripeMode?: 'test' | 'live';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripePublishableKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;

  // Razorpay
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  razorpayEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['test', 'live'] })
  @IsOptional()
  @IsIn(['test', 'live'])
  razorpayMode?: 'test' | 'live';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpayKeyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpayKeySecret?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpayWebhookSecret?: string;

  // PayPal
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  paypalEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['sandbox', 'live'] })
  @IsOptional()
  @IsIn(['sandbox', 'live'])
  paypalMode?: 'sandbox' | 'live';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paypalClientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paypalClientSecret?: string;
}
