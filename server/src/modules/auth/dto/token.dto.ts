import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Single-use token delivered by email (verification link, password reset link). */
export class TokenDto {
  @ApiProperty({ description: 'Token from the emailed link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token: string;
}
