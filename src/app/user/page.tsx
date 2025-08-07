'use client';

import { useState, useEffect } from 'react';
import { formatFileSize } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import UserBreadcrumbs from '@/components/user/Breadcrumbs';
import { getUserStats, UserStats as UserStatsType } from '@/app/actions/users/stats';

// Using the UserStats type from our actions

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('User.dashboard');
  
  // Initialize stats with default values
  const [stats, setStats] = useState<UserStatsType>({
    totalStories: 0,
    publicStories: 0,
    totalLikes: 0,
    attachmentsCount: 0,
    totalDiskSpaceUsed: 0,
    photoDiskSpace: 0,
    videoDiskSpace: 0,
    audioDiskSpace: 0,
    averageLikesPerStory: 0
  });
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load real stats from database with caching
  useEffect(() => {
    async function loadUserStats() {
      if (isAuthenticated && user?.email) {
        setIsLoadingStats(true);
        try {
          const userStats = await getUserStats(user.email);
          if (userStats) {
            setStats(userStats);
          }
        } catch (error) {
          // console.error('Failed to load user stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    }
    
    loadUserStats();
  }, [isAuthenticated, user?.email]);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/');
    return null;
  }

  if (authLoading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto"></div>
          <p className="mt-4 text-center">{t('loading') || 'Loading your dashboard...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <UserBreadcrumbs />
      </div>
      
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title') || 'Dashboard'}</h1>
          <p className="text-base text-foreground/80">{t('subtitle') || 'Overview of your activity and content'}</p>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('stats.title') || 'Stats Overview'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stories */}
          <div className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('stats.stories') || 'Stories'}</h3>
                  <div className="text-3xl font-bold">{stats.totalStories}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">{t('stats.public') || 'Public'}</span>
                  <span className="text-sm ml-auto">{stats.publicStories}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">{t('stats.private') || 'Private'}</span>
                  <span className="text-sm ml-auto">{stats.totalStories - stats.publicStories}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('stats.engagement') || 'Engagement'}</h3>
                  <div className="text-3xl font-bold">{stats.totalLikes}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('stats.attachments') || 'Attachments'}</h3>
                  <div className="text-3xl font-bold">{stats.attachmentsCount}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatFileSize(stats.totalDiskSpaceUsed)}</div>
                <div className="text-sm text-foreground/70">{t('stats.totalSize') || 'Total size'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Details */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('contentDetails') || 'Content Details'}</h2>
        <div className="modern-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attachments */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('stats.attachments') || 'Attachments'}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground/60 text-sm">
                      {stats.attachmentsCount} {t('stats.files') || 'files'}
                    </p>
                    <span className="text-sm font-medium">{formatFileSize(stats.totalDiskSpaceUsed)}</span>
                  </div>
                </div>
              </div>
              <div className="pl-12">
                <div className="grid grid-cols-3 gap-2">
                  {/* Photos block with light background for dark mode */}
                  <div className="bg-blue-50 dark:bg-slate-200 p-2 rounded-md">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-xs text-gray-800 dark:text-gray-800">{t('stats.photoFiles') || 'Photos'}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-900">{formatFileSize(stats.photoDiskSpace)}</span>
                  </div>
                  
                  {/* Videos block with light background for dark mode */}
                  <div className="bg-red-50 dark:bg-slate-200 p-2 rounded-md">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs text-gray-800 dark:text-gray-800">{t('stats.videoFiles') || 'Videos'}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-900">{formatFileSize(stats.videoDiskSpace)}</span>
                  </div>
                  
                  {/* Audio block with light background for dark mode */}
                  <div className="bg-green-50 dark:bg-slate-200 p-2 rounded-md">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-gray-800 dark:text-gray-800">{t('stats.audioFiles') || 'Audio'}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-900">{formatFileSize(stats.audioDiskSpace || stats.totalDiskSpaceUsed * 0.1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Visibility */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('stats.visibility') || 'Story Visibility'}</h3>
                  <p className="text-foreground/60 text-sm">
                    {t('stats.visibilityRatio', {
                      public: stats.publicStories,
                      private: stats.totalStories - stats.publicStories
                    }) || `${stats.publicStories} public / ${stats.totalStories - stats.publicStories} private`}
                  </p>
                </div>
              </div>
              <div className="pl-12">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">{t('stats.public') || 'Public'}</span>
                  <span className="text-sm ml-auto">{Math.round((stats.publicStories / stats.totalStories) * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">{t('stats.private') || 'Private'}</span>
                  <span className="text-sm ml-auto">{Math.round(((stats.totalStories - stats.publicStories) / stats.totalStories) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">{t('quickActions.title') || 'Quick Actions'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/user/stories/new" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.createStory') || 'Create Story'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.createStoryDesc') || 'Write a new story'}</p>
          </Link>
          
          <Link href="/user/stories" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.manageStories') || 'Manage Stories'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.manageStoriesDesc') || 'View and edit your stories'}</p>
          </Link>
          
          <Link href="/user/profile" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.editProfile') || 'Edit Profile'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.editProfileDesc') || 'Update your profile information'}</p>
          </Link>
          
          <Link href="/contact" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.helpSupport') || 'Help & Support'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.helpDesc') || 'Get assistance with your account'}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
