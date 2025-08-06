'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { FileListProps } from './StoryFormTypes';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

/**
 * Component for displaying a list of files to be uploaded
 */
export default function FileList({
  files,
  coverImageId,
  setCoverImageId,
  removeFile,
  isNewFile = true,
  uploadProgress = {}
}: FileListProps) {
  const t = useTranslations('User.newStory.form.media.fileList');
  // Store object URLs to prevent recreation on every render
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  // Helper to get file object from different file types
  const getFile = (fileData: any): File => {
    if (fileData.file) {
      return fileData.file;
    }
    return fileData as File;
  };

  // Helper to get file ID from different file types
  const getFileId = (fileData: any): string => {
    if (fileData.id) {
      return fileData.id;
    }
    // Fallback for simple File objects
    return fileData.name + fileData.size + fileData.lastModified;
  };

  // Calculate overall upload progress
  const calculateOverallProgress = () => {
    if (Object.keys(uploadProgress).length === 0) return 0;
    
    const totalProgress = Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0);
    return totalProgress / Object.keys(uploadProgress).length;
  };
  
  const overallProgress = calculateOverallProgress();
  
  // Create and manage object URLs for file previews
  useEffect(() => {
    // Create object URLs for new files that don't have one yet
    const newUrls: Record<string, string> = {...objectUrls};
    let urlsUpdated = false;
    
    files.forEach(fileData => {
      const file = getFile(fileData);
      const fileId = getFileId(fileData);
      
      if (!objectUrls[fileId]) {
        newUrls[fileId] = URL.createObjectURL(file);
        urlsUpdated = true;
      }
    });
    
    if (urlsUpdated) {
      setObjectUrls(newUrls);
    }
    
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      Object.values(objectUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isNewFile ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          )}
        </svg>
        {isNewFile ? t('title') : t('uploadedTitle')}
      </h4>
      
      {/* Global progress bar */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="h-1.5 bg-muted/30 rounded-full mb-3 overflow-hidden">
          <div 
            className="h-1.5 bg-green-500 transition-all rounded-full" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {files.map((fileData: any) => {
          const file = getFile(fileData);
          const fileId = getFileId(fileData);
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          const isAudio = file.type.startsWith('audio/');
          const isCover = fileId === coverImageId;
          
          // Determine file size for display
          const fileSize = file.size;
          let fileSizeDisplay = '';
          if (fileSize < 1024) {
            fileSizeDisplay = `${fileSize} B`;
          } else if (fileSize < 1024 * 1024) {
            fileSizeDisplay = `${(fileSize / 1024).toFixed(1)} KB`;
          } else {
            fileSizeDisplay = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
          }
          
          return (
            <div 
              key={fileId} 
              className={`rounded-lg border overflow-hidden transition-all ${
                isCover 
                  ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-md' 
                  : 'border-border bg-card hover:shadow-sm'
              }`}
            >
              {/* File preview area - smaller aspect ratio */}
              <div className="aspect-[4/2] w-full bg-muted/50 overflow-hidden flex items-center justify-center relative">
                {isImage ? (
                  objectUrls[fileId] ? (
                    <Image 
                      src={objectUrls[fileId]} 
                      alt="" 
                      width={400}
                      height={200}
                      className="w-full h-full object-cover" 
                      unoptimized={true} // Required for blob URLs
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted/30">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  )
                ) : isVideo ? (
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground mt-1">Video</span>
                  </div>
                ) : isAudio ? (
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground mt-1">Audio</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground mt-1">File</span>
                  </div>
                )}
              </div>
              

              
              {/* File info */}
              <div className="p-3">
                {/* Individual file progress bar */}
                {uploadProgress[fileId] !== undefined && (
                  <div className="w-full h-1.5 bg-muted/30 rounded-full mb-2 overflow-hidden">
                    <div 
                      className="h-1.5 bg-green-500 transition-all rounded-full" 
                      style={{ width: `${uploadProgress[fileId]}%` }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  {/* File type icon - smaller */}
                  <div className="w-6 h-6 rounded-full bg-muted/70 flex-shrink-0 flex items-center justify-center">
                    {isImage && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {isVideo && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {isAudio && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    )}
                    {!isImage && !isVideo && !isAudio && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* File name and size - more compact */}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{fileSizeDisplay}</div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center justify-between mt-1">
                  {isImage && (
                    <Button 
                      type="button"
                      onClick={() => setCoverImageId(fileId)}
                      variant={isCover ? "primary" : "ghost"}
                      size="sm"
                      className="text-xs"
                    >
                      {isCover ? (
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t('coverImage')}
                        </span>
                      ) : t('setAsCover')}
                    </Button>
                  )}
                  {!isImage && <span></span>}
                  
                  <Button 
                    type="button" 
                    onClick={() => removeFile(fileId)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                    title={t('removeFile')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
