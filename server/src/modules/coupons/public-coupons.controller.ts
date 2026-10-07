import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@ApiTags('Public Coupons')
@Controller('coupons')
export class PublicCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon code and compute exact discount' })
  async validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(dto.code, dto.subtotal, dto.userId);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'List active public coupons for promotions & checkout suggestions' })
  async getActive() {
    return this.couponsService.getActivePublicCoupons();
  }
}
