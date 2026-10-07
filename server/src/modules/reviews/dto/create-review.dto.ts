import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ description: 'Rating score from 1 to 5', minimum: 1, maximum: 5, example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review summary title', maxLength: 120, example: 'Superb build quality and battery life' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    description: 'Detailed review body',
    maxLength: 2000,
    example: 'Exceeded my expectations in build rigidity, keyboard action, and display clarity. Highly recommended!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment: string;
}
