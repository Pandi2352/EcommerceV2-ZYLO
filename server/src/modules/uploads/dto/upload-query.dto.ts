import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadQueryDto {
  @ApiPropertyOptional({
    description: 'Target subdirectory folder for the uploaded media',
    enum: ['products', 'categories', 'brands', 'avatars', 'general'],
    default: 'general',
  })
  @IsOptional()
  @IsString()
  @IsIn(['products', 'categories', 'brands', 'avatars', 'general'])
  folder?: string = 'general';
}
