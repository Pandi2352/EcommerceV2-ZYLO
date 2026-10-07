import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ReturnsService } from './returns.service';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';

@ApiTags('Returns (Customer)')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('returns')
export class CustomerReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new return request for a delivered order' })
  @ApiResponse({ status: 201, description: 'Return request submitted successfully' })
  async createReturn(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateReturnRequestDto,
  ) {
    const returnRequest = await this.returnsService.createReturnRequest(
      user._id.toString(),
      user,
      dto,
    );
    return {
      returnRequest,
      message: 'Return request submitted successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get current customer returns history' })
  @ApiResponse({ status: 200, description: 'List of customer return requests' })
  async getReturns(@CurrentUser() user: UserDocument) {
    const returns = await this.returnsService.getCustomerReturns(user._id.toString());
    return {
      items: returns,
      total: returns.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer return request details by ID' })
  @ApiResponse({ status: 200, description: 'Return request details' })
  async getReturnById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    const returnRequest = await this.returnsService.getCustomerReturnById(
      user._id.toString(),
      id,
    );
    return { returnRequest };
  }
}
