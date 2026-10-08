import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EmailTemplate, EmailTemplateDocument } from './schemas/email-template.schema';
import {
  EmailTemplateType,
  EMAIL_TEMPLATE_TYPES_META,
} from './enums/email-template-type.enum';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { QueryEmailTemplateDto, SendTestEmailDto } from './dto/query-email-template.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);

  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplateDocument>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Retrieves email templates with optional type, search and status filtering
   */
  async getTemplates(query: QueryEmailTemplateDto) {
    const filter: Record<string, any> = { is_deleted: false };

    if (query.type && query.type !== 'ALL') {
      filter.template_type = query.type;
    }

    if (query.active !== undefined && query.active !== '') {
      filter.is_active = query.active === 'true';
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { template_name: regex },
        { subject_template: regex },
        { template_key: regex },
      ];
    }

    const templates = await this.templateModel
      .find(filter)
      .sort({ template_type: 1, is_active: -1, updated_at: -1 })
      .lean()
      .exec();

    return templates;
  }

  /**
   * Returns metadata and allowed variables for all supported event types
   */
  getTemplateTypes() {
    return Object.values(EMAIL_TEMPLATE_TYPES_META);
  }

  /**
   * Retrieves a single template by ID
   */
  async getTemplateById(id: string) {
    const template = await this.templateModel.findById(id).lean().exec();
    if (!template || template.is_deleted) {
      throw new NotFoundException(`Email template "${id}" not found`);
    }
    return template;
  }

  /**
   * Creates a new email template. If marked active, atomically deactivates others of same type.
   */
  async createTemplate(dto: CreateEmailTemplateDto, createdBy = 'ADMIN') {
    const typeMeta = EMAIL_TEMPLATE_TYPES_META[dto.template_type];
    const allowedVars = dto.allowed_variables && dto.allowed_variables.length > 0
      ? dto.allowed_variables
      : (typeMeta?.allowedVariables || []);

    const countForType = await this.templateModel.countDocuments({
      template_type: dto.template_type,
      is_deleted: false,
    });

    const isFirstOfType = countForType === 0;
    const shouldActivate = dto.is_active ?? isFirstOfType;

    if (shouldActivate) {
      await this.templateModel.updateMany(
        { template_type: dto.template_type },
        { $set: { is_active: false } },
      );
    }

    const templateKey = `${dto.template_type}_${Date.now().toString().slice(-6)}`;

    const newTemplate = await this.templateModel.create({
      _id: uuidv4(),
      template_key: templateKey,
      template_name: dto.template_name,
      template_type: dto.template_type,
      subject_template: dto.subject_template,
      html_template: dto.html_template,
      design_json: dto.design_json || null,
      allowed_variables: allowedVars,
      is_active: shouldActivate,
      is_default: false,
      is_deleted: false,
      created_by: createdBy,
    });

    this.logger.log(`Created email template "${newTemplate.template_name}" (${newTemplate._id}) for ${newTemplate.template_type}`);
    return newTemplate;
  }

  /**
   * Updates an existing email template
   */
  async updateTemplate(id: string, dto: UpdateEmailTemplateDto) {
    const template = await this.templateModel.findById(id);
    if (!template || template.is_deleted) {
      throw new NotFoundException(`Email template "${id}" not found`);
    }

    if (dto.is_active === true && !template.is_active) {
      await this.templateModel.updateMany(
        { template_type: template.template_type, _id: { $ne: template._id as any } },
        { $set: { is_active: false } },
      );
      template.is_active = true;
    } else if (dto.is_active === false) {
      template.is_active = false;
    }

    if (dto.template_name !== undefined) template.template_name = dto.template_name;
    if (dto.subject_template !== undefined) template.subject_template = dto.subject_template;
    if (dto.html_template !== undefined) template.html_template = dto.html_template;
    if (dto.design_json !== undefined) template.design_json = dto.design_json;
    if (dto.allowed_variables !== undefined) template.allowed_variables = dto.allowed_variables as any;

    await template.save();
    return template;
  }

  /**
   * Sets a template as the single ACTIVE template for its event type
   */
  async activateTemplate(id: string) {
    const template = await this.templateModel.findById(id);
    if (!template || template.is_deleted) {
      throw new NotFoundException(`Email template "${id}" not found`);
    }

    // Atomically deactivate all templates of this event type
    await this.templateModel.updateMany(
      { template_type: template.template_type },
      { $set: { is_active: false } },
    );

    // Activate the targeted template
    template.is_active = true;
    await template.save();

    this.logger.log(`Activated email template "${template.template_name}" (${template._id}) for ${template.template_type}`);
    return template;
  }

  /**
   * Clones a template as a new draft
   */
  async cloneTemplate(id: string, createdBy = 'ADMIN') {
    const original = await this.getTemplateById(id);

    const clone = await this.templateModel.create({
      _id: uuidv4(),
      template_key: `${original.template_type}_COPY_${Date.now().toString().slice(-4)}`,
      template_name: `Copy of ${original.template_name}`,
      template_type: original.template_type,
      subject_template: original.subject_template,
      html_template: original.html_template,
      design_json: original.design_json || null,
      allowed_variables: original.allowed_variables,
      is_active: false, // New copies start as drafts
      is_default: false,
      is_deleted: false,
      created_by: createdBy,
    });

    return clone;
  }

  /**
   * Deletes a template (prevents deleting active default if only 1 exists)
   */
  async deleteTemplate(id: string) {
    const template = await this.templateModel.findById(id);
    if (!template || template.is_deleted) {
      throw new NotFoundException(`Email template "${id}" not found`);
    }

    if (template.is_default && template.is_active) {
      const otherActive = await this.templateModel.exists({
        template_type: template.template_type,
        _id: { $ne: template._id as any },
        is_deleted: false,
      });
      if (!otherActive) {
        throw new BadRequestException('Cannot delete the sole active template for this event type.');
      }
    }

    template.is_deleted = true;
    template.is_active = false;
    await template.save();

    return { message: `Email template "${template.template_name}" deleted successfully` };
  }

  /**
   * Sends a live test email using dummy/custom interpolated variables
   */
  async sendTestEmail(id: string, dto: SendTestEmailDto) {
    const template = await this.getTemplateById(id);

    // Build sample data dictionary from allowed_variables examples
    const sampleData: Record<string, string> = {};
    for (const v of template.allowed_variables || []) {
      sampleData[v.name] = v.example || `[${v.name}]`;
    }

    // Merge with any custom variables provided
    const mergedData = { ...sampleData, ...(dto.custom_variables || {}) };

    const renderedSubject = this.interpolate(template.subject_template, mergedData);
    const renderedHtml = this.interpolate(template.html_template, mergedData);

    const mailPayload = {
      to: dto.recipient_email,
      subject: `[TEST] ${renderedSubject}`,
      html: renderedHtml,
      text: `Test email preview for ${template.template_name}:\n\n${renderedSubject}\n\n(HTML version sent)`,
    };

    this.mailService.sendInBackground(mailPayload);

    return {
      success: true,
      recipient: dto.recipient_email,
      rendered_subject: renderedSubject,
      message: `Test email successfully dispatched to ${dto.recipient_email}`,
    };
  }

  /**
   * Look up the currently active template for an event type (used by MailService)
   */
  async getActiveTemplate(type: EmailTemplateType): Promise<EmailTemplateDocument | null> {
    return this.templateModel.findOne({
      template_type: type,
      is_active: true,
      is_deleted: false,
    }).exec();
  }

  /**
   * Simple mustache-style string interpolation: {{variable}}
   */
  interpolate(template: string, data: Record<string, any>): string {
    if (!template) return '';
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return data[key] !== undefined && data[key] !== null ? String(data[key]) : `{{${key}}}`;
    });
  }
}
