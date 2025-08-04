'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import SupportBlock from '@/components/SupportBlock';
import { useSearchParams } from 'next/navigation';

// Separate component for search params logic
function StorySuccessContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || 'created';
  
  // Determine if this is a new story or an update
  const isUpdate = action === 'updated';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      {/* Success animation */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -inset-4 rounded-full bg-green-500/20 animate-pulse blur-xl"></div>
        </div>
      </div>

      {/* Success message */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text relative inline-block">
          {isUpdate ? 'Story Updated Successfully!' : 'Story Saved Successfully!'}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
        <p className="mt-6 text-lg text-foreground/80 max-w-3xl mx-auto">
          {isUpdate 
            ? 'Your love story has been updated in our digital vault. Thank you for keeping your memories current. Remember, you can edit your story anytime to add new details or updates.'
            : 'Your love story has been saved to our digital vault. Thank you for sharing your precious memories with us. Remember, you can edit your story anytime to add new details or updates.'
          }
        </p>
      </div>

      {/* Prominent Share Section */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-8 mb-12 border border-primary/20 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Help Us Preserve Love Stories Forever!</h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-6">
            Share Sealed Love Project with your friends and family. Every story shared helps us build a millennium vault of human love and connection.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Sealed Love Project - Preserve Your Love Stories',
                  text: 'I just saved my love story to the Sealed Love Project! Join me in preserving precious memories for the next millennium.',
                  url: window.location.origin
                });
              } else {
                navigator.clipboard.writeText(`I just saved my love story to the Sealed Love Project! Join me in preserving precious memories for the next millennium. ${window.location.origin}`);
                alert('Link copied to clipboard!');
              }
            }}
            className="btn-primary inline-flex items-center gap-2 group px-6 py-3 text-lg font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share With Friends
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <Link 
            href="/support" 
            className="btn-primary inline-flex items-center gap-2 group px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Support Our Mission
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link 
            href="/stories" 
            className="btn-primary inline-flex items-center gap-2 group px-6 py-3 text-lg font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Explore Public Stories
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-foreground/60">
            💝 Every shared story helps us grow our community of love and memories
          </p>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link 
          href="/user/stories/new" 
          className="px-6 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Story
        </Link>
        <Link 
          href="/user/stories" 
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl transition-colors flex items-center gap-2"
        >
          View My Stories
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 animate-spin"></div>
        </div>
      </div>
      <div className="text-center">
        <div className="h-8 bg-gray-200 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function StorySuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StorySuccessContent />
    </Suspense>
  );
}
