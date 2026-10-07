import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ example: 'ZYLO20', description: 'Promotional discount coupon code' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  code: string;
}
