import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyInvitationDto {
  @ApiProperty({ example: 'w1aE...rawToken32bytes' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
