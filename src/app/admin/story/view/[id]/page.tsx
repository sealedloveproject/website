"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getStoryByIdForAdmin } from '@/app/actions/admin/stories';
import { Story, Attachment } from '@/types';

// Extended story type with attachments for the story detail page
type StoryWithAttachments = Story & {
  attachments: Attachment[];
  authorEmail?: string;
  userId?: string;
  createdAt: string;
  views?: number;
};

export default function StoryViewPage() {
  const [story, setStory] = useState<StoryWithAttachments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const storyId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  // Redirect non-admin users
  useEffect(() => {
    if (isAuthenticated && !user?.isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch story data from the database
  useEffect(() => {
    async function fetchStory() {
      if (!isAuthenticated || !user?.isAdmin) return;

      try {
        setLoading(true);
        
        // NextAuth handles authentication on the server side now
        const result = await getStoryByIdForAdmin(storyId);
        
        if (!result.success || !result.story) {
          setError(result.message || 'Story not found');
          return;
        }
        
        setStory(result.story);
      } catch (err) {
        //console.error('Error fetching story:', err);
        setError('Failed to load story');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStory();
  }, [storyId, isAuthenticated, user?.isAdmin]);

  // Handle media playback
  useEffect(() => {
    if (story?.attachments && story.attachments.length > 0) {
      const currentMedia = story.attachments[activeMediaIndex];
      
      if (currentMedia.fileType.startsWith('audio/') && audioRef.current) {
        if (isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
      
      if (currentMedia.fileType.startsWith('video/') && videoRef.current) {
        if (isPlaying) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }
  }, [isPlaying, activeMediaIndex, story]);

  // If not authenticated or not admin, show loading
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error message if story failed to load
  if (error) {
    return (
      <div>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Link href="/admin/stories" className="text-sm text-red-700 underline">
                  Back to Stories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching story
  if (loading || !story) {
    return (
      <div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Determine if the current media is an image, audio, or video
  const hasAttachments = story.attachments && story.attachments.length > 0;
  const currentMedia = hasAttachments ? story.attachments[activeMediaIndex] : null;
  const isImage = currentMedia?.fileType.startsWith('image/');
  const isAudio = currentMedia?.fileType.startsWith('audio/');
  const isVideo = currentMedia?.fileType.startsWith('video/');

  return (
    <div>
      {/* Admin info banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Admin View</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>You are viewing this story as an admin. This view shows additional information not visible to regular users.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Story header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-4">
          <div>
            <span className="font-medium">Author:</span> {story.authorEmail || 'Anonymous'}
          </div>
          <div>
            <span className="font-medium">Created:</span> {new Date(story.createdAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Status:</span> 
            <span className={`ml-1 ${story.isPublic ? 'text-green-600' : 'text-red-600'}`}>
              {story.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          <div>
            <span className="font-medium">Likes:</span> {story.likes || 0}
          </div>
          <div>
            <span className="font-medium">Views:</span> {story.views || 0}
          </div>
        </div>
      </div>

      {/* Media display */}
      {hasAttachments && (
        <div className="mb-8">
          <div className="bg-foreground/5 rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-foreground/10">
              {isImage && currentMedia && (
                <div className="flex items-center justify-center h-full">
                  <Image 
                    src={currentMedia.fileUrl || ''} 
                    alt={currentMedia.fileName || 'Story image'} 
                    width={800}
                    height={600}
                    className="max-h-full object-contain"
                  />
                </div>
              )}
              
              {isAudio && currentMedia && (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-md">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium">{currentMedia.fileName}</h3>
                    </div>
                    <audio 
                      ref={audioRef}
                      src={currentMedia.fileUrl || ''} 
                      className="w-full" 
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                </div>
              )}
              
              {isVideo && currentMedia && (
                <video 
                  ref={videoRef}
                  src={currentMedia.fileUrl || ''} 
                  className="w-full h-full" 
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
            </div>
            
            {/* Thumbnails for multiple attachments */}
            {story.attachments.length > 1 && (
              <div className="p-4 bg-foreground/5 border-t border-foreground/10">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {story.attachments.map((attachment, index) => (
                    <button
                      key={attachment.id}
                      onClick={() => {
                        setActiveMediaIndex(index);
                        setIsPlaying(false);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                        index === activeMediaIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {attachment.fileType.startsWith('image/') ? (
                        <Image 
                          src={attachment.fileUrl || ''} 
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : attachment.fileType.startsWith('audio/') ? (
                        <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story content */}
      <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
        <div dangerouslySetInnerHTML={{ __html: story.content || '' }} />
      </div>

      {/* Admin actions */}
      <div className="mt-12 pt-6 border-t border-foreground/10">
        <div className="flex flex-wrap gap-4">
          <Link 
            href={`/admin/stories`}
            className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg transition-colors"
          >
            Back to Stories
          </Link>
          <Link 
            href={`/stories/${story.id}`}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            target="_blank"
          >
            View Public Page
          </Link>
        </div>
      </div>
    </div>
  );
}
