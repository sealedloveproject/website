'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ReportStoryModal from '@/components/report/ReportStoryModal';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface StoryActionsProps {
  story: {
    id: string;
    title: string;
  };
  storyId: string;
}

export default function StoryActions({ story, storyId }: StoryActionsProps) {
  const t = useTranslations('Story');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const { isAuthenticated, openSignInModal } = useAuth();

  // Function to copy the current URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setShowCopyTooltip(true);
        setTimeout(() => {
          setShowCopyTooltip(false);
        }, 2000);
      })
      .catch(error => {
        //console.error('Error copying to clipboard:', error);
      });
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-200">
      <div className="flex flex-wrap justify-between items-center">
        {/* Share section - left side */}
        <div>
          <h3 className="text-lg font-medium mb-3">{t('actions.share.title')}</h3>
          <div className="flex gap-3">
            {/* Facebook */}
            <Button 
              onClick={() => {
                const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank', 'width=600,height=400');
              }}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200"
              aria-label="Share on Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </Button>
            
            {/* Twitter/X */}
            <Button 
              onClick={() => {
                const text = story?.title ? `${t('actions.share.twitter.prefix')} "${story.title}"` : t('actions.share.twitter.default');
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank', 'width=600,height=400');
              }}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200"
              aria-label="Share on Twitter/X"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </Button>
            
            {/* Native Share API (for mobile devices) or Copy Link */}
            <div className="relative">
              <Button 
                onClick={() => {
                  // Try to use the Web Share API if available (mostly on mobile)
                  if (navigator.share) {
                    navigator.share({
                      title: story?.title || 'Love Story',
                      text: 'Check out this love story',
                      url: window.location.href,
                    })
                    .catch(() => {
                      // Fallback to copying to clipboard
                      copyToClipboard();
                    });
                  } else {
                    // Fallback for desktop: copy to clipboard
                    copyToClipboard();
                  }
                }}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200"
                aria-label="Share or Copy Link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </Button>
              
              {/* Copy success tooltip */}
              {showCopyTooltip && (
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 animate-fade-in-out">
                  {t('actions.share.copied')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions section - right side */}
        <div>
          <h3 className="text-lg font-medium mb-3">{t('actions.title')}</h3>
          <div className="flex gap-3">
            {/* More Stories */}
            <Link 
              href="/stories"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title={t('actions.moreStories')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </Link>
            
            {/* Back to Top */}
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              variant="primary"
              size="icon"
              className="w-10 h-10 rounded-full"
              aria-label="Back to Top"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </Button>
            
            {/* Report */}
            <Button 
              onClick={() => {
                if (!isAuthenticated) {
                  openSignInModal();
                  return;
                }
                setIsReportModalOpen(true);
              }}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-red-600"
              aria-label="Report Story"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportStoryModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        storyId={storyId} 
        storyTitle={story.title}
      />
    </div>
  );
}
