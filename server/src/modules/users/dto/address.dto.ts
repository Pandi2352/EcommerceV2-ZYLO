import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ example: '742 Evergreen Terrace', description: 'Street address' })
  @IsNotEmpty({ message: 'Street address is required' })
  @IsString()
  @MaxLength(150)
  street: string;

  @ApiProperty({ example: 'Springfield', description: 'City name' })
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  @MaxLength(80)
  city: string;

  @ApiProperty({ example: 'OR', description: 'State or Province' })
  @IsNotEmpty({ message: 'State or province is required' })
  @IsString()
  @MaxLength(60)
  state: string;

  @ApiProperty({ example: '97477', description: 'Postal or ZIP code' })
  @IsNotEmpty({ message: 'Postal / ZIP code is required' })
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiPropertyOptional({ example: 'US', default: 'US', description: 'Two-letter country code' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  country?: string;

  @ApiPropertyOptional({ example: '+1 (555) 789-0123', description: 'Delivery contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: true, default: false, description: 'Mark as default shipping address' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
