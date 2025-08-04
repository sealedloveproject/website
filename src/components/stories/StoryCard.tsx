import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface StoryCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string | null | undefined;
  likes: number;
  featured?: boolean;
  showEditButton?: boolean;
  isPublic?: boolean;
  showStatusBadge?: boolean;
}

export default function StoryCard({ id, title, excerpt, author, date, imageUrl, likes, featured, showEditButton = false, isPublic = true, showStatusBadge = false }: StoryCardProps) {
  const CardContent = () => (
    <>
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
          {featured && (
            <span className="bg-primary text-foreground text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'var(--button-text)' }}>
              Featured
            </span>
          )}
          {showStatusBadge && isPublic ? (
            <span className="text-xs font-semibold p-2 rounded-full flex items-center gap-1.5" style={{ backgroundColor: 'var(--success)', color: 'var(--button-text)', boxShadow: 'var(--shadow-md)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
              </svg>
              Public
            </span>
          ) : showStatusBadge ? (
            <span className="text-xs font-semibold p-2 rounded-full flex items-center gap-1.5" style={{ backgroundColor: 'var(--error)', color: 'var(--button-text)', boxShadow: 'var(--shadow-md)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Private
            </span>
          ) : null}
        </div>
        
        {/* Replication message */}
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-xs rounded py-2 px-3 text-center max-w-[80%]" style={{ backgroundColor: 'var(--overlay-dark)', color: 'var(--foreground)', boxShadow: 'var(--shadow-md)' }}>
              Images are currently replicating and will be available soon.
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'url(/images/baking.png)',
          filter: 'var(--image-filter)'
        }}></div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 transition-colors" style={{ color: 'var(--foreground)' }}>{title}</h3>
        <p className="mb-4 flex-grow" style={{ color: 'var(--muted-foreground)' }}>{excerpt}</p>
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <span>{author}</span>
          <div className="flex items-center gap-3">
            {isPublic && (
              <div className="flex items-center gap-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="currentColor"
                  viewBox="0 0 24 24" 
                  className="w-4 h-4"
                  style={{ color: 'var(--error)' }}
                >
                  <path 
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
                  />
                </svg>
                <span>{likes}</span>
              </div>
            )}
            <span>{date}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative" style={{ 
      backgroundColor: 'var(--card)',
      boxShadow: 'var(--shadow-md)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--border)',
      borderRadius: 'var(--radius-xl)'
    }}>
      {/* Fixed edit button in top right corner */}
      {showEditButton && (
        <div className="absolute top-3 right-3 z-30">
          <Link 
            href={`/user/stories/edit/${id}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-md"
              title="Edit story"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </Button>
          </Link>
        </div>
      )}
      
      {isPublic ? (
        <Link href={`/stories/${id}`} className="block h-full">
          <CardContent />
        </Link>
      ) : (
        <div className="block h-full cursor-default">
          <CardContent />
        </div>
      )}
    </div>
  );
}
