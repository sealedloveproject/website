'use client';

import React from 'react';

type TooltipProps = {
  text: string | React.ReactNode;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  icon?: React.ReactNode;
};

/**
 * A reusable tooltip component that displays information when hovering over the trigger element
 * Uses Tailwind's group hover functionality for reliable display
 */
export default function Tooltip({
  text,
  children,
  position = 'top',
  width = '250px',
  icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}: TooltipProps) {
  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
    }
  };

  // Arrow classes
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-[-8px] left-1/2 transform -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'top-[-8px] left-1/2 transform -translate-x-1/2 border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'right-[-8px] top-1/2 transform -translate-y-1/2 border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'left-[-8px] top-1/2 transform -translate-y-1/2 border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'bottom-[-8px] left-1/2 transform -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div className="group inline-flex items-center relative">
      {/* Tooltip trigger */}
      <div className="cursor-help inline-flex items-center text-slate-500 group-hover:text-primary transition-colors ml-1">
        {icon}
        {children}
      </div>

      {/* Tooltip content - hidden by default, shown on group hover */}
      <div 
        className={`absolute z-50 hidden group-hover:block ${getPositionClasses()}`}
        style={{ width, minWidth: '200px' }}
      >
        <div className="bg-slate-800 text-white p-3 rounded-lg shadow-lg text-sm relative">
          <div className={`absolute w-0 h-0 border-[8px] ${getArrowClasses()}`} />
          {typeof text === 'string' ? <p>{text}</p> : text}
        </div>
      </div>
    </div>
  );
}
