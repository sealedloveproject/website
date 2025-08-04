/**
 * Account Deletion Verification email template
 * Used for verifying account deletion requests
 */

type DeletionVerificationParams = {
  verificationCode: string;
  userName?: string;
};

/**
 * Generate the subject line for account deletion verification emails
 */
export function getDeletionVerificationSubject(): string {
  return `Account Deletion Verification - sealed.love`;
}

/**
 * Generate the plain text content for account deletion verification emails
 */
export function getDeletionVerificationText(params: DeletionVerificationParams): string {
  const { verificationCode, userName } = params;
  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  
  return `${greeting}

You've requested to delete your sealed.love account. To confirm this action, please use the verification code below:

Your verification code is: ${verificationCode}

This code will expire in 10 minutes.

If you did not request to delete your account, please secure your account by changing your password immediately and contact support.`;
}

/**
 * Generate the HTML content for account deletion verification emails
 */
export function getDeletionVerificationHtml(params: DeletionVerificationParams): string {
  const { verificationCode, userName } = params;
  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; background-color: #ffffff;">
      <!-- Header with logo/brand -->
      <div style="background-color: #e53935; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-weight: 600; font-size: 24px;">sealed.love</h1>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px; background-color: #ffffff; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea;">
        <h2 style="color: #333; margin-top: 0; margin-bottom: 24px; font-weight: 600; font-size: 20px;">Account Deletion Verification</h2>
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">${greeting}</p>
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">You've requested to delete your sealed.love account. To confirm this action, please use the verification code below:</p>
        
        <!-- Verification code section -->
        <div style="background-color: #f9f9fb; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #eaeaea;">
          <p style="font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #333;">Your verification code</p>
          <div style="background-color: white; padding: 16px; font-size: 28px; text-align: center; letter-spacing: 8px; font-weight: 600; margin: 16px 0; border-radius: 8px; border: 1px solid #eaeaea; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            ${verificationCode}
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 0;">Enter this code in the account deletion confirmation dialog.</p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px; line-height: 1.5;">This verification code will expire in 10 minutes for security reasons.</p>
        
        <div style="margin-top: 32px; padding: 16px; background-color: #fff8e1; border-left: 4px solid #ffc107; border-radius: 4px;">
          <p style="margin: 0; color: #795548; font-weight: 500;">Security Notice</p>
          <p style="margin-top: 8px; margin-bottom: 0; color: #795548; font-size: 14px;">If you did not request to delete your account, please secure your account by changing your password immediately and contact support.</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding: 24px 40px; text-align: center; background-color: #f9f9fb; border-radius: 0 0 8px 8px; border: 1px solid #eaeaea; border-top: none;">
        <p style="color: #666; font-size: 13px; margin-top: 8px; margin-bottom: 0;">&copy; ${new Date().getFullYear()} sealed.love. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Complete account deletion verification email template
 */
export const deletionVerificationEmail = {
  subject: getDeletionVerificationSubject,
  text: getDeletionVerificationText,
  html: getDeletionVerificationHtml
};
