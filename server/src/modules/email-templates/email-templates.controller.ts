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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { QueryEmailTemplateDto, SendTestEmailDto } from './dto/query-email-template.dto';

@ApiTags('Admin Email Templates')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/email-templates')
export class EmailTemplatesController {
  constructor(private readonly templatesService: EmailTemplatesService) {}

  @Get('types')
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Admin: Get all supported email event types and variable definitions' })
  @ApiResponse({ status: 200, description: 'List of email template types and schema' })
  async getTemplateTypes() {
    const types = this.templatesService.getTemplateTypes();
    return {
      success: true,
      code: 200,
      description: 'Email template types retrieved successfully',
      data: types,
    };
  }

  @Get()
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Admin: List all email templates with filters' })
  @ApiResponse({ status: 200, description: 'Email templates retrieved successfully' })
  async getTemplates(@Query() query: QueryEmailTemplateDto) {
    const templates = await this.templatesService.getTemplates(query);
    return {
      success: true,
      code: 200,
      description: 'Email templates retrieved successfully',
      data: templates,
    };
  }

  @Get(':id')
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Admin: Get email template details by ID' })
  @ApiResponse({ status: 200, description: 'Template detail' })
  async getTemplate(@Param('id') id: string) {
    const template = await this.templatesService.getTemplateById(id);
    return {
      success: true,
      code: 200,
      description: 'Email template retrieved successfully',
      data: template,
    };
  }

  @Post()
  @RequirePermissions('settings.edit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a new custom email template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateEmailTemplateDto,
  ) {
    const creatorName = user?.name || user?.email || 'ADMIN';
    const template = await this.templatesService.createTemplate(dto, creatorName);
    return {
      success: true,
      code: 201,
      description: 'Email template created successfully',
      data: template,
    };
  }

  @Put(':id')
  @RequirePermissions('settings.edit')
  @ApiOperation({ summary: 'Admin: Update existing email template content and styles' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    const template = await this.templatesService.updateTemplate(id, dto);
    return {
      success: true,
      code: 200,
      description: 'Email template updated successfully',
      data: template,
    };
  }

  @Patch(':id/activate')
  @RequirePermissions('settings.edit')
  @ApiOperation({ summary: 'Admin: Set template as active for its event type' })
  @ApiResponse({ status: 200, description: 'Template activated' })
  async activateTemplate(@Param('id') id: string) {
    const template = await this.templatesService.activateTemplate(id);
    return {
      success: true,
      code: 200,
      description: `Template "${template.template_name}" is now the active template for ${template.template_type}`,
      data: template,
    };
  }

  @Post(':id/clone')
  @RequirePermissions('settings.edit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Duplicate template as a draft copy' })
  @ApiResponse({ status: 201, description: 'Template cloned' })
  async cloneTemplate(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    const creatorName = user?.name || user?.email || 'ADMIN';
    const clone = await this.templatesService.cloneTemplate(id, creatorName);
    return {
      success: true,
      code: 201,
      description: 'Email template cloned successfully as a draft',
      data: clone,
    };
  }

  @Post(':id/send-test')
  @RequirePermissions('settings.edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Send live preview test email to an inbox' })
  @ApiResponse({ status: 200, description: 'Test email dispatched' })
  async sendTestEmail(
    @Param('id') id: string,
    @Body() dto: SendTestEmailDto,
  ) {
    const result = await this.templatesService.sendTestEmail(id, dto);
    return {
      success: true,
      code: 200,
      description: result.message,
      data: result,
    };
  }

  @Delete(':id')
  @RequirePermissions('settings.edit')
  @ApiOperation({ summary: 'Admin: Delete email template' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  async deleteTemplate(@Param('id') id: string) {
    const result = await this.templatesService.deleteTemplate(id);
    return {
      success: true,
      code: 200,
      description: result.message,
      data: null,
    };
  }
}
