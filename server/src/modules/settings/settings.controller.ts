import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';

@ApiTags('Public Settings')
@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get public store settings (currency, contact info, store branding)' })
  @ApiResponse({ status: 200, description: 'Public store business settings' })
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Public()
  @Post('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer submits a contact inquiry message' })
  @ApiResponse({ status: 200, description: 'Inquiry received successfully' })
  async submitContact(@Body() dto: CreateContactInquiryDto) {
    const inquiry = await this.settingsService.submitContactInquiry(dto);
    return {
      success: true,
      inquiryId: inquiry._id,
      message: 'Thank you for reaching out! Our team will respond shortly.',
    };
  }
}

@ApiTags('Admin Store Settings')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin: Get full store and business settings' })
  @ApiResponse({ status: 200, description: 'Current store settings' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @Patch()
  @ApiOperation({ summary: 'Admin: Update store and business settings' })
  @ApiResponse({ status: 200, description: 'Updated store settings' })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const settings = await this.settingsService.updateSettings(dto);
    return {
      settings,
      message: 'Store business settings updated successfully',
    };
  }

  @Get('inquiries')
  @ApiOperation({ summary: 'Admin: Get customer contact inquiries' })
  @ApiResponse({ status: 200, description: 'List of customer inquiries' })
  async getInquiries(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.settingsService.getContactInquiriesAdmin(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Patch('inquiries/:id/status')
  @ApiOperation({ summary: 'Admin: Update contact inquiry status' })
  @ApiResponse({ status: 200, description: 'Updated inquiry status' })
  async updateInquiryStatus(
    @Param('id') id: string,
    @Body('status') status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED',
  ) {
    const inquiry = await this.settingsService.updateInquiryStatus(id, status);
    return {
      inquiry,
      message: `Inquiry marked as ${status}`,
    };
  }
}
