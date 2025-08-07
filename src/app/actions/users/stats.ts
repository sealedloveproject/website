"use server";

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { cache } from '@/lib/cache';

export interface UserStats {
  totalStories: number;
  publicStories: number;
  totalLikes: number;
  attachmentsCount: number;
  totalDiskSpaceUsed: number; // Total size in bytes of all attachments
  photoDiskSpace: number; // Size in bytes of photo attachments
  videoDiskSpace: number; // Size in bytes of video attachments
  audioDiskSpace: number; // Size in bytes of audio attachments
  averageLikesPerStory: number;
}

// Cache keys
const CACHE_PREFIX = 'user_stats';
const getCacheKey = (userId: string, stat?: string) => {
  return stat 
    ? `${CACHE_PREFIX}:${userId}:${stat}` 
    : `${CACHE_PREFIX}:${userId}`;
};

/**
 * Get all stats for a user with caching (1 hour)
 */
export async function getUserStats(userEmail: string): Promise<UserStats | null> {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== userEmail) {
      return null;
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return null;
    }

    // Check if stats are cached
    const cacheKey = getCacheKey(user.id);
    const cachedStats = await cache.get<UserStats>(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }

    // Calculate all stats
    const [
      totalStories,
      publicStories,
      totalLikes,
      attachmentsWithSizes,
      storyLikesCount
    ] = await Promise.all([
      // Total stories count
      prisma.story.count({
        where: { userId: user.id }
      }),
      
      // Public stories count
      prisma.story.count({
        where: { 
          userId: user.id,
          isPublic: true
        }
      }),
      
      // Total likes received on all stories
      prisma.story.aggregate({
        where: { userId: user.id },
        _sum: { likes: true }
      }),
      
      // All attachments with their sizes and types
      prisma.attachment.findMany({
        where: {
          story: {
            userId: user.id
          }
        },
        select: {
          fileType: true,
          size: true
        }
      }),
      
      // Total number of story likes (for average calculation)
      prisma.storyLike.count({
        where: {
          story: {
            userId: user.id
          }
        }
      })
    ]);

    // Process attachment data
    const attachmentsCount = attachmentsWithSizes.length;
    let totalDiskSpaceUsed = 0;
    let photoDiskSpace = 0;
    let videoDiskSpace = 0;
    let audioDiskSpace = 0;

    attachmentsWithSizes.forEach(attachment => {
      const size = attachment.size || 0;
      totalDiskSpaceUsed += size;
      
      if (attachment.fileType.startsWith('image/')) {
        photoDiskSpace += size;
      } else if (attachment.fileType.startsWith('video/')) {
        videoDiskSpace += size;
      } else if (attachment.fileType.startsWith('audio/')) {
        audioDiskSpace += size;
      }
    });

    // Calculate average likes per story
    const averageLikesPerStory = totalStories > 0 
      ? Number((storyLikesCount / totalStories).toFixed(1))
      : 0;

    // Compile stats
    const stats: UserStats = {
      totalStories,
      publicStories,
      totalLikes: totalLikes._sum.likes || 0,
      attachmentsCount,
      totalDiskSpaceUsed,
      photoDiskSpace,
      videoDiskSpace,
      audioDiskSpace,
      averageLikesPerStory
    };

    // Cache the stats for 1 hour
    await cache.set(cacheKey, stats, 60 * 60); // 1 hour in seconds

    return stats;
  } catch (error) {
    // console.error('Error fetching user stats:', error);
    return null;
  }
}

/**
 * Clear specific stat cache for a user
 */
export async function clearUserStatCache(userEmail: string, stat?: string): Promise<boolean> {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== userEmail) {
      return false;
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return false;
    }

    // Clear specific stat or all stats
    const cacheKey = getCacheKey(user.id, stat);
    
    if (stat) {
      // Clear specific stat
      await cache.del(cacheKey);
    } else {
      // Clear all stats
      await cache.del(getCacheKey(user.id));
    }

    return true;
  } catch (error) {
    // console.error('Error clearing user stat cache:', error);
    return false;
  }
}

/**
 * Invalidate user stats cache after certain actions
 * This should be called after creating/updating/deleting stories or attachments
 */
export async function invalidateUserStatsCache(userId: string): Promise<void> {
  try {
    await cache.del(getCacheKey(userId));
  } catch (error) {
    // console.error('Error invalidating user stats cache:', error);
  }
}
