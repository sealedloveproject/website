'use client';

import Link from 'next/link';
import { StoryFormProps } from './StoryFormTypes';
import FileList from './FileList';
import AttachmentsList from './AttachmentsList';
import FileUploadArea from './FileUploadArea';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

/**
 * Shared form component for creating and editing stories
 */
export default function StoryForm({
  register,
  handleSubmit,
  formState,
  errors,
  getValues,
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
        <label htmlFor="title" className="block font-medium">
          {t('title.label')}
        </label>
        <input
          id="title"
          type="text"
          className={`w-full p-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.title ? 'border-red-500' : 'border-border'}`}
          placeholder={t('title.placeholder')}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Story Content Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="content" className="block font-medium">
            {t('content.label')}
          </label>
          <span className={`text-sm ${wordCount > 1000 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
            {t('content.wordCount', { count: wordCount })}
          </span>
        </div>
        <textarea
          id="content"
          rows={10}
          className={`w-full p-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all min-h-[300px] ${errors.content ? 'border-red-500' : 'border-border'}`}
          placeholder={t('content.placeholder')}
          {...register('content')}
        />
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
      <div className="p-6 rounded-lg bg-muted/30 border border-border">
        <h3 className="font-medium mb-4">{t('media.privacy.title')}</h3>
        
        <div className="flex items-start mb-4">
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
              {...register('isPublic')}
            />
          </div>
          <label htmlFor="isPublic" className="ml-3 text-sm">
            {t('media.privacy.makePublic')}
          </label>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        
        {/* Right-aligned buttons */}
        <div className={`flex space-x-4 ${isEdit && onDelete ? 'ml-auto' : ''}`}>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                <span>{loadingButtonText}</span>
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
