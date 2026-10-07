import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ReturnReason } from '../schemas/return-request.schema';

export class ReturnItemDto {
  @ApiProperty({ description: 'Order line item ID' })
  @IsNotEmpty()
  @IsString()
  orderItemId: string;

  @ApiProperty({ description: 'Quantity of this item to return', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateReturnRequestDto {
  @ApiProperty({ description: 'Order ID or unique order number' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Items being returned',
    type: [ReturnItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @ApiProperty({
    description: 'Reason for requesting return',
    enum: ReturnReason,
  })
  @IsEnum(ReturnReason)
  reason: ReturnReason;

  @ApiPropertyOptional({ description: 'Customer notes or explanation' })
  @IsOptional()
  @IsString()
  customerNote?: string;

  @ApiPropertyOptional({
    description: 'URLs to photo proofs showing defect or damage',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proofImages?: string[];
}
