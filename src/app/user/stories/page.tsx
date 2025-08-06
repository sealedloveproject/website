"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StoryCard from '@/components/stories/StoryCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserStories } from '@/app/actions/users/stories';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function UserStoriesPage() {
  const { user, isAuthenticated, openSignInModal } = useAuth();
  const router = useRouter();
  const t = useTranslations('User.stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [myStories, setMyStories] = useState<any[]>([]);

  // Check authentication status
  useEffect(() => {
    // Short timeout to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // No automatic redirect - we'll show a login required message instead

  // Fetch stories from the database using the server action

  // Fetch user's stories from the database
  useEffect(() => {
    const fetchMyStories = async () => {
      if (!user?.email) return;
      
      setIsLoading(true);
      try {
        // NextAuth handles authentication on the server side now
        // Fetch stories from the database using the server action
        const userStories = await getUserStories(user.email);
        setMyStories(userStories);
      } catch (error) {
        //console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.email) {
      fetchMyStories();
    }
  }, [isAuthenticated, user?.email]);

  // Filter stories based on search query
  const filteredStories = myStories.filter(story => {
    return searchQuery === '' || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Show login required message when not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="fade-in pt-16 pb-20 px-6 max-w-5xl mx-auto text-foreground">
        <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-foreground/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('loginRequired.title')}</h1>
          <p className="text-lg text-foreground/70 max-w-md mb-8">
            {t('loginRequired.message')}
          </p>
          <Button
            onClick={openSignInModal}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            {t('loginRequired.signIn')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in pt-16 pb-20 px-6 max-w-5xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      <header className="mb-16">
        <div className="mt-10 mb-6 relative text-center">
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl"></div>
          <h1 className="text-4xl md:text-4xl font-bold relative inline-block">{t('title')}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <p className="mt-6 text-lg text-foreground/80 text-center max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </header>

      <div className="space-y-12">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Create New Story Button */}
          <Link href="/user/stories/new">
            <Button
              variant="primary"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>{t('createButton')}</span>
            </Button>
          </Link>
        </div>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4"></div>
            <p className="text-foreground/70">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* Stories grid */}
            {filteredStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    id={story.id}
                    title={story.title}
                    excerpt={story.excerpt}
                    author={story.author}
                    date={story.date}
                    imageUrl={story.imageUrl}
                    likes={story.likes || 0}
                    featured={story.featured}
                    showEditButton={true}
                    isPublic={story.isPublic}
                    showStatusBadge={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-muted-foreground">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">{t('noStories.title')}</h3>
                {searchQuery ? (
                  <p className="text-muted-foreground">{t('noStories.searchMessage')}</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{t('noStories.emptyMessage')}</p>
                    <Link href="/user/stories/new">
                      <Button
                        variant="outline"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>{t('noStories.createFirst')}</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
