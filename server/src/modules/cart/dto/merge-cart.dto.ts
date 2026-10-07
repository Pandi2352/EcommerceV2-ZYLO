import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { AddToCartDto } from './add-to-cart.dto';

export class MergeCartDto {
  @ApiProperty({ type: [AddToCartDto], description: 'Guest cart items to merge into customer cart upon sign in' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddToCartDto)
  items: AddToCartDto[];
}
