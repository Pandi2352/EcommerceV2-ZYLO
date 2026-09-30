import { MailMessage } from '../mail.types';
import { LayoutOptions, renderLayout, renderText } from './layout.template';

function build(subject: string, layout: LayoutOptions): MailMessage {
  return { subject, html: renderLayout(layout), text: renderText(layout) };
}

export function verifyEmailTemplate(appName: string, name: string, url: string): MailMessage {
  return build(`Verify your ${appName} email address`, {
    appName,
    heading: 'Confirm your email address',
    paragraphs: [`Hi ${name},`, 'Please confirm this is your email address to finish setting up your account.'],
    action: { label: 'Verify email', url },
    footnote: 'This link expires in 24 hours. If you did not create an account, you can ignore this email.',
  });
}

export function passwordResetTemplate(appName: string, name: string, url: string): MailMessage {
  return build(`Reset your ${appName} password`, {
    appName,
    heading: 'Reset your password',
    paragraphs: [`Hi ${name},`, 'We received a request to reset your password. Use the button below to choose a new one.'],
    action: { label: 'Reset password', url },
    footnote: 'This link expires in 1 hour. If you did not request a reset, you can ignore this email; your password will not change.',
  });
}

export function passwordChangedTemplate(appName: string, name: string): MailMessage {
  return build(`Your ${appName} password was changed`, {
    appName,
    heading: 'Your password was changed',
    paragraphs: [
      `Hi ${name},`,
      'The password for your account was just changed and all other sessions were signed out.',
      'If you did not make this change, reset your password immediately and contact support.',
    ],
  });
}

export function mfaStatusTemplate(appName: string, name: string, enabled: boolean): MailMessage {
  const state = enabled ? 'enabled' : 'disabled';
  return build(`Two-factor authentication ${state} on your ${appName} account`, {
    appName,
    heading: `Two-factor authentication ${state}`,
    paragraphs: [
      `Hi ${name},`,
      `Two-factor authentication was just ${state} on your account.`,
      'If you did not make this change, reset your password immediately and contact support.',
    ],
  });
}

export function staffInvitationTemplate(
  appName: string,
  inviterName: string,
  roleName: string,
  url: string,
): MailMessage {
  return build(`You have been invited to join ${appName} as ${roleName}`, {
    appName,
    heading: 'Team Invitation',
    paragraphs: [
      `Hello,`,
      `${inviterName} has invited you to join the ${appName} administration console as a ${roleName}.`,
      'Click the button below to accept your invitation, set your account credentials, and begin collaborating.',
    ],
    action: { label: 'Accept Invitation', url },
    footnote: 'This invitation link expires in 7 days. If you were not expecting this invitation, please ignore this email.',
  });
}

