"use server";

import { prisma } from '@/lib/prisma';
import { Story, ServerActionResponse } from '@/types';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { convertS3UrlToPublicUrl } from '@/lib/mediaUrl';

export async function getUserStories(userEmail: string): Promise<Story[]> {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== userEmail) {
      //console.error('Unauthorized access attempt to getUserStories');
      return [];
    }
    // Continue with the original function
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return [];
    }

    // Get all stories created by this user
    const stories = await prisma.story.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        attachments: {
          where: { fileType: { startsWith: 'image/' } }
        }
      }
    });

    return stories.map(story => {
      // Find the cover image attachment - only use replicated attachments
      let coverImage = null;
      
      if (story.coverImageId) {
        // If story has a coverImageId, find that specific attachment (only if replicated)
        coverImage = story.attachments.find(attachment => 
          attachment.id === story.coverImageId && attachment.replicated === true
        );
      }
      
      // If no cover image found by ID, fall back to the first replicated image attachment
      if (!coverImage && story.attachments.length > 0) {
        coverImage = story.attachments.find(attachment => attachment.replicated === true);
      }
      
      return {
        id: story.id,
        title: story.title,
        excerpt: story.content.substring(0, 120) + (story.content.length > 120 ? '...' : ''),
        author: user.name || userEmail.split('@')[0] || 'Anonymous',
        date: new Date(story.createdAt).getFullYear().toString(),
        imageUrl: convertS3UrlToPublicUrl(coverImage?.fileUrl, story.id),
        likes: story.likes,
        featured: story.likes > 50,
        isPublic: story.isPublic
      };
    });
  } catch (error) {
    //console.error('Error fetching user stories:', error);
    return [];
  }
}
