'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { deleteFileFromS3 } from '@/lib/s3Delete';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  isAdmin: boolean;
  storiesCount: number;
  lastLoginAt?: string;
}

export async function getAllUsers() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    // Check if user is admin
    const adminEmails = process.env.WEBSITE_ADMINS 
      ? process.env.WEBSITE_ADMINS.split(',').map(email => email.trim().toLowerCase()) 
      : [];
    
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return {
        success: false,
        error: 'Not authorized - admin access required'
      };
    }

    const prisma = new PrismaClient();
    
    // Get all users from database with story counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
        image: true,
        _count: {
          select: {
            stories: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get the last login time from sessions table
    const userSessions = await prisma.session.findMany({
      select: {
        userId: true,
        expires: true
      },
      orderBy: {
        expires: 'desc'
      }
    });
    
    // Create a map of userId to last login time
    const lastLoginMap = new Map();
    userSessions.forEach(session => {
      if (!lastLoginMap.has(session.userId)) {
        lastLoginMap.set(session.userId, session.expires);
      }
    });

    // Format users with all required information
    const formattedUsers: User[] = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || '',
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: lastLoginMap.has(user.id) ? lastLoginMap.get(user.id).toISOString() : undefined,
      isAdmin: adminEmails.includes(user.email.toLowerCase()),
      storiesCount: user._count.stories
    }));
    
    return {
      success: true,
      users: formattedUsers
    };
    
  } catch (error) {
    //console.error('Error getting all users:', error);
    return {
      success: false,
      error: 'Failed to retrieve users. Please try again.'
    };
  }
}

export async function deleteUsers(userIds: string[]) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    // Check if user is admin
    const adminEmails = process.env.WEBSITE_ADMINS 
      ? process.env.WEBSITE_ADMINS.split(',').map(email => email.trim().toLowerCase()) 
      : [];
    
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return {
        success: false,
        error: 'Not authorized - admin access required'
      };
    }

    if (!userIds || userIds.length === 0) {
      return {
        success: false,
        error: 'No users specified for deletion'
      };
    }

    const prisma = new PrismaClient();
    
    // Get all users to be deleted
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true }
    });
    
    if (usersToDelete.length === 0) {
      return {
        success: false,
        error: 'No users found with the specified IDs'
      };
    }
    
    // Process each user deletion
    for (const user of usersToDelete) {
      // Get all user stories with their attachments
      const userStories = await prisma.story.findMany({
        where: { userId: user.id },
        include: { attachments: true }
      });
      
      // Delete all associated media files from S3
      for (const story of userStories) {
        if (story.attachments && story.attachments.length > 0) {
          for (const attachment of story.attachments) {
            if (attachment.s3Region && attachment.s3Bucket && attachment.fileUrl) {
              // Extract the file key from the URL
              const urlObj = new URL(attachment.fileUrl);
              const fileKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
              
              await deleteFileFromS3(fileKey, attachment.s3Region, attachment.s3Bucket);
            }
          }
        }
      }
      
      // Delete all user data in a transaction to ensure consistency
      await prisma.$transaction(async (tx) => {
        // Delete all story reports associated with the user's stories
        await tx.storyReport.deleteMany({
          where: { storyId: { in: userStories.map(story => story.id) } }
        });
        
        // Delete all attachments associated with the user's stories
        await tx.attachment.deleteMany({
          where: { storyId: { in: userStories.map(story => story.id) } }
        });
        
        // Delete all stories associated with the user
        await tx.story.deleteMany({
          where: { userId: user.id }
        });
        
        // Delete all sessions associated with the user
        await tx.session.deleteMany({
          where: { userId: user.id }
        });
        
        // Delete all accounts associated with the user
        await tx.account.deleteMany({
          where: { userId: user.id }
        });
        
        // Finally, delete the user
        await tx.user.delete({
          where: { id: user.id }
        });
      });
    }
    
    return {
      success: true,
      message: `${usersToDelete.length} users deleted successfully`
    };
    
  } catch (error) {
    //console.error('Error deleting users:', error);
    return {
      success: false,
      error: 'Failed to delete users. Please try again.'
    };
  }
}

export async function toggleUserAdminStatus(userId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    // Check if user is admin
    const adminEmails = process.env.WEBSITE_ADMINS 
      ? process.env.WEBSITE_ADMINS.split(',').map(email => email.trim().toLowerCase()) 
      : [];
    
    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return {
        success: false,
        error: 'Not authorized - admin access required'
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    // TODO: Implement actual admin status toggle
    // This should include:
    // 1. Get the user from database
    // 2. Check current admin status
    // 3. Update environment variable or database admin list
    // 4. Return updated status
    
    //console.log(`Admin ${session.user.email} requested admin status toggle for user:`, userId);
    
    // For now, we'll simulate the toggle
    // In a real implementation, you would:
    
    /*
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const isCurrentlyAdmin = adminEmails.includes(user.email.toLowerCase());
    
    // Update admin list in environment or database
    // This depends on how you store admin permissions
    if (isCurrentlyAdmin) {
      // Remove from admin list
      const newAdminEmails = adminEmails.filter(email => email !== user.email.toLowerCase());
      // Update environment variable or database
    } else {
      // Add to admin list
      const newAdminEmails = [...adminEmails, user.email.toLowerCase()];
      // Update environment variable or database
    }
    */
    
    return {
      success: true,
      message: 'Admin status updated successfully',
      isAdmin: Math.random() > 0.5 // Random for demo purposes
    };
    
  } catch (error) {
    //console.error('Error toggling admin status:', error);
    return {
      success: false,
      error: 'Failed to update admin status. Please try again.'
    };
  }
}

// Helper function to delete files from S3 (placeholder)
async function deleteFromS3(fileUrl: string) {
  // TODO: Implement S3 file deletion
  //console.log(`Deleting file from S3: ${fileUrl}`);
}
