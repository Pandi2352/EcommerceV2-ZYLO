import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFileDto {
  @ApiProperty({
    description: 'Public URL or relative path (/uploads/...) of the file to remove',
    example: '/uploads/products/1728345678-abc12345-thumbnail.webp',
  })
  @IsString()
  @IsNotEmpty()
  fileKey: string;
}
