"use client";

import { useState } from 'react';
import Image from 'next/image';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function FallbackImage({ src, alt, className }: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  
  const handleError = () => {
    setImgSrc('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300" fill="none"%3E%3Crect width="500" height="300" fill="%23f1f5f9"%3E%3C/rect%3E%3Cpath d="M250 150C277.614 150 300 127.614 300 100C300 72.3858 277.614 50 250 50C222.386 50 200 72.3858 200 100C200 127.614 222.386 150 250 150Z" fill="%23cbd5e1"%3E%3C/path%3E%3Cpath d="M175 225C175 197.386 197.386 175 225 175H275C302.614 175 325 197.386 325 225V225C325 252.614 302.614 275 275 275H225C197.386 275 175 252.614 175 225V225Z" fill="%23cbd5e1"%3E%3C/path%3E%3Ctext x="250" y="200" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle" fill="%2394a3b8"%3EVault Illustration%3C/text%3E%3C/svg%3E');
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={500}
      height={300}
      className={className}
      onError={handleError}
      unoptimized={imgSrc.startsWith('data:')}
    />
  );
}
