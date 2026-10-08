import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { mailConfig, MailConfig } from '../../config/mail.config';
import { appConfig, AppConfig } from '../../config/app.config';
import { OutgoingMail } from './mail.types';
import {
  orderConfirmationTemplate,
  orderStatusChangedTemplate,
  lowStockAlertTemplate,
  returnStatusChangedTemplate,
} from './templates/ecommerce.templates';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(
    @Inject(mailConfig.KEY) private readonly config: MailConfig,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
  ) {}

  onModuleInit(): void {
    if (!this.config.enabled) {
      this.logger.warn('SMTP_HOST is not set: emails will be written to the log instead of being sent.');
      return;
    }
    this.transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.user ? { user: this.config.user, pass: this.config.pass } : undefined,
    });
  }

  async send(mail: OutgoingMail): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[DEV MAIL] To: ${mail.to} | Subject: ${mail.subject}\n${mail.text}`);
      return;
    }
    await this.transporter.sendMail({ from: this.config.from, ...mail });
  }

  /**
   * Send without blocking the request. Failures are logged, never surfaced,
   * so response timing cannot reveal whether an email address exists.
   */
  sendInBackground(mail: OutgoingMail): void {
    this.send(mail).catch((error: Error) =>
      this.logger.error(`Failed to send "${mail.subject}" to ${mail.to}: ${error.message}`),
    );
  }

  /**
   * Dispatches order confirmation email with itemized breakdown to customer.
   */
  sendOrderConfirmation(order: any, currencySymbol = '$'): void {
    const to = order?.customerEmail;
    if (!to) {
      this.logger.warn(`Cannot send order confirmation: Missing customerEmail for order ${order?.orderNumber}`);
      return;
    }
    const template = orderConfirmationTemplate(this.app.name, this.app.clientUrl, order, currencySymbol);
    this.sendInBackground({ to, ...template });
  }

  /**
   * Dispatches order fulfillment / status change notification to customer.
   */
  sendOrderStatusUpdate(order: any, newStatus: string, currencySymbol = '$'): void {
    const to = order?.customerEmail;
    if (!to) {
      this.logger.warn(`Cannot send status update: Missing customerEmail for order ${order?.orderNumber}`);
      return;
    }
    const template = orderStatusChangedTemplate(this.app.name, this.app.clientUrl, order, newStatus, currencySymbol);
    this.sendInBackground({ to, ...template });
  }

  /**
   * Dispatches low-stock warning notification to store admin.
   */
  sendLowStockAlert(
    product: any,
    remainingStock: number,
    adminEmail: string,
    variantTitle?: string | null,
  ): void {
    if (!adminEmail) {
      this.logger.warn(`Cannot send low stock alert: Missing adminEmail for product ${product?.name}`);
      return;
    }
    const template = lowStockAlertTemplate(this.app.name, this.app.adminUrl, product, remainingStock, variantTitle);
    this.sendInBackground({ to: adminEmail, ...template });
  }

  /**
   * Dispatches return request status update notification to customer.
   */
  sendReturnStatusUpdate(returnReq: any, currencySymbol = '$'): void {
    const to = returnReq?.customerEmail;
    if (!to) {
      this.logger.warn(`Cannot send return status update: Missing customerEmail for return ${returnReq?.returnNumber}`);
      return;
    }
    const template = returnStatusChangedTemplate(this.app.name, this.app.clientUrl, returnReq, currencySymbol);
    this.sendInBackground({ to, ...template });
  }
}

