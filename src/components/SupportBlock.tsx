'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface SupportBlockProps {
  className?: string;
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function SupportBlock({ 
  className = '', 
  title = 'Support our mission',
  description = 'Your story is now part of our digital archive. Help us preserve these precious memories for future generations by supporting our millennium vault project. Your contribution makes a difference.',
  buttonText = 'Support Our Project'
}: SupportBlockProps) {
  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800 ${className}`}>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="red" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold mb-2 text-blue-800 dark:text-blue-300">{title}</h3>
          <p className="text-blue-700 dark:text-blue-400 mb-4">
            {description}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="/support">
              <Button
                variant="primary"
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
