import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DeliveryMethod, PaymentMethod } from '../schemas/order.schema';
import { AddressDto } from '../../users/dto/address.dto';

export class CheckoutDto {
  @ApiProperty({ type: AddressDto, description: 'Selected delivery shipping address' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({
    enum: DeliveryMethod,
    default: DeliveryMethod.STANDARD,
    description: 'STANDARD or EXPRESS delivery',
  })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  @ApiProperty({
    enum: PaymentMethod,
    default: PaymentMethod.COD,
    description: 'Payment method (COD or ONLINE)',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Optional coupon code (re-validated on checkout)' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Optional delivery notes/instructions' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'User accepted terms and conditions', example: true })
  @IsBoolean()
  termsAccepted: boolean;
}
