'use client';

import { useState } from 'react';
import { getHumanReadableS3Region } from '@/lib/s3Region';
import { FileUploadAreaProps } from './StoryFormTypes';
import { useTranslations } from 'next-intl';

/**
 * Component for handling file uploads with drag and drop functionality
 */
export default function FileUploadArea({
  handleFiles,
  handleFileChange,
  getTotalFileSize,
  files,
  attachments = []
}: FileUploadAreaProps) {
  const t = useTranslations('User.newStory.form.media.upload');
  const [isDragging, setIsDragging] = useState(false);
  
  // Get human-readable S3 region for display using the s3Region library
  const getRegionDisplay = () => {
    // This will be called client-side without headers, so it will use the default region
    // When the actual upload happens, we'll get the region from the server based on the user's location
    return getHumanReadableS3Region();
  };
  

  // Calculate total size of all files (new uploads + existing attachments)
  const calculateTotalSize = () => {
    // Get total size of new files using the provided getTotalFileSize function
    // This already returns the size in MB
    const newFilesSize = getTotalFileSize(files, true) as number;
    //console.log('Files array:', files);
    //console.log('getTotalFileSize result:', newFilesSize);
    
    // Calculate size of existing attachments if available
    //console.log('Attachments array:', attachments);
    
    // Only use attachments with actual size values from the database
    // No fallback estimates as per user requirement
    const attachmentsSize = attachments.reduce((acc, attachment) => {
      if (typeof attachment.size === 'number' && attachment.size > 0) {
        // Convert bytes to MB (divide by 1024 twice)
        // Using 1048576 (1024*1024) for more accurate conversion
        const sizeInMB = attachment.size / 1048576;
        //console.log(`Using actual size for ${attachment.fileName}: ${attachment.size} bytes = ${sizeInMB.toFixed(2)} MB`);
        return acc + sizeInMB;
      }
      // Skip attachments without size data
      //console.log(`Skipping ${attachment.fileName}: No size data available`);
      return acc;
    }, 0);
    
    // For debugging
    //console.log('New files size:', newFilesSize, 'MB');
    //console.log('Attachments size:', attachmentsSize, 'MB');
    //console.log('Total size:', newFilesSize + attachmentsSize, 'MB');
    
    return newFilesSize + attachmentsSize;
  };
  
  // Calculate percentage of storage used
  const getStoragePercentage = () => {
    const totalSize = calculateTotalSize();
    // Assuming 100MB limit
    return Math.min((totalSize / 100) * 100, 100);
  };
  
  // Get progress bar color based on percentage
  const getProgressColor = () => {
    const percentage = getStoragePercentage();
    if (percentage <= 40) return 'bg-emerald-400';
    if (percentage <= 75) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  return (
    <div>
      {/* File input with drag and drop */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[0.99]' 
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            handleFiles(newFiles);
          }
        }}
      >
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-base font-medium mb-1">{t('dragDrop')}</div>
            <div className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('supportedFormats')}
              </span>
            </div>
          </div>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          multiple
          className="sr-only"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.mp3,.aac"
        />
      </div>
      
      {/* File formats and region info */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">{t('formats.title')}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground pl-6 space-y-1">
            <div>{t('formats.images')}</div>
            <div>{t('formats.videos')}</div>
            <div>{t('formats.audio')}</div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{t('region.title')}</span>
          </div>
          <div className="mt-1 text-xs pl-6">
            <div>{t('region.closest', { region: getRegionDisplay() })}</div>
            <div className="text-muted-foreground">{t('region.info')}</div>
          </div>
        </div>
      </div>
      
      {/* Storage usage indicator */}
      <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{t('storage.title')}</span>
          <span className="text-primary font-medium">{t('storage.used', { used: (calculateTotalSize()).toFixed(1) })}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-md h-5 overflow-hidden border border-gray-300 relative">
          <div 
            className={`h-5 rounded-sm transition-all ${getProgressColor()}`}
            style={{ width: `${Math.max(getStoragePercentage(), 1)}%`, boxShadow: '0 0 5px rgba(0,0,0,0.2) inset' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/80">
            <span className="px-2 py-0.5 bg-white/30 rounded backdrop-blur-sm">{t('storage.percentage', { percentage: getStoragePercentage().toFixed(1) })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
