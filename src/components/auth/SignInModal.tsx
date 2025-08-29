'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SignInForm from './SignInForm';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function SignInModal() {
  const { isSignInModalOpen, closeSignInModal } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<'email' | 'verification' | 'profile'>('email');
  const t = useTranslations('Auth');
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (currentStep === 'email') {
          closeSignInModal();
        }
      }
    };
    
    if (isSignInModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isSignInModalOpen, closeSignInModal, currentStep]);
  
  // Close on escape key, but only in email step
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only close if in email step, not during verification
        if (currentStep === 'email') {
          closeSignInModal();
        }
      }
    };
    
    if (isSignInModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSignInModalOpen, closeSignInModal, currentStep]);
  
  if (!isSignInModalOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Solid backdrop */}
      <div className="absolute inset-0 bg-black opacity-80" />
      
      {/* Modal with improved contrast for dark mode */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-background rounded-md shadow-2xl border border-border overflow-hidden animate-fade-in-up z-50"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Subtle gradient accent line at top */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-primary"></div>
        
        {/* Header with cleaner spacing */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
          <h2 className="text-xl font-semibold tracking-tight">
            <span className="gradient-text">{t('modal.title')}</span>
            <span className="ml-1.5 text-foreground/60 text-sm font-normal">{t('modal.subtitle')}</span>
          </h2>
          <Button 
            onClick={closeSignInModal}
            variant="ghost"
            size="icon"
            aria-label={t('modal.close')}
          >
            <svg className="w-5 h-5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        {/* Content area with improved spacing */}
        <div className="p-6 pt-5">
          <SignInForm 
            onClose={closeSignInModal} 
            onStepChange={setCurrentStep}
            className="space-y-5"
          />
        </div>
      </div>
    </div>
  );
}
