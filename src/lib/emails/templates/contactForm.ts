/**
 * Contact form email template
 * This template is used to send contact form submissions
 * User input is sanitized to prevent XSS attacks
 */

// Since DOMPurify can't be used directly in server components,
// we'll implement a simple sanitizer function
function sanitizeInput(input: string): string {
  // Convert to string and trim
  const str = String(input || '').trim();
  // Replace HTML special chars with entities
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface ContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Generate the subject line for a contact form email
 * 
 * @param params The parameters for the email
 * @returns The subject line
 */
export function contactFormSubject(params: ContactEmailParams): string {
  return `[Website Contact] ${params.subject}`;
}

/**
 * Generate the plain text content for a contact form email
 * 
 * @param params The parameters for the email
 * @returns The plain text content
 */
export function contactFormText(params: ContactEmailParams): string {
  // For plain text, we don't need complex sanitization, just ensure we have simple string values
  const name = String(params.name).trim();
  const email = String(params.email).trim();
  const subject = String(params.subject).trim();
  const message = String(params.message).trim();
  
  return `
Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

---
This message was sent from the contact form on sealed.love
`;
}

/**
 * Generate the HTML content for a contact form email
 * 
 * @param params The parameters for the email
 * @returns The HTML content
 */
export function contactFormHtml(params: ContactEmailParams): string {
  // Sanitize all user inputs to prevent XSS attacks using our simple sanitizer
  const name = sanitizeInput(params.name);
  const email = sanitizeInput(params.email);
  const subject = sanitizeInput(params.subject);
  const messageText = sanitizeInput(params.message);
  
  // Convert newlines to <br> tags after sanitizing
  const message = messageText.replace(/\n/g, '<br>');
  
  // Email clients often load images and external content automatically
  // Adding Content-Security-Policy meta tag to prevent loading external resources
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'">
  <title>Contact Form Submission</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
      color: #333;
      line-height: 1.6;
    }
    .container {
      border: 1px solid #e1e1e1;
      border-radius: 5px;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .header {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e1e1e1;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 24px;
    }
    .message-content {
      background-color: #fff;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e1e1e1;
      margin-top: 15px;
    }
    .sender-info {
      margin-bottom: 20px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e1e1e1;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Contact Form Submission</h1>
    </div>
    
    <div class="sender-info">
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
    </div>
    
    <div>
      <strong>Message:</strong>
      <div class="message-content">
        ${message}
      </div>
    </div>
    
    <div class="footer">
      <p>This message was sent from the contact form on sealed.love</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Contact form email template
 */
export const contactFormEmail = {
  subject: contactFormSubject,
  text: contactFormText,
  html: contactFormHtml
};
