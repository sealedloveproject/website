"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  // Create portal to render modal outside of normal DOM hierarchy
  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div 
        className="fixed inset-0 backdrop-blur-sm" 
        onClick={onClose}
        style={{ backgroundColor: 'var(--overlay-dark)' }}
      ></div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className={`relative rounded-xl z-[10000] ${className}`}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            backgroundColor: 'var(--card)',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
