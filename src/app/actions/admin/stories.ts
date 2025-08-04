"use server";

import { prisma } from '@/lib/prisma';
import { Story, ServerActionResponse } from '@/types';
import { isAdmin } from '@/lib/auth-server';
import { convertS3UrlToPublicUrl } from '@/lib/mediaUrl';
import { deleteFileFromS3 } from '@/lib/s3Delete';

export type AdminStoriesResult = {
  stories: (Story & { userId: string })[];
  totalCount: number;
  hasMore: boolean;
};

/**
 * Gets all stories for admin management with pagination
 * Only accessible to admin users
 */
export type AdminStoryFilters = {
  storyId?: string;
  authorId?: string;
  authorEmail?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getAllStoriesForAdmin(
  page: number = 1,
  pageSize: number = 20,
  sortBy: 'newest' | 'popular' = 'newest',
  filters?: AdminStoryFilters
): Promise<AdminStoriesResult> {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return {
        stories: [],
        totalCount: 0,
        hasMore: false
      };
    }

    // Build where clause based on filters
    const whereClause: any = {};
    
    if (filters) {
      if (filters.storyId) {
        whereClause.id = filters.storyId;
      }
      
      if (filters.authorId) {
        whereClause.userId = filters.authorId;
      }
      
      if (filters.authorEmail) {
        whereClause.user = {
          email: {
            contains: filters.authorEmail,
            mode: 'insensitive'
          }
        };
      }
      
      // Date range filters
      if (filters.dateFrom || filters.dateTo) {
        whereClause.createdAt = {};
        
        if (filters.dateFrom) {
          whereClause.createdAt.gte = new Date(filters.dateFrom);
        }
        
        if (filters.dateTo) {
          // Add one day to include the end date fully
          const endDate = new Date(filters.dateTo);
          endDate.setDate(endDate.getDate() + 1);
          whereClause.createdAt.lt = endDate;
        }
      }
    }
    
    // Calculate pagination parameters
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination info with filters
    const totalCount = await prisma.story.count({
      where: whereClause
    });
    
    // Get paginated stories
    const stories = await prisma.story.findMany({
      where: whereClause,
      orderBy: sortBy === 'newest'
        ? { createdAt: 'desc' }
        : { likes: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: true,
        attachments: {
          where: {
            fileType: {
              startsWith: 'image/'
            }
          },
          take: 1
        }
      }
    });

    // Transform stories for frontend use
    const formattedStories = stories.map(story => ({
      id: story.id,
      title: story.title,
      excerpt: story.content.substring(0, 60) + (story.content.length > 60 ? '...' : ''),
      author: story.user.name || 'Anonymous',
      date: new Date(story.createdAt).toLocaleDateString(),
      imageUrl: story.attachments[0]?.fileUrl,
      likes: story.likes,
      featured: story.likes > 50,
      isPublic: story.isPublic,
      userId: story.userId // Include the userId for admin operations
    }));
    
    // Calculate if there are more pages
    const hasMore = totalCount > skip + stories.length;
    
    return {
      stories: formattedStories,
      totalCount,
      hasMore
    };
  } catch (error) {
    //console.error('Error fetching stories for admin:', error);
    return {
      stories: [],
      totalCount: 0,
      hasMore: false
    };
  }
}

/**
 * Updates a story as an admin
 * Only accessible to admin users
 */
export async function updateStoryAsAdmin(
  storyId: string,
  data: {
    title?: string;
    content?: string;
    isPublic?: boolean;
  }
): Promise<ServerActionResponse> {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return {
        success: false,
        message: "Unauthorized: Admin access required"
      };
    }

    // Update the story
    await prisma.story.update({
      where: { id: storyId },
      data
    });

    return {
      success: true,
      message: "Story updated successfully"
    };
  } catch (error) {
    //console.error('Error updating story as admin:', error);
    return {
      success: false,
      message: "Failed to update story"
    };
  }
}

/**
 * Deletes a story as an admin
 * Only accessible to admin users
 */
export async function deleteStoryAsAdmin(
  storyId: string
): Promise<ServerActionResponse> {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return {
        success: false,
        message: "Unauthorized: Admin access required"
      };
    }

    // First, get the story with its attachments to delete from S3
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: { attachments: true }
    });

    if (!story) {
      return {
        success: false,
        message: "Story not found"
      };
    }

    // Delete all associated media files from S3
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

    // Delete related attachments from the database
    await prisma.attachment.deleteMany({
      where: { storyId }
    });
    
    // Now delete the story
    await prisma.story.delete({
      where: { id: storyId }
    });

    return {
      success: true,
      message: "Story deleted successfully"
    };
  } catch (error) {
    //console.error('Error deleting story as admin:', error);
    return {
      success: false,
      message: "Failed to delete story"
    };
  }
}

/**
 * Get any story by ID for admin users (including private stories)
 * Only accessible to admin users
 */
export async function getStoryByIdForAdmin(
  storyId: string
): Promise<{ success: boolean; story?: any; message?: string }> {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return {
        success: false,
        message: "Unauthorized: Admin access required"
      };
    }

    // Get the story without isPublic filter
    const story = await prisma.story.findUnique({
      where: {
        id: storyId
      },
      include: {
        user: true,
        attachments: true
      }
    });

    if (!story) {
      return {
        success: false,
        message: "Story not found"
      };
    }

    return {
      success: true,
      story: {
        id: story.id,
        title: story.title,
        content: story.content,
        excerpt: story.content.substring(0, 120) + (story.content.length > 120 ? '...' : ''),
        author: story.user.name || 'Anonymous',
        authorEmail: story.user.email,
        userId: story.userId,
        date: new Date(story.createdAt).toLocaleDateString(),
        createdAt: story.createdAt,
        imageUrl: convertS3UrlToPublicUrl(story.attachments.find(a => a.fileType.startsWith('image/'))?.fileUrl, story.id),
        likes: story.likes,
        featured: story.likes > 50,
        isPublic: story.isPublic,
        attachments: story.attachments.map(attachment => ({
          ...attachment,
          fileUrl: convertS3UrlToPublicUrl(attachment.fileUrl, story.id)
        }))
      }
    };
  } catch (error) {
    //console.error('Error fetching story for admin:', error);
    return {
      success: false,
      message: "Failed to fetch story"
    };
  }
}
