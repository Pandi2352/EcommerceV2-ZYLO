import { api, unwrap } from '@shared/api/client';

export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export interface EmailTemplateTypeMeta {
  type: string;
  label: string;
  category: 'AUTH' | 'ORDERS' | 'INVENTORY' | 'STAFF' | 'CUSTOMER';
  description: string;
  defaultSubject: string;
  allowedVariables: TemplateVariable[];
}

export interface EmailTemplate {
  _id: string;
  template_key: string;
  template_name: string;
  template_type: string;
  subject_template: string;
  html_template: string;
  design_json?: Record<string, any> | null;
  allowed_variables: TemplateVariable[];
  is_active: boolean;
  is_default: boolean;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QueryTemplatesParams {
  type?: string;
  search?: string;
  active?: string;
}

export interface CreateTemplatePayload {
  template_name: string;
  template_type: string;
  subject_template: string;
  html_template: string;
  design_json?: Record<string, any>;
  allowed_variables?: TemplateVariable[];
  is_active?: boolean;
}

export interface UpdateTemplatePayload {
  template_name?: string;
  subject_template?: string;
  html_template?: string;
  design_json?: Record<string, any>;
  allowed_variables?: TemplateVariable[];
  is_active?: boolean;
}

export interface SendTestEmailPayload {
  recipient_email: string;
  custom_variables?: Record<string, any>;
  custom_html?: string;
  custom_subject?: string;
}

export const emailTemplatesService = {
  /**
   * Retrieves list of all email templates
   */
  async getTemplates(params?: QueryTemplatesParams): Promise<EmailTemplate[]> {
    return unwrap<EmailTemplate[]>(api.get('/admin/email-templates', { params }));
  },

  /**
   * Retrieves all supported event types and variable definitions
   */
  async getTemplateTypes(): Promise<EmailTemplateTypeMeta[]> {
    return unwrap<EmailTemplateTypeMeta[]>(api.get('/admin/email-templates/types'));
  },

  /**
   * Retrieves single email template by ID
   */
  async getTemplateById(id: string): Promise<EmailTemplate> {
    return unwrap<EmailTemplate>(api.get(`/admin/email-templates/${id}`));
  },

  /**
   * Creates a new email template
   */
  async createTemplate(payload: CreateTemplatePayload): Promise<EmailTemplate> {
    return unwrap<EmailTemplate>(api.post('/admin/email-templates', payload));
  },

  /**
   * Updates an existing email template
   */
  async updateTemplate(id: string, payload: UpdateTemplatePayload): Promise<EmailTemplate> {
    return unwrap<EmailTemplate>(api.put(`/admin/email-templates/${id}`, payload));
  },

  /**
   * Sets a template as the active template for its event type
   */
  async activateTemplate(id: string): Promise<EmailTemplate> {
    return unwrap<EmailTemplate>(api.patch(`/admin/email-templates/${id}/activate`));
  },

  /**
   * Clones a template as a draft
   */
  async cloneTemplate(id: string): Promise<EmailTemplate> {
    return unwrap<EmailTemplate>(api.post(`/admin/email-templates/${id}/clone`));
  },

  /**
   * Sends a live test email preview to an address
   */
  async sendTestEmail(id: string, payload: SendTestEmailPayload): Promise<{ message: string; recipient: string }> {
    return unwrap<{ message: string; recipient: string }>(api.post(`/admin/email-templates/${id}/send-test`, payload));
  },

  /**
   * Soft deletes an email template
   */
  async deleteTemplate(id: string): Promise<void> {
    await unwrap<void>(api.delete(`/admin/email-templates/${id}`));
  },
};
