'use client';

import Link from 'next/link';
import { StoryFormProps } from './StoryFormTypes';
import FileList from './FileList';
import AttachmentsList from './AttachmentsList';
import FileUploadArea from './FileUploadArea';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

/**
 * Shared form component for creating and editing stories
 */
export default function StoryForm({
  register,
  handleSubmit,
  formState,
  errors,
  getValues,
  watch,
  onSubmit,
  isSubmitting,
  submitButtonText,
  loadingButtonText,
  files,
  handleFiles,
  removeFile,
  handleFileChange,
  coverImageId,
  setCoverImageId,
  wordCount,
  isEdit = false,
  attachments = [],
  removeAttachment,
  onCancel,
  onDelete,
  uploadProgress = {},
  hashReplicatingAttachment = false,
}: StoryFormProps) {
  const t = useTranslations('User.newStory.form');
  
  // State to track the public/private status
  const [isPublic, setIsPublic] = useState(getValues('isPublic') || false);

  // Helper function to calculate total file size
  const getTotalFileSize = (files: any[], returnRawSize = false) => {
    // Calculate size of files
    const totalBytes = files.reduce((acc, file) => {
      const fileSize = file.file ? file.file.size : file.size;
      return acc + fileSize;
    }, 0);
    
    // If we're in the edit page, we also need to include attachments in the calculation
    // This is handled separately in the FileUploadArea component
    
    if (returnRawSize) {
      return totalBytes / (1024 * 1024); // Return size in MB
    }
    
    // Format size for display
    if (totalBytes < 1024) {
      return `${totalBytes} B`;
    } else if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Create a submit handler that prevents double submissions
  const handleFormSubmit = (e: React.FormEvent) => {
    // The isSubmitting state will be set by React Hook Form
    // This is just an extra safety measure to prevent double clicks
    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
  };

  return (
    <form onSubmit={(e) => {
      handleFormSubmit(e);
      handleSubmit(onSubmit)(e);
    }} className="space-y-8">
      {/* Title Field */}
      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium text-base mb-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('title.label')}
        </label>
        <div className="relative">
          <input
            id="title"
            type="text"
            className={`w-full px-5 py-4 border-[1.5px] shadow-sm rounded-xl bg-background/90 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.title ? 'border-red-500' : 'border-primary/10 dark:border-primary/20'}`}
            placeholder={t('title.placeholder')}
            {...register('title')}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Story Content Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="content" className="block font-medium text-base flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            {t('content.label')}
          </label>
          <span className={`text-sm ${wordCount > 1000 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
            {t('content.wordCount', { count: wordCount })}
          </span>
        </div>
        <div className="relative">
          <textarea
            id="content"
            rows={10}
            className={`w-full px-6 py-5 border-[1.5px] shadow-sm rounded-xl bg-background/90 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all min-h-[300px] ${errors.content ? 'border-red-500' : 'border-primary/10 dark:border-primary/20'}`}
            placeholder={t('content.placeholder')}
            style={{ resize: 'vertical', lineHeight: '1.6' }}
            {...register('content')}
          />
          <div className="absolute right-4 top-5 text-muted-foreground/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
        {wordCount > 1000 && (
          <p className="text-red-500 text-sm mt-1">
            {t('content.wordLimitExceeded')}
          </p>
        )}
      </div>

      {/* Media Files */}
      <div className="bg-card">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          {t('media.title')}
        </h3>
        
        {/* Warning message when media files are still replicating */}
        {isEdit && hashReplicatingAttachment && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('media.replicatingWarning.title')}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">{t('media.replicatingWarning.description')}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* File upload area - moved to top for better UX */}
        <FileUploadArea
          handleFiles={handleFiles}
          handleFileChange={handleFileChange}
          getTotalFileSize={getTotalFileSize}
          files={files}
          attachments={attachments}
        />
        
        {/* Content container for files */}
        <div className="mt-6 space-y-6">
          {/* Existing attachments (edit mode only) */}
          {isEdit && attachments && attachments.length > 0 && (
            <AttachmentsList
              attachments={attachments}
              coverImageId={coverImageId}
              setCoverImageId={setCoverImageId}
              removeAttachment={removeAttachment!}
            />
          )}
          
          {/* New files to upload */}
          {files.length > 0 && (
            <FileList
              files={files}
              coverImageId={coverImageId}
              setCoverImageId={setCoverImageId}
              removeFile={removeFile}
              uploadProgress={uploadProgress}
            />
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-lg bg-muted/30">
        <h3 className="font-medium mb-4">{t('media.privacy.title')}</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30"
                {...register('agreeToTerms')}
              />
            </div>
            <label htmlFor="agreeToTerms" className="ml-3 text-sm">
              <span>
                I agree to the{' '}
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t('media.privacy.termsLink')}
                </Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t('media.privacy.privacyLink')}
                </Link>
              </span>
              {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms.message}</p>}
            </label>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="isPublic"
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30"
                {...register('isPublic', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setIsPublic(e.target.checked)
                })}
              />
            </div>
            <label htmlFor="isPublic" className="ml-3 text-sm">
              {t('media.privacy.makePublic')}
            </label>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        
        {/* Submit button - always present */}
        <div className="flex">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            className={`flex flex-col items-center justify-center gap-1.5 py-5 px-7 h-auto min-h-[68px] min-w-[240px] w-full sm:w-auto rounded-xl shadow-md transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg border border-opacity-10 ${isPublic 
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 border-emerald-400' 
              : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 border-slate-500'}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin mb-1"></div>
                <span>{loadingButtonText}</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  <span className="text-md font-normal">{isEdit ? t('submitButtonUpdate') : t('submitButtonSave')}</span>
                </div>
                <span className="text-xs font-bold">
                  {isPublic 
                    ? t('media.privacy.statusPublicDesc') || 'Everyone can see it' 
                    : t('media.privacy.statusPrivateDesc') || 'Only you can see it'}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
