/**
 * Email utilities and template management
 * This file exports functions for sending and managing email templates
 */

import { verificationEmail } from '@/lib/emails/templates/verification';
import { deletionVerificationEmail } from '@/lib/emails/templates/deletionVerification';
import { welcomeEmail } from '@/lib/emails/templates/welcome';
import { storyStoredEmail } from '@/lib/emails/templates/storyStored';

/**
 * Available email templates
 */
export const emailTemplates = {
  verification: verificationEmail,
  deletionVerification: deletionVerificationEmail,
  welcome: welcomeEmail,
  storyStored: storyStoredEmail
};

/**
 * Email template types
 */
export type EmailTemplate = {
  subject: (params: any) => string;
  text: (params: any) => string;
  html: (params: any) => string;
};

/**
 * Get an email template by name
 * 
 * @param templateName The name of the template to get
 * @returns The email template
 */
export function getEmailTemplate(templateName: keyof typeof emailTemplates): EmailTemplate {
  return emailTemplates[templateName];
}
