'use client';

import { useState, useEffect } from 'react';
import { formatFileSize } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getAdminStats, AdminStats as AdminStatsType } from '@/app/actions/admin/stats';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('Admin.dashboard');
  
  // Initialize stats with default values
  const [stats, setStats] = useState<AdminStatsType>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    newUsersThisWeek: 0,
    usersWithStories: 0,
    totalStories: 0,
    publicStories: 0,
    privateStories: 0,
    newStoriesThisMonth: 0,
    newStoriesThisWeek: 0,
    totalLikes: 0,
    averageLikesPerStory: 0,
    totalAttachments: 0,
    totalDiskSpaceUsed: 0,
    photoDiskSpace: 0,
    videoDiskSpace: 0,
    audioDiskSpace: 0,
    totalReports: 0,
    pendingReports: 0,
    reviewedReports: 0,
    dismissedReports: 0,
    totalVaults: 0,
    activeVaults: 0,
    storiesInVaults: 0,
    totalStoryLikes: 0,
    averageStoriesPerUser: 0,
    mostLikedStoryId: null,
    mostLikedStoryTitle: null,
    mostLikedStoryLikes: 0
  });
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load admin stats with caching
  useEffect(() => {
    async function loadAdminStats() {
      if (isAuthenticated && user?.email) {
        setIsLoadingStats(true);
        try {
          const adminStats = await getAdminStats();
          if (adminStats) {
            setStats(adminStats);
          }
        } catch (error) {
          console.error('Failed to load admin stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    }
    
    loadAdminStats();
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
          <p className="mt-4 text-center">{t('loading') || 'Loading admin dashboard...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title') || 'Admin Dashboard'}</h1>
          <p className="text-base text-foreground/80">{t('subtitle') || 'Platform overview and management tools'}</p>
        </div>
      </header>

      {/* User Statistics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('users.title') || 'User Statistics'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('users.total') || 'Total Users'}</h3>
                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-1.235 0-2.424-.178-3.536-.506a26.408 26.408 0 01-2.838-.896z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('users.newThisMonth') || 'New This Month'}</h3>
                <div className="text-3xl font-bold">{stats.newUsersThisMonth.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('users.newThisWeek') || 'New This Week'}</h3>
                <div className="text-3xl font-bold">{stats.newUsersThisWeek.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('users.withStories') || 'Active Writers'}</h3>
                <div className="text-3xl font-bold">{stats.usersWithStories.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Statistics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('stories.title') || 'Story Statistics'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('stories.total') || 'Total Stories'}</h3>
                <div className="text-3xl font-bold">{stats.totalStories.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('stories.public') || 'Public Stories'}</h3>
                <div className="text-3xl font-bold">{stats.publicStories.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('stories.totalLikes') || 'Total Likes'}</h3>
                <div className="text-3xl font-bold">{stats.totalLikes.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('stories.averageLikes') || 'Avg Likes/Story'}</h3>
                <div className="text-3xl font-bold">{stats.averageLikesPerStory}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content & Storage Statistics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('content.title') || 'Content & Storage'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('content.attachments') || 'Attachments'}</h3>
                <div className="text-3xl font-bold">{stats.totalAttachments.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('content.totalStorage') || 'Total Storage'}</h3>
                <div className="text-3xl font-bold">{formatFileSize(stats.totalDiskSpaceUsed)}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('content.photos') || 'Photos'}</h3>
                <div className="text-3xl font-bold">{formatFileSize(stats.photoDiskSpace)}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('content.videos') || 'Videos'}</h3>
                <div className="text-3xl font-bold">{formatFileSize(stats.videoDiskSpace)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Moderation & Reports */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('moderation.title') || 'Moderation & Reports'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('moderation.totalReports') || 'Total Reports'}</h3>
                <div className="text-3xl font-bold">{stats.totalReports.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('moderation.pending') || 'Pending Review'}</h3>
                <div className="text-3xl font-bold">{stats.pendingReports.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('moderation.reviewed') || 'Reviewed'}</h3>
                <div className="text-3xl font-bold">{stats.reviewedReports.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">{t('moderation.dismissed') || 'Dismissed'}</h3>
                <div className="text-3xl font-bold">{stats.dismissedReports.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">{t('quickActions.title') || 'Quick Actions'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/users" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.manageUsers') || 'Manage Users'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.manageUsersDesc') || 'View and manage user accounts'}</p>
          </Link>
          
          <Link href="/admin/stories" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.manageStories') || 'Manage Stories'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.manageStoriesDesc') || 'Review and moderate stories'}</p>
          </Link>
          
          <Link href="/admin/reports" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.reviewReports') || 'Review Reports'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.reviewReportsDesc') || 'Handle user reports and moderation'}</p>
          </Link>
          
          <Link href="/admin/vault" className="modern-card p-6 hover:border-primary transition-colors flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">{t('quickActions.manageVaults') || 'Manage Vaults'}</h3>
            <p className="text-sm text-foreground/60">{t('quickActions.manageVaultsDesc') || 'Configure story collections'}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
