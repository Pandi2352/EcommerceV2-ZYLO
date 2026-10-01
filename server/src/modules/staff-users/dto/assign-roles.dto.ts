import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({
    example: ['b3f54532-6e27-4632-9cb7-285d82054174'],
    description: 'Array of role IDs assigned to this staff user (MVP UI restricts to exactly 1)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  @IsString({ each: true })
  roleIds: string[];
}
