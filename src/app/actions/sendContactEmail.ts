'use server';

import { getEmailTemplate } from '@/lib/emails';
import { sendEmail } from '@/lib/emails/sendEmail';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { headers } from 'next/headers';

// Define validation schema for contact form
const contactFormSchema = z.object({
  name: z.string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name is too long' })
    .refine(val => !/[<>]/.test(val), { message: 'Name contains invalid characters' }),
  email: z.string()
    .email({ message: 'Valid email is required' })
    .max(100, { message: 'Email is too long' }),
  subject: z.string()
    .min(1, { message: 'Subject is required' })
    .max(200, { message: 'Subject is too long' })
    .refine(val => !/[<>]/.test(val), { message: 'Subject contains invalid characters' }),
  message: z.string()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(5000, { message: 'Message is too long' }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Simple in-memory rate limiting
// In production, this should use Redis or another distributed store
const contactAttempts: Map<string, { count: number, timestamp: number }> = new Map();
const MAX_ATTEMPTS = 5; // Maximum 5 emails per hour from same IP/email
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function sendContactEmail(formData: ContactFormData) {
  // Get the client IP address from headers
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') || '';
  const realIP = headersList.get('x-real-ip') || '';
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIP || 'unknown';
  try {
    // Rate limiting check
    const key = `${clientIp}:${formData.email}`;
    const now = Date.now();
    const attempts = contactAttempts.get(key);
    
    if (attempts) {
      // Clean up old entries
      if (now - attempts.timestamp > WINDOW_MS) {
        contactAttempts.set(key, { count: 1, timestamp: now });
      } else if (attempts.count >= MAX_ATTEMPTS) {
        return { 
          success: false, 
          error: 'Too many contact form submissions. Please try again later.' 
        };
      } else {
        contactAttempts.set(key, { count: attempts.count + 1, timestamp: attempts.timestamp });
      }
    } else {
      contactAttempts.set(key, { count: 1, timestamp: now });
    }
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(formData);
    
    // Additional security: sanitize all inputs as early as possible
    const sanitizedData = {
      name: String(validatedData.name).trim(),
      email: String(validatedData.email).trim(),
      subject: String(validatedData.subject).trim(),
      message: String(validatedData.message).trim()
    };
    
    // Get the contact email address from environment variables
    const contactEmail = process.env.CONTACT_EMAIL;
    
    if (!contactEmail) {
      throw new Error('Contact email address is not configured');
    }
    
    // Get the contact form email template
    const emailTemplate = getEmailTemplate('contactForm');
    
    // Send the email
    await sendEmail({
      to: contactEmail,
      subject: emailTemplate.subject(sanitizedData),
      text: emailTemplate.text(sanitizedData),
      html: emailTemplate.html(sanitizedData),
      // Set reply-to to the sender's email
      from: {
        email: process.env.EMAIL_FROM || 'noreply@sealed.love',
        name: 'Sealed Love Contact Form'
      },
      replyTo: sanitizedData.email
    });
    
    return { success: true };
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        fieldErrors: error.flatten().fieldErrors 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
