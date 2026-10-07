import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderTrackingDto {
  @ApiProperty({ example: 'FedEx' })
  @IsNotEmpty()
  @IsString()
  courierName: string;

  @ApiProperty({ example: 'FX-9821849182' })
  @IsNotEmpty()
  @IsString()
  trackingNumber: string;

  @ApiPropertyOptional({ example: 'https://www.fedex.com/tracking?id=FX-9821849182' })
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiPropertyOptional({ enum: OrderStatus, default: OrderStatus.SHIPPED })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.SHIPPED;

  @ApiPropertyOptional({ example: 'Package dispatched via FedEx Express' })
  @IsOptional()
  @IsString()
  note?: string;
}
