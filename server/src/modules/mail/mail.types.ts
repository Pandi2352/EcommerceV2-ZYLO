export interface MailMessage {
  subject: string;
  html: string;
  text: string;
}

export interface OutgoingMail extends MailMessage {
  to: string;
}
