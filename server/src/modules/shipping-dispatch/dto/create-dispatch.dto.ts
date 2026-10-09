import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ShippingCarrier, ServiceLevel } from '../schemas/shipment-dispatch.schema';

export class CreateDispatchDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  originWarehouseId: string;

  @IsEnum(ShippingCarrier)
  carrier: ShippingCarrier;

  @IsEnum(ServiceLevel)
  serviceLevel: ServiceLevel;

  @IsNumber()
  @Min(0.1)
  packageWeightKg: number;

  @IsOptional()
  packageDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetRatesDto {
  @IsNumber()
  @Min(0.1)
  weightKg: number;

  @IsOptional()
  @IsString()
  originPostalCode?: string;

  @IsOptional()
  @IsString()
  destPostalCode?: string;

  @IsOptional()
  @IsString()
  destCountry?: string;
}

export class SimulateWebhookDto {
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
