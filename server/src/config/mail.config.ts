import { registerAs } from '@nestjs/config';
import { optionalEnv } from '../common/utils/env.util';

/**
 * SMTP settings. When SMTP_HOST is unset, emails are written to the server log
 * instead of being sent (useful for local development).
 */
export const mailConfig = registerAs('mail', () => {
  const host = optionalEnv('SMTP_HOST');
  return {
    enabled: Boolean(host),
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: optionalEnv('SMTP_USER'),
    pass: optionalEnv('SMTP_PASS'),
    from: process.env.MAIL_FROM || 'ZYLO <no-reply@zylo.local>',
  };
});

export type MailConfig = ReturnType<typeof mailConfig>;
