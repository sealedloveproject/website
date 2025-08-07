

import React, { Suspense } from 'react';
import { getPublicStories, type PaginatedStoriesResult, type SortOption } from '@/app/actions/public/stories';
import { StoriesList, LoadingFallback } from './storieslist.client';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Public Stories | Sealed Love',
  description: 'Explore love stories, memories, and wisdom that others have chosen to share with the world. Find inspiration and connection through shared experiences.',
  openGraph: {
    title: 'Public Stories | Sealed Love',
    description: 'Explore love stories, memories, and wisdom that others have chosen to share with the world.',
    url: `https://${process.env.DOMAIN}/stories`,
    siteName: 'Sealed Love',
    images: [
      {
        url: `https://${process.env.DOMAIN}/images/og-stories.png`,
        width: 1024,
        height: 1024,
        alt: 'Sealed Love - Public Stories',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Stories | Sealed Love',
    description: 'Explore love stories, memories, and wisdom that others have chosen to share with the world.',
    images: [`https://${process.env.DOMAIN}/images/og-stories.png`],
  },
  alternates: {
    canonical: `https://${process.env.DOMAIN}/stories`,
  },
};

// Server component that fetches initial data
async function StoriesContent({ searchParams }: { searchParams: Promise<{ page?: string; sort?: string }> }) {
  // Get translations
  const t = await getTranslations('Stories');
  
  // Await searchParams before accessing its properties
  const resolvedParams = await searchParams;
  
  // Get query parameters with defaults
  const currentPage = Number(resolvedParams.page || '1');
  const currentSort = (resolvedParams.sort as SortOption) || 'newest';
  
  // Constants
  const STORIES_PER_PAGE = 9;
  
  // Fetch initial data on the server
  const result = await getPublicStories(currentPage, STORIES_PER_PAGE, currentSort) as PaginatedStoriesResult;
  
  return (
    <div className="fade-in pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      <header className="mb-16">
        <div className="mt-10 mb-6 relative text-center">
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl"></div>
          <h1 className="text-3xl md:text-3xl font-bold relative inline-block">{t('header.title')}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <p className="mt-6 text-lg text-foreground/80 text-center max-w-3xl mx-auto">
            {t('header.description')}
          </p>
        </div>
      </header>
      
      {/* Client component with initial data */}
      <StoriesList 
        initialStories={result.stories} 
        initialTotalCount={result.totalCount} 
        initialHasMore={result.hasMore} 
      />
    </div>
  );
}



// Main export with Suspense boundary
export default function StoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; sort?: string }> }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StoriesContent searchParams={searchParams} />
    </Suspense>
  );
}
