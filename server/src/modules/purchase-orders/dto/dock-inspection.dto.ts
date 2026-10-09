import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceivingItemDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  deliveredQty: number;

  @IsNumber()
  @Min(0)
  acceptedQty: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rejectedQty?: number;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ReceiveDockShipmentDto {
  @IsString()
  @IsNotEmpty()
  poId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivingItemDto)
  items: ReceivingItemDto[];

  @IsOptional()
  @IsString()
  dockBay?: string;

  @IsOptional()
  @IsString()
  inspectorName?: string;

  @IsOptional()
  @IsBoolean()
  passedInspection?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
