'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Story, Attachment } from '@/types';
import { convertS3UrlToPublicUrl } from '@/lib/mediaUrl';

// Media item type for the gallery
type MediaItem = Attachment & {
  fileUrl: string;
  isCoverImage: boolean;
};

type MediaGalleryProps = {
  story: Story & {
    attachments?: Attachment[];
  };
  storyId: string;
};

export default function MediaGallery({ story, storyId }: MediaGalleryProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Get media attachments from the story
  const getMediaAttachments = (): MediaItem[] => {
    const attachments: MediaItem[] = [];
    
    // Add the cover image if it exists
    if (story.imageUrl) {
      attachments.push({
        id: 'cover-image',
        storyId: story.id,
        fileName: 'Cover Image',
        fileUrl: story.imageUrl,
        fileType: 'image/jpeg', // Assuming cover is always an image
        isCoverImage: true
      } as MediaItem);
    }
    
    // Add other media attachments
    if (story.attachments && story.attachments.length > 0) {
      const filteredAttachments = story.attachments
        .filter((attachment: Attachment) => {
          const fileType = attachment.fileType || '';
          const isMediaFile = fileType.startsWith('image/') || fileType.startsWith('video/') || fileType.startsWith('audio/');
          
          // Skip if this attachment is the same as the cover image
          const attachmentUrl = convertS3UrlToPublicUrl(attachment.fileUrl, storyId) || attachment.fileUrl;
          const isCoverImage = story.imageUrl && attachmentUrl === story.imageUrl;
          
          return isMediaFile && !isCoverImage;
        })
        .map((attachment: Attachment) => ({
          ...attachment,
          fileUrl: convertS3UrlToPublicUrl(attachment.fileUrl, storyId) || attachment.fileUrl,
          isCoverImage: false
        } as MediaItem));
      
      attachments.push(...filteredAttachments);
    }
    
    return attachments;
  };
  
  const mediaAttachments = getMediaAttachments();
  
  // Navigate to previous media item
  const navigateToPrevious = useCallback(() => {
    if (mediaAttachments.length <= 1) return;
    setActiveMediaIndex((prevIndex) => 
      prevIndex === 0 ? mediaAttachments.length - 1 : prevIndex - 1
    );
  }, [mediaAttachments.length]);

  // Navigate to next media item
  const navigateToNext = useCallback(() => {
    if (mediaAttachments.length <= 1) return;
    setActiveMediaIndex((prevIndex) => 
      prevIndex === mediaAttachments.length - 1 ? 0 : prevIndex + 1
    );
  }, [mediaAttachments.length]);

  // Reset playing state when changing media items
  useEffect(() => {
    setIsPlaying(false);
    
    // Scroll the active thumbnail into view
    if (galleryRef.current && mediaAttachments.length > 1) {
      const thumbnails = galleryRef.current.children;
      if (thumbnails[activeMediaIndex]) {
        thumbnails[activeMediaIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeMediaIndex, mediaAttachments.length]);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateToPrevious();
      } else if (e.key === 'ArrowRight') {
        navigateToNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mediaAttachments.length, navigateToPrevious, navigateToNext]);

  if (mediaAttachments.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 dark:text-gray-100">
      {/* Active media display */}
      {mediaAttachments.length > 0 ? (
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-900">
          <div className="relative aspect-video w-full">
            {/* Left navigation button */}
            {mediaAttachments.length > 1 && (
              <button
                onClick={navigateToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-r-lg transition-all duration-200"
                aria-label="Previous media"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Right navigation button */}
            {mediaAttachments.length > 1 && (
              <button
                onClick={navigateToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-l-lg transition-all duration-200"
                aria-label="Next media"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {/* Media content based on type */}
            {mediaAttachments[activeMediaIndex]?.fileType.startsWith('image/') && (
              <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-900">
                <Image
                  ref={imageRef as React.RefObject<HTMLImageElement>}
                  src={mediaAttachments[activeMediaIndex].fileUrl}
                  alt={mediaAttachments[activeMediaIndex].fileName}
                  className="max-h-full max-w-full object-contain"
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized={mediaAttachments[activeMediaIndex].fileUrl.startsWith('blob:')}
                />
              </div>
            )}
            
            {mediaAttachments[activeMediaIndex]?.fileType.startsWith('video/') && (
              <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-900">
                <video 
                  ref={videoRef}
                  src={mediaAttachments[activeMediaIndex].fileUrl} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-full"
                />
              </div>
            )}
            
            {mediaAttachments[activeMediaIndex]?.fileType.startsWith('audio/') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <button 
                    onClick={() => {
                      if (audioRef.current) {
                        if (isPlaying) {
                          audioRef.current.pause();
                        } else {
                          audioRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-center font-medium mb-2">{mediaAttachments[activeMediaIndex].fileName}</p>
                <audio 
                  ref={audioRef} 
                  src={mediaAttachments[activeMediaIndex].fileUrl} 
                  className="w-3/4" 
                  autoPlay
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>
        </div>
      ) : story.imageUrl && mediaAttachments.length <= 1 ? (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl group">
          <div className="relative">
            <Image 
              src={story.imageUrl} 
              alt={story.title} 
              width={1200} 
              height={675} 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      ) : null}
      
      {/* Media Gallery - Modern Design */}
      {mediaAttachments.length > 1 && (
        <div className="mt-8 mb-10 bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Media Gallery
          </h3>
          
          {/* Thumbnails carousel with improved styling */}
          <div className="relative">
            <div ref={galleryRef} className="flex overflow-x-auto pb-2 pt-2 px-1 space-x-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent snap-x">
              {mediaAttachments.map((attachment: MediaItem, index: number) => {
                const isImage = attachment.fileType.startsWith('image/');
                const isVideo = attachment.fileType.startsWith('video/');
                const isAudio = attachment.fileType.startsWith('audio/');
                
                return (
                  <div 
                    key={attachment.id} 
                    className={`flex-shrink-0 w-28 h-28 cursor-pointer rounded-xl overflow-hidden transition-all duration-300 snap-start
                      ${activeMediaIndex === index 
                        ? 'ring-3 ring-blue-500 ring-offset-2 shadow-lg transform scale-105' 
                        : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1 shadow-md hover:shadow-lg'}`}
                    onClick={() => {
                      setActiveMediaIndex(index);
                      // For videos, we'll rely on the autoPlay attribute
                      // For audio, start playing when clicked
                      if (isAudio && audioRef.current) {
                        setTimeout(() => {
                          if (audioRef.current) {
                            audioRef.current.play()
                              .then(() => setIsPlaying(true))
                              .catch(() => setIsPlaying(false));
                          }
                        }, 100);
                      }
                    }}
                  >
                    {isImage && (
                      <div className="relative w-full h-full group">
                        <Image 
                          src={attachment.fileUrl} 
                          alt={attachment.fileName} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          fill
                          sizes="(max-width: 768px) 100px, 112px"
                          unoptimized={attachment.fileUrl.startsWith('blob:')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
                          <span className="text-white text-xs font-medium truncate max-w-[90%] px-1">Image</span>
                        </div>
                      </div>
                    )}
                    {isVideo && (
                      <div className="relative w-full h-full group bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/80 group-hover:text-white transition-all duration-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
                          <span className="text-white text-xs font-medium truncate max-w-[90%] px-1">Video</span>
                        </div>
                      </div>
                    )}
                    {isAudio && (
                      <div className="relative w-full h-full group bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900 dark:to-blue-800 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
                          <span className="text-white text-xs font-medium truncate max-w-[90%] px-1">Audio</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Subtle scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-800 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Current media info */}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeMediaIndex + 1} of {mediaAttachments.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
