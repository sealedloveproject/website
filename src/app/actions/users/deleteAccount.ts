'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getEmailTemplate } from '@/lib/emails';
import { sendEmail } from '@/lib/emails/sendEmail';
import { cache } from '@/lib/cache';
import { deleteFileFromS3 } from '@/lib/s3Delete';

// Cache key prefix for deletion verification codes
const CACHE_PREFIX = 'delete-verification:';

/**
 * Generates a random 6-digit verification code
 * @returns A 6-digit code as string
 */
function generateVerificationCode(): string {
  // Generate a random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generates a 6-digit verification code and sends it to the user's email
 * for account deletion verification
 */
export async function sendDeleteVerification() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    const userEmail = session.user.email;
    const userName = session.user.name || 'User';
    
    // Generate a random 6-digit code
    const verificationCode = generateVerificationCode();
    
    // Store the code in Redis cache with 10-minute expiration
    const cacheKey = `${CACHE_PREFIX}${userEmail}`;
    await cache.set(cacheKey, { code: verificationCode, expires: new Date(Date.now() + 10 * 60 * 1000) }, 60 * 10); // 10 minutes
    
    // Get the deletion verification email template
    const deletionTemplate = getEmailTemplate('deletionVerification');
    
    // Send the verification code via email using our utility
    await sendEmail({
      to: userEmail,
      subject: deletionTemplate.subject({}),
      text: deletionTemplate.text({ verificationCode, userName }),
      html: deletionTemplate.html({ verificationCode, userName }),
      from: { email: process.env.EMAIL_FROM as string, name: 'SealedLove' }
    });
    
    return {
      success: true,
      message: 'Verification code sent to your email'
    };
    
  } catch (error) {
    //console.error('Error sending verification code:', error);
    return {
      success: false,
      error: 'Failed to send verification code. Please try again.'
    };
  }
}

/**
 * Verifies the 6-digit code entered by the user for account deletion
 */
export async function verifyDeleteCode(code: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    const userEmail = session.user.email;
    
    // Get the stored code from Redis cache
    const cacheKey = `${CACHE_PREFIX}${userEmail}`;
    const storedData = await cache.get<{ code: string, expires: string }>(cacheKey);
    
    if (!storedData) {
      return {
        success: false,
        error: 'Verification code expired or not found. Please request a new code.'
      };
    }
    
    // Check if code has expired (convert stored date string back to Date object)
    const expiresDate = new Date(storedData.expires);
    if (expiresDate < new Date()) {
      await cache.del(cacheKey);
      return {
        success: false,
        error: 'Verification code has expired. Please request a new code.'
      };
    }
    
    // Compare the codes
    if (code !== storedData.code) {
      return {
        success: false,
        error: 'Invalid verification code. Please try again.'
      };
    }
    
    // Clear the code from Redis cache after successful verification
    await cache.del(cacheKey);
    
    return {
      success: true,
      message: 'Code verified successfully'
    };
    
  } catch (error) {
    //console.error('Error verifying code:', error);
    return {
      success: false,
      error: 'Failed to verify code. Please try again.'
    };
  }
}

/**
 * Deletes a user account and all associated data
 * Requires email verification code to be verified first
 */
export async function deleteAccount() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    const userEmail = session.user.email;
    
    // Get the user ID from the email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    });
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    const userId = user.id;
    
    // 1. Get all user stories with their attachments
    const userStories = await prisma.story.findMany({
      where: { userId },
      include: { attachments: true }
    });
    
    // 2. Delete all associated media files from S3
    for (const story of userStories) {
      if (story.attachments && story.attachments.length > 0) {
        for (const attachment of story.attachments) {
          // Use the s3Region and s3Bucket directly from the attachment model
          if (attachment.s3Region && attachment.s3Bucket && attachment.fileUrl) {
            // The fileUrl format is: https://bucket-name.s3.amazonaws.com/path/to/file.ext
            // We need to extract just the path part as the fileKey
            const urlObj = new URL(attachment.fileUrl);
            const fileKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
            
            await deleteFileFromS3(fileKey, attachment.s3Region, attachment.s3Bucket);
          }
        }
      }
    }
    
    // 3. Delete all user data in a transaction to ensure consistency
    await prisma.$transaction(async (tx: any) => {
      // Delete all story reports associated with the user's stories
      await tx.storyReport.deleteMany({
        where: { storyId: { in: userStories.map((story: any) => story.id) } }
      });
      
      // Delete all attachments associated with the user's stories
      await tx.attachment.deleteMany({
        where: { storyId: { in: userStories.map((story: any) => story.id) } }
      });
      
      // Delete all stories associated with the user
      await tx.story.deleteMany({
        where: { userId }
      });
      
      // Delete all sessions associated with the user
      await tx.session.deleteMany({
        where: { userId }
      });
      
      // Delete all accounts associated with the user
      await tx.account.deleteMany({
        where: { userId }
      });
      
      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
    
  } catch (error) {
    //console.error('Error deleting account:', error);
    return {
      success: false,
      error: 'Failed to delete account. Please try again.'
    };
  }
}


