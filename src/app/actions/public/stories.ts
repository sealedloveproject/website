'use server';

import { prisma } from '@/lib/prisma';
import { Story } from '@/types';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { convertS3UrlToPublicUrl } from '@/lib/mediaUrl';
import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';

export type PaginatedStoriesResult = {
  stories: Story[];
  totalCount: number;
  hasMore: boolean;
};

export type SortOption = 'newest' | 'popular';

export async function getPublicStories(
  page: number = 1,
  pageSize: number = 9,
  sortBy: SortOption = 'newest'
): Promise<PaginatedStoriesResult> {
  try {
    // Calculate pagination parameters
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination info
    const totalCount = await prisma.story.count({
      where: {
        isPublic: true
      }
    });
    
    // Get paginated stories
    const stories = await prisma.story.findMany({
      where: {
        isPublic: true
      },
      orderBy: sortBy === 'newest'
        ? { createdAt: 'desc' } // Sort by newest first
        : { likes: 'desc' }, // Sort by popularity (hearts)
      skip,
      take: pageSize,
      include: {
        user: true,
        attachments: true // Include all attachments to find the cover image
      }
    });

    // Transform stories for frontend use
    const formattedStories = stories.map(story => {
      // Filter attachments to only include those with replicated=true
      const replicatedAttachments = story.attachments.filter(a => a.replicated === true);
      
      // Find the cover image if it exists, otherwise use the first image
      let imageUrl;
      if (story.coverImageId) {
        // Find the attachment that matches the coverImageId and is replicated
        const coverImage = replicatedAttachments.find(a => a.id === story.coverImageId);
        if (coverImage) {
          imageUrl = convertS3UrlToPublicUrl(coverImage.fileUrl, story.id);
        }
      }
      
      // If no cover image was found, fall back to the first image attachment
      if (!imageUrl && replicatedAttachments.length > 0) {
        const firstImage = replicatedAttachments.find(a => a.fileType.startsWith('image/'));
        if (firstImage) {
          imageUrl = convertS3UrlToPublicUrl(firstImage.fileUrl, story.id);
        }
      }
      
      return {
        id: story.id,
        title: story.title,
        excerpt: story.content.substring(0, 120) + (story.content.length > 120 ? '...' : ''),
        author: story.user.name || 'Anonymous',
        date: new Date(story.createdAt).getFullYear().toString(),
        imageUrl: imageUrl,
        likes: story.likes,
        featured: story.likes > 50, // Mark stories with more than 50 likes as featured
        isPublic: true // These are all public stories
      };
    });
    
    // Calculate if there are more pages
    const hasMore = totalCount > skip + stories.length;
    
    return {
      stories: formattedStories,
      totalCount,
      hasMore
    };
  } catch (error) {
    //console.error('Error fetching public stories:', error);
    return {
      stories: [],
      totalCount: 0,
      hasMore: false
    };
  }
}

export async function getPublicStoryById(id: string): Promise<(Story & { attachments: any[], vault?: { id: string, name: string } }) | null> {
  try {
    const story = await prisma.story.findFirst({
      where: {
        id: id,
        isPublic: true
      },
      include: {
        user: true,
        attachments: true,
        vault: true // Include vault information
      }
    });

    if (!story) {
      return null;
    }

    // Filter attachments to only include those with replicated=true
    const replicatedAttachments = story.attachments.filter(a => a.replicated === true);
    
    // Find the cover image if it exists, otherwise use the first image
    let imageUrl;
    if (story.coverImageId) {
      // Find the attachment that matches the coverImageId and is replicated
      const coverImage = replicatedAttachments.find(a => a.id === story.coverImageId);
      if (coverImage) {
        imageUrl = convertS3UrlToPublicUrl(coverImage.fileUrl, story.id);
      }
    }
    
    // If no cover image was found, fall back to the first image attachment
    if (!imageUrl && replicatedAttachments.length > 0) {
      const firstImage = replicatedAttachments.find(a => a.fileType.startsWith('image/'));
      if (firstImage) {
        imageUrl = convertS3UrlToPublicUrl(firstImage.fileUrl, story.id);
      }
    }

    return {
      id: story.id,
      title: story.title,
      content: story.content,
      excerpt: story.content.substring(0, 120) + (story.content.length > 120 ? '...' : ''),
      author: story.user.name || 'Anonymous',
      date: new Date(story.createdAt).toLocaleDateString(),
      imageUrl: imageUrl,
      likes: story.likes,
      featured: story.likes > 50,
      isPublic: true,
      attachments: replicatedAttachments,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      hashReplicatingAttachment: story.hashReplicatingAttachment,
      vault: story.vault ? { id: story.vault.id, name: story.vault.name } : undefined // Include the vault information if available
    };
  } catch (error) {
    //console.error('Error fetching public story by ID:', error);
    return null;
  }
}

/**
 * Gets a limited number of top public stories for display on the homepage
 * Uses Next.js's noStore option to completely bypass the cache
 * @param limit Number of stories to return (default: 3)
 * @returns Array of Story objects
 */
