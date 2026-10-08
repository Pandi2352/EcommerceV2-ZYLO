import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { TemplateVariableDefinition } from '../enums/email-template-type.enum';

export class UpdateEmailTemplateDto {
  @ApiPropertyOptional({ description: 'Human readable template title' })
  @IsString()
  @IsOptional()
  template_name?: string;

  @ApiPropertyOptional({ description: 'Email subject template containing {{variables}}' })
  @IsString()
  @IsOptional()
  subject_template?: string;

  @ApiPropertyOptional({ description: 'HTML template markup with {{variable}} placeholders' })
  @IsString()
  @IsOptional()
  html_template?: string;

  @ApiPropertyOptional({ description: 'Canvas blocks and style tree serialized as JSON' })
  @IsObject()
  @IsOptional()
  design_json?: Record<string, any>;

  @ApiPropertyOptional({ description: 'List of allowed variables and their sample descriptions' })
  @IsArray()
  @IsOptional()
  allowed_variables?: TemplateVariableDefinition[];

  @ApiPropertyOptional({ description: 'Set this template as active for its event type' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
