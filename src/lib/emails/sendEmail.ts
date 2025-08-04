/**
 * Email sending utility
 * Provides a consistent way to send emails via SendGrid API
 */

type EmailContent = {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: {
    email: string;
    name?: string;
  };
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
};

/**
 * Send an email using SendGrid API
 * @param content The email content to send
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(content: EmailContent): Promise<void> {
  // Get the SendGrid API key from environment variables
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    throw new Error('SendGrid API key is not configured');
  }
  
  // Get the default sender email from environment variables
  const defaultFromEmail = process.env.EMAIL_FROM;
  
  if (!defaultFromEmail) {
    throw new Error('Sender email is not configured');
  }
  
  // Use provided from or default
  const from = content.from || { 
    email: defaultFromEmail,
    name: 'SealedLove'
  };
  
  try {
    // Build the base payload
    const payload: any = {
      personalizations: [{ to: [{ email: content.to }] }],
      from,
      subject: content.subject,
      content: [
        {
          type: "text/plain",
          value: content.text,
        },
        {
          type: "text/html",
          value: content.html,
        },
      ],
    };
    
    // Only add attachments if they exist and the array is not empty
    if (content.attachments && content.attachments.length > 0) {
      payload.attachments = content.attachments;
    }
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    throw new Error("Failed to send email: " + (error instanceof Error ? error.message : String(error)));
  }
}
