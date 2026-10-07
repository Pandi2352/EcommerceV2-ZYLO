import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContactInquiryDto {
  @ApiProperty({ example: 'Samantha Lee' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'samantha@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1 415-555-0199' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Bulk ordering inquiry' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  subject: string;

  @ApiProperty({ example: 'I would like to inquire about bulk corporate pricing for 50 units.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  message: string;
}
