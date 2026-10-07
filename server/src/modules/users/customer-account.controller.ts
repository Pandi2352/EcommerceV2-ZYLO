import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddressDto } from './dto/address.dto';

@ApiTags('Account')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('account')
export class CustomerAccountController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current customer profile' })
  @ApiResponse({ status: 200, description: 'Customer profile details' })
  async getProfile(@CurrentUser() user: UserDocument) {
    const latestUser = await this.usersService.findById(user._id.toString());
    return { user: latestUser || user };
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update customer profile details (name, phone, avatar)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@CurrentUser() user: UserDocument, @Body() dto: UpdateProfileDto) {
    const updatedUser = await this.usersService.updateProfile(user._id.toString(), dto);
    return {
      user: updatedUser,
      message: 'Profile updated successfully',
    };
  }

  @Get('addresses')
  @ApiOperation({ summary: 'List customer saved addresses' })
  @ApiResponse({ status: 200, description: 'Saved addresses list' })
  async getAddresses(@CurrentUser() user: UserDocument) {
    const addresses = await this.usersService.getAddresses(user._id.toString());
    return { addresses };
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new shipping address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async addAddress(@CurrentUser() user: UserDocument, @Body() dto: AddressDto) {
    const result = await this.usersService.addAddress(user._id.toString(), dto);
    return {
      ...result,
      message: 'Address added successfully',
    };
  }

  @Put('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing shipping address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  async updateAddress(
    @CurrentUser() user: UserDocument,
    @Param('id') addressId: string,
    @Body() dto: AddressDto,
  ) {
    const result = await this.usersService.updateAddress(user._id.toString(), addressId, dto);
    return {
      ...result,
      message: 'Address updated successfully',
    };
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a shipping address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async deleteAddress(@CurrentUser() user: UserDocument, @Param('id') addressId: string) {
    const result = await this.usersService.deleteAddress(user._id.toString(), addressId);
    return {
      ...result,
      message: 'Address deleted successfully',
    };
  }

  @Patch('addresses/:id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set default shipping address' })
  @ApiResponse({ status: 200, description: 'Default address updated' })
  async setDefaultAddress(@CurrentUser() user: UserDocument, @Param('id') addressId: string) {
    const result = await this.usersService.setDefaultAddress(user._id.toString(), addressId);
    return {
      ...result,
      message: 'Default address updated successfully',
    };
  }
}
