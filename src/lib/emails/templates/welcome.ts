/**
 * Welcome email template
 * Sent to users after their first successful login
 */

type WelcomeParams = {
  name?: string; // User's name if available
  email: string;
};

/**
 * Generate the subject line for welcome emails
 */
export function getWelcomeSubject(params: WelcomeParams): string {
  return `Welcome to sealed.love!`;
}

/**
 * Generate the plain text content for welcome emails
 */
export function getWelcomeText(params: WelcomeParams): string {
  const { name, email } = params;
  const greeting = name ? `Hi ${name}` : `Hi there`;
  
  return `${greeting},

I'm Alex, and I'm genuinely excited to welcome you to sealed.love!

This isn't just another app or service - it's our passion project and gift to humanity. In a world of uncertainty and rapid change, we believe LOVE remains our most powerful constant.

Your account (${email}) is now ready for you to create time capsules of emotion - secure vaults that preserve your most precious love stories for generations to come.

In this digital age where memories can feel fleeting, we're offering something permanent. The stories you share today will endure through whatever the future holds.

We've built this with care and purpose, and we're honored that you've chosen to be part of this journey with us.

Be kind, be honest, be human!

Alex`;
}

/**
 * Generate the HTML content for welcome emails
 */
export function getWelcomeHtml(params: WelcomeParams): string {
  const { name, email } = params;
  const greeting = name ? `Hi ${name}` : `Hi there`;
  
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; background-color: #ffffff;">
      <!-- Header with logo/brand -->
      <div style="background-color: #4a6cf7; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-weight: 600; font-size: 24px;">sealed.love</h1>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px; background-color: #ffffff; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea;">
        <h2 style="color: #333; margin-top: 0; margin-bottom: 24px; font-weight: 600; font-size: 20px;">${greeting}</h2>
        
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">I'm Alex, and I'm genuinely excited to welcome you to sealed.love!</p>
        
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">This isn't just another app or service - it's our passion project and gift to humanity. In a world of uncertainty and rapid change, we believe LOVE remains our most powerful constant.</p>
        
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">Your account (<strong>${email}</strong>) is now ready for you to create time capsules of emotion - secure vaults that preserve your most precious love stories for generations to come.</p>
        
        <div style="background-color: #f9f9fb; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #eaeaea;">
          <h3 style="margin-top: 0; color: #333; font-size: 18px;">With sealed.love, you can:</h3>
          <ul style="color: #555; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Create sealed messages that transcend time</li>
            <li style="margin-bottom: 8px;">Preserve your most precious emotions and memories</li>
            <li style="margin-bottom: 8px;">Share your love in ways that will endure for generations</li>
            <li style="margin-bottom: 0;">Be part of a legacy project that celebrates humanity's most powerful constant</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="https://sealed.love/user/stories" style="display: inline-block; background-color: #4a6cf7; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(74, 108, 247, 0.25);">
            Begin Your Journey
          </a>
        </div>
        
        <p style="color: #555; line-height: 1.6;">We've built this with care and purpose, and we're honored that you've chosen to be part of this journey with us.</p>
        
        <p style="color: #555; line-height: 1.6; margin-top: 24px; font-style: italic;">Be kind, be honest, be human!</p>
        
        <p style="color: #555; line-height: 1.6; font-weight: 600;">Alex</p>
      </div>
      
      <!-- Footer -->
      <div style="padding: 24px 40px; text-align: center; background-color: #f9f9fb; border-radius: 0 0 8px 8px; border: 1px solid #eaeaea; border-top: none;">
        <p style="color: #666; font-size: 13px; margin-top: 8px; margin-bottom: 0;">&copy; ${new Date().getFullYear()} sealed.love. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Complete welcome email template
 */
export const welcomeEmail = {
  subject: getWelcomeSubject,
  text: getWelcomeText,
  html: getWelcomeHtml
};
