import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmailTemplateType, TemplateVariableDefinition } from '../enums/email-template-type.enum';

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'Human readable template title', example: 'Modern User Invitation Email' })
  @IsString()
  @IsNotEmpty()
  template_name: string;

  @ApiProperty({ enum: EmailTemplateType, description: 'Event category / type', example: EmailTemplateType.USER_INVITATION })
  @IsEnum(EmailTemplateType)
  template_type: EmailTemplateType;

  @ApiProperty({ description: 'Email subject template containing {{variables}}', example: "You're invited to join {{company_name}}" })
  @IsString()
  @IsNotEmpty()
  subject_template: string;

  @ApiProperty({ description: 'HTML template markup with {{variable}} placeholders' })
  @IsString()
  @IsNotEmpty()
  html_template: string;

  @ApiPropertyOptional({ description: 'Canvas blocks and style tree serialized as JSON' })
  @IsObject()
  @IsOptional()
  design_json?: Record<string, any>;

  @ApiPropertyOptional({ description: 'List of allowed variables and their sample descriptions' })
  @IsArray()
  @IsOptional()
  allowed_variables?: TemplateVariableDefinition[];

  @ApiPropertyOptional({ description: 'Immediately set this template as active for this event type', default: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
