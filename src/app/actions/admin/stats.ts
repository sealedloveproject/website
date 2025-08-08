"use server";

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { cache } from '@/lib/cache';

export interface AdminStats {
  // User Statistics
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  usersWithStories: number;
  
  // Story Statistics
  totalStories: number;
  publicStories: number;
  privateStories: number;
  newStoriesThisMonth: number;
  newStoriesThisWeek: number;
  totalLikes: number;
  averageLikesPerStory: number;
  
  // Content Statistics
  totalAttachments: number;
  totalDiskSpaceUsed: number;
  photoDiskSpace: number;
  videoDiskSpace: number;
  audioDiskSpace: number;
  
  // Moderation Statistics
  totalReports: number;
  pendingReports: number;
  reviewedReports: number;
  dismissedReports: number;
  
  // Vault Statistics
  totalVaults: number;
  activeVaults: number;
  storiesInVaults: number;
  
  // Engagement Statistics
  totalStoryLikes: number;
  averageStoriesPerUser: number;
  mostLikedStoryId: string | null;
  mostLikedStoryTitle: string | null;
  mostLikedStoryLikes: number;
}

// Cache keys
const CACHE_PREFIX = 'admin_stats';
const getCacheKey = (stat?: string) => {
  return stat 
    ? `${CACHE_PREFIX}:${stat}` 
    : `${CACHE_PREFIX}:all`;
};

/**
 * Check if user is admin (you may need to adjust this based on your auth system)
 * For now, checking if user exists and is authenticated
 */
async function isAdmin(): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser();
    // Add your admin check logic here
    // For now, just checking if user is authenticated
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Get all admin stats with caching (30 minutes)
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return null;
    }

    // Check if stats are cached
    const cacheKey = getCacheKey();
    const cachedStats = await cache.get<AdminStats>(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for better performance
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      usersWithStories,
      totalStories,
      publicStories,
      privateStories,
      newStoriesThisMonth,
      newStoriesThisWeek,
      totalLikesAggregate,
      totalAttachments,
      attachmentsWithSizes,
      totalReports,
      pendingReports,
      reviewedReports,
      dismissedReports,
      totalVaults,
      activeVaults,
      storiesInVaults,
      totalStoryLikes,
      mostLikedStory
    ] = await Promise.all([
      // User Statistics
      prisma.user.count(),
      
      prisma.user.count({
        where: {
          createdAt: {
            gte: oneMonthAgo
          }
        }
      }),
      
      prisma.user.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      
      prisma.user.count({
        where: {
          stories: {
            some: {}
          }
        }
      }),
      
      // Story Statistics
      prisma.story.count(),
      
      prisma.story.count({
        where: { isPublic: true }
      }),
      
      prisma.story.count({
        where: { isPublic: false }
      }),
      
      prisma.story.count({
        where: {
          createdAt: {
            gte: oneMonthAgo
          }
        }
      }),
      
      prisma.story.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      
      prisma.story.aggregate({
        _sum: { likes: true }
      }),
      
      // Attachment Statistics
      prisma.attachment.count(),
      
      prisma.attachment.findMany({
        select: {
          fileType: true,
          size: true
        }
      }),
      
      // Report Statistics
      prisma.storyReport.count(),
      
      prisma.storyReport.count({
        where: { status: 'pending' }
      }),
      
      prisma.storyReport.count({
        where: { status: 'reviewed' }
      }),
      
      prisma.storyReport.count({
        where: { status: 'dismissed' }
      }),
      
      // Vault Statistics
      prisma.vault.count(),
      
      prisma.vault.count({
        where: {
          AND: [
            { startsAt: { lte: now } },
            { endsAt: { gte: now } }
          ]
        }
      }),
      
      prisma.story.count({
        where: {
          vaultId: { not: null }
        }
      }),
      
      // Engagement Statistics
      prisma.storyLike.count(),
      
      // Most liked story
      prisma.story.findFirst({
        orderBy: { likes: 'desc' },
        select: {
          id: true,
          title: true,
          likes: true
        }
      })
    ]);

    // Process attachment data
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

    // Calculate derived statistics
    const averageLikesPerStory = totalStories > 0 
      ? Number(((totalLikesAggregate._sum.likes || 0) / totalStories).toFixed(1))
      : 0;
      
    const averageStoriesPerUser = totalUsers > 0 
      ? Number((totalStories / totalUsers).toFixed(1))
      : 0;

    // Compile stats
    const stats: AdminStats = {
      // User Statistics
      totalUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      usersWithStories,
      
      // Story Statistics
      totalStories,
      publicStories,
      privateStories,
      newStoriesThisMonth,
      newStoriesThisWeek,
      totalLikes: totalLikesAggregate._sum.likes || 0,
      averageLikesPerStory,
      
      // Content Statistics
      totalAttachments,
      totalDiskSpaceUsed,
      photoDiskSpace,
      videoDiskSpace,
      audioDiskSpace,
      
      // Moderation Statistics
      totalReports,
      pendingReports,
      reviewedReports,
      dismissedReports,
      
      // Vault Statistics
      totalVaults,
      activeVaults,
      storiesInVaults,
      
      // Engagement Statistics
      totalStoryLikes,
      averageStoriesPerUser,
      mostLikedStoryId: mostLikedStory?.id || null,
      mostLikedStoryTitle: mostLikedStory?.title || null,
      mostLikedStoryLikes: mostLikedStory?.likes || 0
    };

    // Cache the stats for 30 minutes (shorter than user stats for more up-to-date admin data)
    await cache.set(cacheKey, stats, 30 * 60); // 30 minutes in seconds

    return stats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}

/**
 * Clear admin stats cache
 */
export async function clearAdminStatsCache(stat?: string): Promise<boolean> {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return false;
    }

    const cacheKey = getCacheKey(stat);
    await cache.del(cacheKey);
    return true;
  } catch (error) {
    console.error('Error clearing admin stats cache:', error);
    return false;
  }
}

/**
 * Invalidate admin stats cache after certain actions
 * This should be called after creating/updating/deleting users, stories, reports, etc.
 */
export async function invalidateAdminStatsCache(): Promise<void> {
  try {
    await cache.del(getCacheKey());
  } catch (error) {
    console.error('Error invalidating admin stats cache:', error);
  }
}
