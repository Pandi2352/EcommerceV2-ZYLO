import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'Priya' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(60)
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(60)
  lastName: string;

  @ApiProperty({ example: 'priya.sharma@zylo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'ZY-0042', description: 'Internal staff reference code' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  userCode: string;

  @ApiPropertyOptional({ example: 'Senior Catalog Executive' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  designation?: string;

  @ApiProperty({ example: ['b3f54532-6e27-4632-9cb7-285d82054174'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1) // MVP UI restricts to exactly 1 role per user
  @IsString({ each: true })
  roleIds: string[];

  @ApiPropertyOptional({ example: 'Welcome to the team! Looking forward to working together.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
