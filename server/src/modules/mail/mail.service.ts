import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { mailConfig, MailConfig } from '../../config/mail.config';
import { OutgoingMail } from './mail.types';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(@Inject(mailConfig.KEY) private readonly config: MailConfig) {}

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
}
