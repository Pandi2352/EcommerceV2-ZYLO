import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    example: ['products.view', 'products.create', 'products.edit'],
    description: 'Complete replacement list of permission keys assigned to this role',
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
