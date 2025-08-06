"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import StoryCard from '@/components/stories/StoryCard';
import { getPublicStories, type PaginatedStoriesResult, type SortOption } from '@/app/actions/public/stories';
import { Story } from '@/types';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface StoriesListProps {
  initialStories?: Story[];
  initialTotalCount?: number;
  initialHasMore?: boolean;
}

export function StoriesList({ initialStories = [], initialTotalCount = 0, initialHasMore = false }: StoriesListProps) {
  const t = useTranslations('Stories');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const currentSort = (searchParams.get('sort') as SortOption) || 'newest';
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [totalStories, setTotalStories] = useState(initialTotalCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(!initialStories.length);
  
  // Constants
  const STORIES_PER_PAGE = 9;
  
  // Load stories with pagination
  useEffect(() => {
    async function loadStories() {
      setIsLoading(true);
      try {
        const result = await getPublicStories(currentPage, STORIES_PER_PAGE, currentSort) as PaginatedStoriesResult;
        setStories(result.stories);
        setTotalStories(result.totalCount);
        setHasMore(result.hasMore);
      } catch (error) {
        //console.error('Error loading stories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadStories();
  }, [currentPage, currentSort]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Update URL with new page parameter while preserving sort
    router.push(`/stories?page=${page}&sort=${currentSort}`);
  };
  
  // Handle sort change
  const handleSortChange = (sortOption: SortOption) => {
    // Reset to page 1 when changing sort
    router.push(`/stories?page=1&sort=${sortOption}`);
  };
  
  // Filter stories based on search query only
  const filteredStories = stories.filter((story: Story) => {
    return searchQuery === '' || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-12">
      {/* Search and Sort Controls */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-4xl mx-auto gap-4">
          {/* Sort selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-foreground/80">{t('controls.sortBy')}</span>
            <div className="flex rounded-lg overflow-hidden border border-border shadow-sm">
              <Button 
                onClick={() => handleSortChange('newest')} 
                variant={currentSort === 'newest' ? 'primary' : 'ghost'}
                className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 relative ${currentSort === 'newest' && 'transform scale-[1.02]'}`}
              >
                {t('controls.newest')}
                {currentSort === 'newest' && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-white rounded-full"></div>
                )}
              </Button>
              <Button 
                onClick={() => handleSortChange('popular')} 
                variant={currentSort === 'popular' ? 'primary' : 'ghost'}
                className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 relative ${currentSort === 'popular' && 'transform scale-[1.02]'}`}
              >
                {t('controls.popular')}
                {currentSort === 'popular' && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-white rounded-full"></div>
                )}
              </Button>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('controls.search.placeholder')}
              className="block w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Stories grid */}
      {!isLoading && filteredStories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story: Story) => (
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
                showStatusBadge={false}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {!searchQuery && (
            <div className="mt-16 flex justify-center items-center space-x-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="ghost"
                size="icon"
                className="w-10 h-10"
                aria-label={t('pagination.prev')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Button>
              
              <div className="flex items-center space-x-1">
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(totalStories / STORIES_PER_PAGE)) }, (_, i) => {
                  // Show pages around current page
                  const totalPages = Math.ceil(totalStories / STORIES_PER_PAGE);
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If near start, show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If near end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show 2 before and 2 after current
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      variant={currentPage === pageNum ? 'primary' : 'ghost'}
                      size="sm"
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
                variant="ghost"
                size="icon"
                className="w-10 h-10"
                aria-label={t('pagination.next')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Button>
            </div>
          )}
        </>
      ) : (
        !isLoading && (
          <div className="text-center py-12">
            {searchQuery ? (
              <p className="text-sm text-muted-foreground">{t('noResults.withSearch')}</p>
            ) : (
              <div className="text-center py-2">
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">{t('noResults.noStories.title')}</h3>
                  <p className="text-lg text-foreground/80 mb-6 max-w-2xl mx-auto">
                    {t('noResults.noStories.description')}
                  </p>
                </div>
                <Link href="/user/stories">
                  <Button 
                    variant="primary"
                    size="default"
                    className="inline-flex items-center gap-2 group"
                  >
                    {t('noResults.noStories.cta')}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

// Loading fallback component
export function LoadingFallback() {
  const t = useTranslations('Stories');
  return (
    <div className="fade-in pt-16 pb-20 px-6 max-w-5xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      <header className="mb-16">
        <div className="mt-10 mb-6 relative text-center">
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl"></div>
          <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mx-auto mt-6 animate-pulse"></div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
