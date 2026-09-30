import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MfaCodeDto {
  @ApiProperty({
    example: '123456',
    description: '6-digit authenticator code, or a one-time backup code (xxxx-xxxx) where accepted',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;
}
