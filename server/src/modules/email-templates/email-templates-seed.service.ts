import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EmailTemplate, EmailTemplateDocument } from './schemas/email-template.schema';
import { EmailTemplateType, EMAIL_TEMPLATE_TYPES_META } from './enums/email-template-type.enum';

@Injectable()
export class EmailTemplatesSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EmailTemplatesSeedService.name);

  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplateDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultTemplates();
  }

  async seedDefaultTemplates() {
    try {
      const existingCount = await this.templateModel.countDocuments({ is_deleted: false });
      if (existingCount > 0) {
        this.logger.log(`Email templates catalog populated (${existingCount} templates). Skipping seed.`);
        return;
      }

      this.logger.log('Seeding default transactional email templates catalog...');

      const defaultTemplates = this.getDefaultTemplateDefinitions();
      for (const tpl of defaultTemplates) {
        await this.templateModel.create(tpl);
      }

      this.logger.log(`Successfully seeded ${defaultTemplates.length} default email templates.`);
    } catch (err: any) {
      this.logger.error(`Failed to seed default email templates: ${err?.message}`);
    }
  }

  private getDefaultTemplateDefinitions() {
    return [
      // 1. User Invitation Email (Exact reference from user prompt)
      {
        _id: 'c91cdef6-7ef6-4e11-a20b-1299347ae641',
        template_key: 'USER_INVITATION_DEFAULT',
        template_name: 'User Invitation Email',
        template_type: EmailTemplateType.USER_INVITATION,
        subject_template: "You're invited to join {{company_name}}",
        html_template: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>You're Invited to Join {{company_name}}</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--></head><body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;"><tr><td align="center" valign="top" style="padding: 20px 0;"><table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><tr><td style="background-color: #4A90E2; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="text-align: center;"><h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 10px 0; font-family: Arial, sans-serif;">{{company_name}}</h1><h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; font-family: Arial, sans-serif;">You're Invited to Join Our Team!</h2></td></tr></table></td></tr><tr><td style="padding: 40px 30px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding-bottom: 20px;"><h3 style="color: #333333; font-size: 20px; font-weight: 600; margin: 0; font-family: Arial, sans-serif;">Hello {{name}},</h3></td></tr><tr><td style="padding-bottom: 30px;"><p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; font-family: Arial, sans-serif;">Great news! <strong>{{sender_name}}</strong> has invited you to join <strong style="color: #4A90E2;">{{company_name}}</strong>. We're excited to have you as part of our team and can't wait for you to get started.</p><p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0; font-family: Arial, sans-serif;">You've been invited to join with the following access:</p></td></tr><tr><td style="background-color: #f8f9fa; border: 2px solid #4A90E2; border-radius: 8px; padding: 25px; margin: 25px 0;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td><h4 style="color: #4A90E2; font-size: 18px; font-weight: bold; margin: 0 0 15px 0; font-family: Arial, sans-serif;">Your Access Details</h4><table cellpadding="8" cellspacing="0" border="0" width="100%"><tr><td style="color: #333333; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif; width: 80px;">Email:</td><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif;">{{email}}</td></tr><tr><td style="color: #333333; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif; width: 80px;">Groups:</td><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif;">{{groups}}</td></tr><tr><td style="color: #333333; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif; width: 80px;">Roles:</td><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif;">{{roles}}</td></tr></table></td></tr></table></td></tr><tr><td style="text-align: center; padding: 30px 0;"><table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;"><tr><td style="background-color: #4A90E2; border-radius: 30px; padding: 0;"><a href="{{invitation_link}}" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 18px; padding: 16px 40px; display: block; border-radius: 30px; font-family: Arial, sans-serif;">Accept Invitation &amp; Get Started</a></td></tr></table></td></tr><tr><td style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;"><p style="color: #856404; font-size: 16px; font-weight: bold; margin: 0; font-family: Arial, sans-serif;">Important: This invitation will expire on <span style="color: #d9534f;">{{expiry_date}}</span> ({{expiry_days}} days remaining). Please complete your registration before this date.</p></td></tr><tr><td style="padding: 30px 0;"><hr style="border: none; border-top: 1px solid #e9ecef; margin: 0;"></td></tr><tr><td><h4 style="color: #333333; font-size: 18px; font-weight: bold; margin: 0 0 15px 0; font-family: Arial, sans-serif;">What happens next?</h4><table cellpadding="8" cellspacing="0" border="0" width="100%"><tr><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif; vertical-align: top; width: 30px;">1.</td><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif;">Click the button above to accept your invitation</td></tr><tr><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif; vertical-align: top; width: 30px;">2.</td><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif;">Set up your password and complete your profile</td></tr><tr><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif; vertical-align: top; width: 30px;">3.</td><td style="color: #555555; font-size: 16px; font-family: Arial, sans-serif;">Start exploring {{company_name}} and connecting with your team</td></tr></table><p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; font-family: Arial, sans-serif;">If you have any questions or need assistance, please reach out to our support team at <a href="mailto:{{support_email}}" style="color: #4A90E2; text-decoration: none;">{{support_email}}</a>.</p><p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 20px 0 0 0; font-family: Arial, sans-serif;">If the button doesn't work, copy and paste this link into your browser:<br><span style="word-break: break-all; color: #4A90E2;">{{invitation_link}}</span></p></td></tr></table></td></tr><tr><td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="text-align: center;"><p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">&copy; {{current_year}} {{company_name}}. All rights reserved.</p><p style="color: #6c757d; font-size: 14px; margin: 0 0 15px 0; font-family: Arial, sans-serif;"><a href="{{login_url}}" style="color: #4A90E2; text-decoration: none;">Login</a> | <a href="mailto:{{support_email}}" style="color: #4A90E2; text-decoration: none;">Support</a></p><p style="color: #adb5bd; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">You received this email because you were invited to join {{company_name}}.<br>If you believe this was sent in error, please ignore this email or contact support.</p></td></tr></table></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.USER_INVITATION].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 2. Send OTP Email
      {
        _id: 'a12b3c4d-5e6f-4a1b-8c2d-9e0f1a2b3c4d',
        template_key: 'SEND_OTP_DEFAULT',
        template_name: 'OTP Verification Passcode',
        template_type: EmailTemplateType.SEND_OTP,
        subject_template: '{{otp}} is your {{company_name}} verification code',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"><tr><td style="background: #2A3B5C; padding: 28px 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">{{company_name}}</h1><p style="color: #94a3b8; font-size: 14px; margin: 6px 0 0 0;">One-Time Verification Passcode</p></td></tr><tr><td style="padding: 36px 32px;"><h3 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0;">Hello {{name}},</h3><p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">We received a request to verify your email address. Enter the following One-Time Password (OTP) to continue:</p><div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 24px 16px; text-align: center; margin: 24px 0;"><span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #0f172a; display: block;">{{otp}}</span><span style="display: block; font-size: 12px; color: #64748b; margin-top: 8px;">Valid for {{expiry_minutes}} minutes</span></div><p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 20px 0 0 0;">For your security, never share this code with anyone. If you did not initiate this request, you can safely ignore this email.</p></td></tr><tr><td style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.SEND_OTP].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 3. Email Verification
      {
        _id: 'b23c4d5e-6f7a-4b2c-9d3e-0f1a2b3c4d5e',
        template_key: 'EMAIL_VERIFICATION_DEFAULT',
        template_name: 'Account Email Verification',
        template_type: EmailTemplateType.EMAIL_VERIFICATION,
        subject_template: 'Verify your {{company_name}} email address',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #0f172a; padding: 28px 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">{{company_name}}</h1></td></tr><tr><td style="padding: 36px 32px;"><h2 style="color: #0f172a; font-size: 20px; margin: 0 0 16px 0;">Verify your email address</h2><p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Hi {{name}},<br/>Thank you for creating an account with {{company_name}}. Please confirm your email address by clicking the button below:</p><div style="text-align: center; margin: 32px 0;"><a href="{{verification_link}}" style="background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 6px; display: inline-block;">Verify Email Address</a></div><p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0; word-break: break-all;">Or copy and paste this URL into your browser:<br/>{{verification_link}}</p></td></tr><tr><td style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}. Need help? Contact <a href="mailto:{{support_email}}" style="color: #2563eb;">{{support_email}}</a></p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.EMAIL_VERIFICATION].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 4. Password Reset
      {
        _id: 'c34d5e6f-7a8b-4c3d-0e4f-1a2b3c4d5e6f',
        template_key: 'PASSWORD_RESET_DEFAULT',
        template_name: 'Password Reset Request',
        template_type: EmailTemplateType.PASSWORD_RESET,
        subject_template: 'Reset your {{company_name}} password',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #2A3B5C; padding: 28px 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">{{company_name}}</h1></td></tr><tr><td style="padding: 36px 32px;"><h2 style="color: #0f172a; font-size: 20px; margin: 0 0 16px 0;">Reset your password</h2><p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Hi {{name}},<br/>We received a request to reset your password. Click the button below to choose a new password. This link is valid for {{expiry_hours}} hour(s).</p><div style="text-align: center; margin: 32px 0;"><a href="{{reset_link}}" style="background: #dc2626; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 6px; display: inline-block;">Reset Password</a></div><p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">If you didn't request a password reset, no further action is required; your password will remain secure and unchanged.</p></td></tr><tr><td style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}</p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.PASSWORD_RESET].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 5. Order Confirmation
      {
        _id: 'd45e6f7a-8b9c-4d4e-1f5a-2b3c4d5e6f7a',
        template_key: 'ORDER_CONFIRMATION_DEFAULT',
        template_name: 'Order Confirmation Email',
        template_type: EmailTemplateType.ORDER_CONFIRMATION,
        subject_template: 'Order Confirmed: #{{order_number}} - {{company_name}}',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #2A3B5C; padding: 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">{{company_name}}</h1><p style="color: #cbd5e1; font-size: 15px; margin: 6px 0 0 0;">Thank you for your order!</p></td></tr><tr><td style="padding: 32px;"><div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; color: #065f46; font-size: 14px;"><strong>Order Confirmed!</strong> We are getting order <strong>#{{order_number}}</strong> ready for shipment.</div><p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">Hi <strong>{{name}}</strong>,<br/>Thank you for shopping with us! Here is your order breakdown:</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px; color: #334155;"><strong style="display: block; margin-bottom: 6px; color: #0f172a; font-size: 14px;">Order Summary</strong><div>Order Number: <strong>#{{order_number}}</strong></div><div>Order Date: {{order_date}}</div><div>Payment: {{payment_method}}</div><div>Shipping Address: {{shipping_address}}</div></div><div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 20px 0;"><table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #334155;"><tr><td style="padding: 4px 0;">Subtotal:</td><td style="text-align: right; font-weight: 600;">{{subtotal}}</td></tr><tr><td style="padding: 4px 0;">Shipping:</td><td style="text-align: right; font-weight: 600;">{{shipping_fee}}</td></tr><tr><td style="padding: 4px 0;">Estimated Tax:</td><td style="text-align: right; font-weight: 600;">{{tax_amount}}</td></tr><tr style="border-top: 1px solid #cbd5e1;"><td style="padding: 10px 0 4px; font-size: 16px; font-weight: 700; color: #0f172a;">Grand Total:</td><td style="text-align: right; font-size: 18px; font-weight: 800; color: #2A3B5C;">{{grand_total}}</td></tr></table></div><div style="text-align: center; margin: 30px 0;"><a href="{{tracking_link}}" style="background: #2A3B5C; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; display: inline-block;">View Order in Account</a></div></td></tr><tr><td style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}. Support: <a href="mailto:{{support_email}}" style="color: #2A3B5C;">{{support_email}}</a></p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.ORDER_CONFIRMATION].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 6. Order Status Update
      {
        _id: 'e56f7a8b-9c0d-4e5f-2a6b-3c4d5e6f7a8b',
        template_key: 'ORDER_STATUS_UPDATE_DEFAULT',
        template_name: 'Order Status & Tracking',
        template_type: EmailTemplateType.ORDER_STATUS_UPDATE,
        subject_template: 'Update on Order #{{order_number}}: {{status_label}} - {{company_name}}',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #2A3B5C; padding: 28px 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">{{company_name}}</h1></td></tr><tr><td style="padding: 32px;"><div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin-bottom: 24px; color: #1e40af;"><strong style="font-size: 16px; display: block; margin-bottom: 4px;">{{status_label}}</strong><span>Your package is on its way with updated fulfillment details.</span></div><p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">Hi {{name}},<br/>Your order <strong>#{{order_number}}</strong> has an update:</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #334155;"><strong style="display: block; margin-bottom: 8px; color: #0f172a; font-size: 14px;">Shipment &amp; Tracking Details</strong><div>Courier: <strong>{{courier_name}}</strong></div><div>Tracking Number: <strong>{{tracking_number}}</strong></div></div><div style="text-align: center; margin: 30px 0;"><a href="{{tracking_link}}" style="background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; display: inline-block;">Track Package Online</a></div></td></tr><tr><td style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}</p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.ORDER_STATUS_UPDATE].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 7. Low Stock Alert
      {
        _id: 'f67a8b9c-0d1e-4f6a-3b7c-4d5e6f7a8b9c',
        template_key: 'LOW_STOCK_ALERT_DEFAULT',
        template_name: 'Low Stock Inventory Warning',
        template_type: EmailTemplateType.LOW_STOCK_ALERT,
        subject_template: '[Inventory Alert] Low Stock: {{product_name}} ({{remaining_stock}} units left)',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #991b1b; padding: 24px 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">⚠️ Low Stock Inventory Alert</h1></td></tr><tr><td style="padding: 32px;"><p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">Hello Store Administrator,</p><p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">The following catalog item has dropped to or below its minimum inventory threshold:</p><div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 18px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #92400e;"><div><strong>Product:</strong> {{product_name}}</div><div><strong>SKU:</strong> {{sku}}</div><div><strong>Current Stock:</strong> <span style="font-weight: 800; font-size: 15px; color: #dc2626;">{{remaining_stock}} units</span></div><div><strong>Alert Threshold:</strong> {{threshold}} units</div></div><div style="text-align: center; margin: 28px 0;"><a href="{{admin_url}}" style="background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; display: inline-block;">Restock in Admin Console</a></div></td></tr><tr><td style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">Automated alert from {{company_name}}</p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.LOW_STOCK_ALERT].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 8. Return Status Update
      {
        _id: 'a78b9c0d-1e2f-4a7b-4c8d-5e6f7a8b9c0d',
        template_key: 'RETURN_STATUS_UPDATE_DEFAULT',
        template_name: 'Return Request Status Update',
        template_type: EmailTemplateType.RETURN_STATUS_UPDATE,
        subject_template: 'Return Request #{{return_number}} Update: {{status_label}} - {{company_name}}',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #2A3B5C; padding: 28px 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">{{company_name}}</h1></td></tr><tr><td style="padding: 32px;"><div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px; margin-bottom: 24px; color: #065f46;"><strong style="font-size: 16px; display: block; margin-bottom: 4px;">Return Status: {{status_label}}</strong><span>Update regarding return request #{{return_number}} for order #{{order_number}}.</span></div><p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">Hi {{name}},</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #334155;"><div><strong>Return Number:</strong> #{{return_number}}</div><div><strong>Order Number:</strong> #{{order_number}}</div><div><strong>Refund Amount:</strong> <strong style="color: #0f172a; font-size: 15px;">{{refund_amount}}</strong></div></div><div style="text-align: center; margin: 30px 0;"><a href="{{portal_link}}" style="background: #2A3B5C; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; display: inline-block;">View Return Details</a></div></td></tr><tr><td style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}. Support: <a href="mailto:{{support_email}}" style="color: #2A3B5C;">{{support_email}}</a></p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.RETURN_STATUS_UPDATE].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },

      // 9. Welcome Customer
      {
        _id: 'b89c0d1e-2f3a-4b8c-5d9e-6f7a8b9c0d1e',
        template_key: 'WELCOME_CUSTOMER_DEFAULT',
        template_name: 'Customer Welcome Onboarding',
        template_type: EmailTemplateType.WELCOME_CUSTOMER,
        subject_template: 'Welcome to {{company_name}}, {{name}}! 🛍️',
        html_template: `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #2A3B5C; padding: 36px 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 30px; font-weight: 800; margin: 0; letter-spacing: 1px;">Welcome to {{company_name}}!</h1><p style="color: #cbd5e1; font-size: 15px; margin: 8px 0 0 0;">We're thrilled to have you with us.</p></td></tr><tr><td style="padding: 36px 32px;"><h3 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0;">Hello {{name}},</h3><p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">Welcome to our premier online destination! Explore trending products, curated collections, and exclusive discounts crafted just for you.</p><div style="text-align: center; margin: 32px 0;"><a href="{{shop_url}}" style="background: #2A3B5C; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 36px; border-radius: 30px; display: inline-block;">Start Shopping Now &rarr;</a></div></td></tr><tr><td style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}</p></td></tr></table></td></tr></table></body></html>`,
        allowed_variables: EMAIL_TEMPLATE_TYPES_META[EmailTemplateType.WELCOME_CUSTOMER].allowedVariables,
        is_active: true,
        is_default: true,
        is_deleted: false,
        created_by: 'SYSTEM',
      },
    ];
  }
}
