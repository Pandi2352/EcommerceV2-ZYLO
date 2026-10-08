import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { EmailTemplateType } from '../enums/email-template-type.enum';

export class SendTestEmailDto {
  @ApiProperty({ description: 'Destination email address for test preview delivery', example: 'admin@zylo.com' })
  @IsEmail()
  @IsNotEmpty()
  recipient_email: string;

  @ApiPropertyOptional({ description: 'Custom variables map to interpolate into test email' })
  @IsObject()
  @IsOptional()
  custom_variables?: Record<string, any>;
}

export class QueryEmailTemplateDto {
  @ApiPropertyOptional({ enum: EmailTemplateType, description: 'Filter templates by event type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Search term by title or subject' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status ("true" | "false")' })
  @IsOptional()
  @IsString()
  active?: string;
}