export async function getHotStories(limit: number = 3): Promise<Story[]> {
  // This tells Next.js to never cache this data
  noStore();

  try {
    const stories = await prisma.story.findMany({
      where: {
        isPublic: true
      },
      orderBy: {
        createdAt: 'desc' // Sort by newest first
      },
      take: limit,
      include: {
        user: true,
        attachments: true // Include all attachments to find the cover image
      }
    });

    return stories.map(story => {
      // Filter attachments to only include those with replicated=true
      const replicatedAttachments = story.attachments.filter(a => a.replicated === true);
      
      // Find the cover image if it exists, otherwise use the first image
      let imageUrl;
      if (story.coverImageId) {
        // Find the attachment that matches the coverImageId and is replicated
        const coverImage = replicatedAttachments.find(a => a.id === story.coverImageId);
        if (coverImage) {
          imageUrl = convertS3UrlToPublicUrl(coverImage.fileUrl, story.id);
        }
      }
      
      // If no cover image was found, fall back to the first image attachment
      if (!imageUrl && replicatedAttachments.length > 0) {
        const firstImage = replicatedAttachments.find(a => a.fileType.startsWith('image/'));
        if (firstImage) {
          imageUrl = convertS3UrlToPublicUrl(firstImage.fileUrl, story.id);
        }
      }
      
      return {
        id: story.id,
        title: story.title,
        excerpt: story.content.substring(0, 120) + (story.content.length > 120 ? '...' : ''),
        author: story.user.name || 'Anonymous',
        date: new Date(story.createdAt).getFullYear().toString(),
        imageUrl: imageUrl,
        likes: story.likes,
        featured: story.likes > 50, // Mark stories with more than 50 likes as featured
        isPublic: true // These are all public stories
      };
    });
  } catch (error) {
    //console.error('Error fetching hot stories:', error);
    return [];
  }
}

/**
 * Checks if a user has already liked a story
 * @param storyId The ID of the story
 * @returns Boolean indicating if the user has liked the story
 */
export async function hasUserLikedStory(storyId: string): Promise<boolean> {
  try {
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return false;
    }

    const like = await prisma.storyLike.findFirst({
      where: {
        storyId: storyId,
        userId: authenticatedUser.id
      }
    });

    return !!like;
  } catch (error) {
    //console.error('Error checking if user liked story:', error);
    return false;
  }
}

/**
 * Toggles a like on a story. If the user has already liked the story, it removes the like.
 * If the user hasn't liked the story yet, it adds a like.
 * @param storyId The ID of the story to like/unlike
 * @returns Object with success status and whether the action was a like or unlike
 */
export async function toggleStoryLike(storyId: string): Promise<{ success: boolean; action: 'like' | 'unlike' }> {
  // Force revalidation only when data changes
  revalidatePath('/', 'page');
  revalidatePath('/stories', 'page');
  revalidatePath(`/stories/${storyId}`, 'page');

  try {
    // Verify authentication using NextAuth - any authenticated user can like a story
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return { success: false, action: 'like' };
    }

    // Check if the user has already liked this story
    const existingLike = await prisma.storyLike.findFirst({
      where: {
        storyId: storyId,
        userId: authenticatedUser.id
      }
    });

    if (existingLike) {
      // User has already liked the story, so unlike it
      await prisma.$transaction([
        // Delete the like record
        prisma.storyLike.delete({
          where: {
            id: existingLike.id
          }
        }),
        // Decrement the likes counter on the story
        prisma.story.update({
          where: { id: storyId },
          data: {
            likes: {
              decrement: 1
            }
          }
        })
      ]);

      return { success: true, action: 'unlike' };
    } else {
      // User hasn't liked the story yet, so add a like
      await prisma.$transaction([
        // Create a new like record
        prisma.storyLike.create({
          data: {
            storyId: storyId,
            userId: authenticatedUser.id as string
          }
        }),
        // Increment the likes counter on the story
        prisma.story.update({
          where: { id: storyId },
          data: {
            likes: {
              increment: 1
            }
          }
        })
      ]);

      return { success: true, action: 'like' };
    }
  } catch (error) {
    //console.error('Error toggling story like:', error);
    return { success: false, action: 'like' };
  }
}

// Keeping this for backward compatibility
export async function incrementStoryLikes(id: string): Promise<{ success: boolean }> {
  // Force revalidation only when data changes
  revalidatePath('/', 'page');
  revalidatePath('/stories', 'page');
  revalidatePath(`/stories/${id}`, 'page');

  try {
    // Verify authentication using NextAuth - any authenticated user can like a story
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return { success: false };
    }
    
    // Check if user has already liked this story
    const existingLike = await prisma.storyLike.findFirst({
      where: {
        storyId: id,
        userId: authenticatedUser.id
      }
    });

    // If user has already liked, don't allow another like
    if (existingLike) {
      return { success: false };
    }

    await prisma.$transaction([
      // Create a new like record
      prisma.storyLike.create({
        data: {
          storyId: id,
          userId: authenticatedUser.id as string
        }
      }),
      // Increment the likes counter on the story
      prisma.story.update({
        where: { id },
        data: {
          likes: {
            increment: 1
          }
        }
      })
    ]);
    
    return { success: true };
  } catch (error) {
    //console.error('Error incrementing story likes:', error);
    return { success: false };
  }
}
