/**
 * Verification email template
 * Used for login and account verification
 */

type VerificationParams = {
  verificationCode: string;
  url: string;
  host: string;
};

/**
 * Generate the subject line for verification emails
 */
export function getVerificationSubject(params: VerificationParams): string {
  return `Your verification code for sealed.love`;
}

/**
 * Generate the plain text content for verification emails
 */
export function getVerificationText(params: VerificationParams): string {
  const { verificationCode, url } = params;
  
  return `Your verification code is: ${verificationCode}

Enter this 6-digit code in the verification screen.

Or click this link to sign in: ${url}

This code and link will expire in 10 minutes.`;
}

/**
 * Generate the HTML content for verification emails
 */
export function getVerificationHtml(params: VerificationParams): string {
  const { verificationCode, url } = params;
  
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; background-color: #ffffff;">
      <!-- Header with logo/brand -->
      <div style="background-color: #4a6cf7; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-weight: 600; font-size: 24px;">sealed.love</h1>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px; background-color: #ffffff; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea;">
        <h2 style="color: #333; margin-top: 0; margin-bottom: 24px; font-weight: 600; font-size: 20px;">Verify your email</h2>
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">To complete your sign in, please use one of the following methods:</p>
        
        <!-- Verification code section -->
        <div style="background-color: #f9f9fb; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #eaeaea;">
          <p style="font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #333;">Enter this verification code</p>
          <div style="background-color: white; padding: 16px; font-size: 28px; text-align: center; letter-spacing: 8px; font-weight: 600; margin: 16px 0; border-radius: 8px; border: 1px solid #eaeaea; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            ${verificationCode}
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 0;">Type this code in the verification screen.</p>
        </div>
        
        <!-- Magic link section -->
        <div style="text-align: center; margin-bottom: 32px;">
          <p style="font-weight: 600; margin-bottom: 16px; color: #333;">Or use this magic link</p>
          <a href="${url}" style="display: inline-block; background-color: #4a6cf7; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(74, 108, 247, 0.25);">
            Sign in to sealed.love
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px; line-height: 1.5;">This verification code and link will expire in 10 minutes for security reasons.</p>
      </div>
      
      <!-- Footer -->
      <div style="padding: 24px 40px; text-align: center; background-color: #f9f9fb; border-radius: 0 0 8px 8px; border: 1px solid #eaeaea; border-top: none;">
        <p style="color: #666; font-size: 13px; margin: 0;">If you didn't request this email, you can safely ignore it.</p>
        <p style="color: #666; font-size: 13px; margin-top: 8px; margin-bottom: 0;">&copy; ${new Date().getFullYear()} sealed.love. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Complete verification email template
 */
export const verificationEmail = {
  subject: getVerificationSubject,
  text: getVerificationText,
  html: getVerificationHtml
};
