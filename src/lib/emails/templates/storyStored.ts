/**
 * Story stored email template
 * Sent to users after their story is fully stored on our servers
 */

import { Attachment } from '@prisma/client';
import { formatFileSize } from '@/lib/utils';

type StoryStoredParams = {
  name?: string; // User's name if available
  email: string;
  storyTitle: string;
  storyId: string;
  isPublic: boolean; // Whether the story is public or private
  attachments?: Attachment[]; // Now optional since we're sending as JSON file
  currentDate: string;
};

/**
 * Generate the subject line for story stored emails
 */
export function getStoryStoredSubject(params: StoryStoredParams): string {
  return `We just stored your story: "${params.storyTitle}" on our servers`;
}

/**
 * Generate the plain text content for story stored emails
 */
export function getStoryStoredText(params: StoryStoredParams): string {
  const { name, email, storyTitle, storyId, isPublic, attachments, currentDate } = params;
  const greeting = name ? `Hi ${name}` : `Hi there`;
  
  // Add note about JSON attachment instead of listing attachments in email body
  const attachmentNote = '\n\nWe have attached a JSON file to this email containing the details of all files associated with your story. This file is for your records and you don\'t need to do anything with it.\n';

  return `${greeting},

Great news! Your story "${storyTitle}" has been fully stored on our servers as of ${currentDate}.

Story ID: ${storyId}${attachmentNote}

Your story is now safely preserved in our system. ${isPublic ? 
  `Since you've marked it as public, we encourage you to share it with others who might appreciate your story. View your story at: https://${process.env.DOMAIN}/stories/${storyId}` : 
  `If you find our service valuable, please tell others about sealed.love so they can preserve their own stories too.`}

If you enjoy using sealed.love, please consider supporting us through a donation to help us maintain and improve our services.

Thank you for trusting us with your precious memories.

Warm regards,
The sealed.love Team`;
}

/**
 * Generate the HTML content for story stored emails
 */
export function getStoryStoredHtml(params: StoryStoredParams): string {
  const { name, email, storyTitle, storyId, isPublic, currentDate } = params;
  const greeting = name ? `Hi ${name}` : `Hi there`;
  
  // Add note about JSON attachment
  const attachmentsHtml = `
    <div style="background-color: #f9f9fb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #eaeaea;">
      <h3 style="margin-top: 0; margin-bottom: 16px; color: #333; font-size: 18px;">Attachment Information</h3>
      <p style="margin-bottom: 0; line-height: 1.6; color: #555;">
        We have attached a JSON file to this email containing the details of all files associated with your story.
        This file is for your records and you don't need to do anything with it.
      </p>
    </div>
  `;
  
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; background-color: #ffffff;">
      <!-- Header with logo/brand -->
      <div style="background-color: #4a6cf7; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-weight: 600; font-size: 24px;">sealed.love</h1>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px; background-color: #ffffff; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea;">
        <h2 style="color: #333; margin-top: 0; margin-bottom: 24px; font-weight: 600; font-size: 20px;">${greeting}</h2>
        
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">
          <span style="font-weight: 600; color: #4a6cf7;">Great news!</span> Your story "<strong>${storyTitle}</strong>" has been fully stored on our servers as of ${currentDate}.
        </p>
        
        <div style="background-color: #f9f9fb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #eaeaea;">
          <p style="margin-top: 0; margin-bottom: 0; color: #555; line-height: 1.6;">
            <strong>Story ID:</strong> ${isPublic ? `<a href="https://${process.env.DOMAIN}/stories/${storyId}" style="color: #4a6cf7; text-decoration: underline;">${storyId}</a>` : storyId}
          </p>
        </div>
        
        ${attachmentsHtml}
        
        <p style="margin-bottom: 24px; line-height: 1.6; color: #555;">
          Your story is now safely preserved in our system. 
          ${isPublic ? 
            `Since you've marked it as public, we encourage you to share it with others who might appreciate your story. <a href="https://${process.env.DOMAIN}/stories/${storyId}" style="color: #4a6cf7; text-decoration: underline;">View your story</a>.` : 
            `If you find our service valuable, please tell others about sealed.love so they can preserve their own stories too.`}
        </p>
        
        <div style="background-color: #f9f9fb; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #eaeaea;">
          <h3 style="margin-top: 0; color: #333; font-size: 18px;">Support sealed.love</h3>
          <p style="color: #555; line-height: 1.6; margin-bottom: 16px;">
            If you enjoy using sealed.love, please consider supporting us through a donation to help us maintain and improve our services.
          </p>
          <div style="text-align: center;">
            <a href="https://${process.env.DOMAIN}/support" style="display: inline-block; background-color: #4a6cf7; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(74, 108, 247, 0.25);">
              Support Our Mission
            </a>
          </div>
        </div>
        
        <p style="color: #555; line-height: 1.6;">Thank you for trusting us with your precious memories.</p>
        
        <p style="color: #555; line-height: 1.6; margin-top: 24px;">
          Warm regards,<br>
          The sealed.love Team
        </p>
      </div>
      
      <!-- Footer -->
      <div style="padding: 24px 40px; text-align: center; background-color: #f9f9fb; border-radius: 0 0 8px 8px; border: 1px solid #eaeaea; border-top: none;">
        <p style="color: #666; font-size: 13px; margin-top: 8px; margin-bottom: 0;">&copy; ${new Date().getFullYear()} sealed.love. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Complete story stored email template
 */
export const storyStoredEmail = {
  subject: getStoryStoredSubject,
  text: getStoryStoredText,
  html: getStoryStoredHtml
};
