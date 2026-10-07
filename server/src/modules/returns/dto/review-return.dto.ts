import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewReturnDto {
  @ApiProperty({
    description: 'Decision to approve or reject the return request',
    enum: ['APPROVE', 'REJECT'],
  })
  @IsIn(['APPROVE', 'REJECT'])
  decision: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({
    description: 'Whether to automatically replenish inventory stock upon approval',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  restockItems?: boolean = true;

  @ApiPropertyOptional({
    description: 'Reason if rejecting, or notes for customer',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Internal staff notes for admin records',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
