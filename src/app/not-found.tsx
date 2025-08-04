'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [isAnimated, setIsAnimated] = useState(false);
  
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 overflow-hidden">
      <div className="relative w-full max-w-3xl mx-auto text-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/20 blur-3xl transition-all duration-1000 ease-out ${isAnimated ? 'opacity-70 scale-150' : 'opacity-0 scale-50'}`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-secondary/20 blur-3xl transition-all duration-1000 ease-out ${isAnimated ? 'opacity-70 scale-150' : 'opacity-0 scale-50'}`} style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* 404 Large Text */}
        <div className="relative">
          <h1 className={`text-[12rem] md:text-[16rem] font-bold leading-none transition-all duration-700 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="gradient-text">4</span>
            <span className="relative inline-block mx-4">
              <span className="absolute inset-0 flex items-center justify-center">
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary transition-all duration-1000 ${isAnimated ? 'animate-pulse-slow' : ''}`}></div>
              </span>
              <span className="relative z-10 text-white text-shadow-lg font-black drop-shadow-lg">0</span>
            </span>
            <span className="gradient-text">4</span>
          </h1>
        </div>
        
        {/* Content */}
        <div className={`mt-8 space-y-6 transition-all duration-700 delay-300 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Let's help you find your way back.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link 
              href="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 min-w-[180px] flex items-center justify-center group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Go Home
            </Link>
            
            <Link 
              href="/user/stories/new"
              className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-all duration-300 min-w-[180px] flex items-center justify-center"
            >
              Store a Story
            </Link>
          </div>
        </div>
        
        {/* Animated elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className={`absolute top-[10%] left-[15%] transition-all duration-1000 delay-500 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-8 h-8 text-primary/30 animate-float" style={{ animationDelay: '0s' }}>
              <HeartIcon className="w-full h-full" />
            </div>
          </div>
          <div className={`absolute top-[60%] left-[80%] transition-all duration-1000 delay-700 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-12 h-12 text-secondary/30 animate-float" style={{ animationDelay: '1.5s' }}>
              <HeartIcon className="w-full h-full" />
            </div>
          </div>
          <div className={`absolute top-[80%] left-[10%] transition-all duration-1000 delay-900 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-10 h-10 text-primary/30 animate-float-reverse" style={{ animationDelay: '1s' }}>
              <HeartIcon className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Heart icon component
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}
