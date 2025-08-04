"use client";

import React, { useState, useEffect } from 'react';
import { toggleStoryLike, hasUserLikedStory } from '@/app/actions/public/stories';
import { useAuth } from '@/contexts/AuthContext';
import { Story } from '@/types';
import { Button } from '@/components/ui/Button';

interface StoryHeaderProps {
  story: Story & {
    createdAt?: string;
    updatedAt?: string;
    vault?: {
      id: string;
      name: string;
    };
  };
  storyId: string;
}

export default function StoryHeader({ story, storyId }: StoryHeaderProps) {
  const [liked, setLiked] = useState(false);
  const [likeInProgress, setLikeInProgress] = useState(false);
  const [likesCount, setLikesCount] = useState(story.likes || 0);
  const { isAuthenticated, openSignInModal } = useAuth();
  
  // Fetch like status when component mounts
  useEffect(() => {
    async function checkLikeStatus() {
      if (isAuthenticated) {
        try {
          const hasLiked = await hasUserLikedStory(storyId);
          setLiked(hasLiked);
        } catch (err) {
          //console.error('Error checking like status:', err);
        }
      }
    }
    
    checkLikeStatus();
  }, [storyId, isAuthenticated]);

  // Function to handle like button click
  const handleLikeClick = async () => {
    if (likeInProgress) return;
    
    // If user is not authenticated, open sign-in modal
    if (!isAuthenticated) {
      openSignInModal();
      return;
    }
    
    setLikeInProgress(true);
    
    try {
      // Call API to toggle like status
      const result = await toggleStoryLike(storyId);
      
      // Update UI state based on API response
      if (result.success) {
        const newLikedState = !liked;
        setLiked(newLikedState);
        
        // Update likes count
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
      }
    } catch (error) {
      //console.error('Error toggling like:', error);
    } finally {
      setLikeInProgress(false);
    }
  };

  return (
    <>
      {/* Story header */}
      <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
      <div className="flex items-center text-gray-600 mb-8">
        <span className="mr-4">By {story.author}</span>
        <span className="mr-4">•</span>
        <span className="mr-4">{story.date}</span>
        {story.vault && (
          <>
            <span className="mr-4">•</span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {story.vault.name} vault
            </span>
          </>
        )}
        <span className="ml-auto flex items-center">
          <Button 
            onClick={handleLikeClick}
            variant="ghost"
            size="sm"
            className={`${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} ${likeInProgress ? 'opacity-50' : ''}`}
            disabled={likeInProgress}
            aria-label={liked ? 'Unlike this story' : 'Like this story'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-1 transition-transform ${liked ? 'scale-110' : ''} ${likeInProgress ? 'animate-pulse' : ''}`} 
              viewBox="0 0 20 20" 
              fill={liked ? 'currentColor' : 'none'}
              stroke={liked ? 'none' : 'currentColor'}
              strokeWidth={liked ? '0' : '1.5'}
            >
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            {likesCount}
          </Button>
        </span>
      </div>
    </>
  );
}
