'use client';

import Link from 'next/link';
import { StoryFormProps } from './StoryFormTypes';
import FileList from './FileList';
import AttachmentsList from './AttachmentsList';
import FileUploadArea from './FileUploadArea';
import { Button } from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Tooltip from '@/components/ui/Tooltip';
import { createMd5Hash } from '@/lib/utils';

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
  
  // State for unlock date and secret password
  const [unlockDate, setUnlockDate] = useState(getValues('unlockDate') || '');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordExists, setPasswordExists] = useState(!!getValues('unlockPasswordHash'));
  
  // Initialize secret password as empty when there's an existing password hash
  const [secretPassword, setSecretPassword] = useState(passwordExists ? '' : (getValues('secretPassword') || ''));
  
  // State to track if unlock date should be set
  const [setupUnlockDate, setSetupUnlockDate] = useState(getValues('unlockDate') ? true : false);
  
  // Function to generate a secure random password
  const generatePassword = () => {
    const numbers = '0123456789';
    const lowerLetters = 'abcdefghijklmnopqrstuvwxyz';
    const upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    
    const allChars = numbers + lowerLetters + upperLetters + specialChars;
    let password = '';
    
    // Ensure at least one of each character type
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += lowerLetters.charAt(Math.floor(Math.random() * lowerLetters.length));
    password += upperLetters.charAt(Math.floor(Math.random() * upperLetters.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Fill the rest to reach 20 characters
    for (let i = 4; i < 20; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    return password;
  };
  
  // Generate password on component mount only for new stories without existing password
  useEffect(() => {
    // Only generate a new password if:
    // 1. We don't have a password set in the form
    // 2. There's no existing password hash
    // 3. We're not in edit mode with an existing hash
    if (!secretPassword && !passwordExists) {
      const newPassword = generatePassword();
      setSecretPassword(newPassword);
    }
  }, []);  // Empty dependency array ensures this only runs once on mount
  
  // Function to copy password to clipboard
  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(secretPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000); // Reset after 2 seconds
  };

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
    
    // If unlock date is set, generate the MD5 hash of the password
    if (setupUnlockDate && unlockDate) {
      // Only update password hash if we have a new password or generating a new one
      if (secretPassword && !passwordExists) {
        // Register the unlockPasswordHash with the form
        register('unlockPasswordHash').onChange({
          target: { name: 'unlockPasswordHash', value: createMd5Hash(secretPassword) }
        });
      }
    } else {
      // If unlock date is not set, clear the password hash
      register('unlockPasswordHash').onChange({
        target: { name: 'unlockPasswordHash', value: null }
      });
    }
  };
  
  // Clear password and hash when unlock date setup is toggled off
  useEffect(() => {
    if (!setupUnlockDate) {
      register('unlockPasswordHash').onChange({
        target: { name: 'unlockPasswordHash', value: null }
      });
    }
  }, [setupUnlockDate, register]);

  return (
    <form onSubmit={(e) => {
      handleFormSubmit(e);
      handleSubmit(onSubmit)(e);
    }} className="space-y-8">
      {/* Introduction and guidance */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700/70 mb-6">
        <h2 className="text-lg font-medium text-primary mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          {t('storyForm.introTitle') || 'Create Your Timeless Story'}
        </h2>
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
          <p>{t('storyForm.introText1') || 'Your story is a precious time capsule that can be preserved for generations. Take your time to craft it with care and detail.'}</p>
          <p>{t('storyForm.introText2') || 'Begin with a meaningful title, then share your memories in the content section. You can add photos and documents to enrich your story.'}</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>{t('storyForm.tip1') || 'You can save and edit your story at any time before publishing.'}</span>
            </div>
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>{t('storyForm.tip2') || 'Add photos, letters, or documents to make your story come alive.'}</span>
            </div>
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>{t('storyForm.tip3') || 'Choose if your story is private or public in the privacy settings below.'}</span>
            </div>
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>{t('storyForm.tip4') || 'Your story will be securely preserved in our millennium vault.'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Title Field */}
      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium text-base mb-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="flex items-center gap-1">
            {t('title.label')}
            <Tooltip 
              text={
                <div className="max-w-md">
                  <p className="font-medium mb-1">{t('title.helpTitle') || 'Make your title memorable'}</p>
                  <p className="text-sm">{t('title.helpText') || 'A good title helps you and others identify your story easily. Be descriptive but concise.'}</p>
                  <p className="text-sm italic mt-2">{t('title.helpExample') || 'Example: "Our Trip to Paris, Summer 2025"'}</p>
                </div>
              } 
              position="right"
            />
          </span>
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
            <span className="flex items-center gap-1">
              {t('content.label')}
              <Tooltip 
                text={
                  <div>
                    <p className="font-medium mb-1">{t('content.helpTitle') || 'Express yourself'}</p>
                    <p className="text-sm">{t('content.helpText') || 'Write your story here. You can use up to 1000 words to share your memories, thoughts, or messages.'}</p>
                    <p className="text-sm mt-2">{t('content.helpNote') || 'Note: The content will be displayed exactly as entered, so check your spelling and formatting.'}</p>
                  </div>
                } 
                position="right"
              />
            </span>
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
          <span className="flex items-center gap-1">
            {t('media.title')}
            <Tooltip 
              text={
                <div>
                  <p className="font-medium mb-1">{t('media.helpTitle') || 'Add visual memories'}</p>
                  <p className="text-sm">{t('media.helpText') || 'Upload photos, documents, or other files to enhance your story. Supported formats include: jpg, png, pdf, and more.'}</p>
                  <p className="text-sm mt-2">{t('media.helpCover') || 'You can select one image as your story cover by clicking the star icon.'}</p>
                </div>
              } 
              position="right"
            />
          </span>
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
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <path d="M7 15h0m5 0h0m5 0h0"/>
            <path d="M7 12a5 5 0 0 1 10 0v2a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-2z"/>
            <path d="M12 3v7"/>
          </svg>
          {t('media.privacy.title')}
        </h3>
        
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
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    setIsPublic(e.target.checked);
                    // If story is made public, disable unlock date
                    if (e.target.checked) {
                      setSetupUnlockDate(false);
                    }
                  }
                })}
              />
            </div>
            <label htmlFor="isPublic" className="ml-3 text-sm flex items-center gap-1">
              {t('media.privacy.makePublic')}
              <Tooltip 
                text={
                  <div>
                    <p className="font-medium mb-1">{t('media.privacy.publicHelpTitle') || 'Public Stories'}</p>
                    <p className="text-sm">{t('media.privacy.publicHelpText') || 'When enabled, your story will be visible to everyone. Anyone with a link can view it, and it may appear in public feeds.'}</p>
                    <p className="text-sm mt-2">{t('media.privacy.publicHelpNote') || 'If disabled, only you will be able to see this story.'}</p>
                  </div>
                } 
                position="top"
              />
            </label>
          </div>

          {/* Vault storage option */}
          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="storeInVault"
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30"
                {...register('storeInVault')}
              />
            </div>
            <label htmlFor="storeInVault" className="ml-3 text-sm flex items-center gap-1">
              {t('media.privacy.storeInVault') || 'I want my story physically stored into vault'}
              <Tooltip 
                text={
                  <div>
                    <p className="font-medium mb-1">{t('media.storeInVault.helpTitle') || 'Physical Vault Storage'}</p>
                    <p className="text-sm">{t('media.storeInVault.helpText') || 'When enabled, your story will be physically stored in our current active time capsule vault.'}</p>
                    <p className="text-sm mt-2">{t('media.storeInVault.helpNote') || 'Your story will be securely preserved alongside others in this time-limited collection.'}</p>
                  </div>
                } 
                position="top"
              />
            </label>
          </div>
          
          {/* Setup Unlock Date checkbox - only enabled for private stories */}
          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="setupUnlockDate"
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30"
                checked={setupUnlockDate}
                onChange={(e) => setSetupUnlockDate(e.target.checked)}
                disabled={isPublic}
              />
            </div>
            <label htmlFor="setupUnlockDate" className="ml-3 text-sm flex items-center gap-1">
              {t('media.privacy.setupUnlockDate') || 'Setup Unlock Date'}
              <Tooltip 
                text={
                  <div>
                    <p className="font-medium mb-1">{t('media.unlockDate.helpTitle') || 'Time-locked Stories'}</p>
                    <p className="text-sm">{t('media.unlockDate.helpText') || 'When enabled, your private story will remain locked until the specified date. On that date, anyone with the secret password can unlock and view it.'}</p>
                    <p className="text-sm mt-2">{t('media.unlockDate.helpSecurity') || 'The auto-generated secret password ensures only those you share it with can access your story after the unlock date.'}</p>
                    <p className="text-sm mt-2">{t('media.unlockDate.helpNote') || 'Note: This feature is only available for private stories.'}</p>
                  </div>
                } 
                position="top"
              />
            </label>
          </div>
        </div>
      </div>
      
      {/* Unlock Date Section - Only shown when story is private and user wants to set unlock date */}
      {!isPublic && setupUnlockDate && (
        <div className="rounded-lg bg-muted/30">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {t('media.unlockDate.title') || 'Unlock Date'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selector */}
            <div className="space-y-2">
              <label htmlFor="unlockDate" className="block font-medium text-sm mb-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('media.unlockDate.dateLabel') || 'Select Date'}
              </label>
              <DatePicker
                id="unlockDate"
                value={unlockDate}
                onChange={(date) => {
                  setUnlockDate(date);
                  // Register the value
                  register('unlockDate').onChange({
                    target: { name: 'unlockDate', value: date }
                  });
                }}
                placeholder={t('media.unlockDate.placeholder') || 'Select a date'}
              />
              <p className="text-sm text-muted-foreground">
                {t('media.unlockDate.dateHelp') || 'Story will be locked until this date'}
              </p>
            </div>
            
            {/* Secret Password */}
            <div className="space-y-2">
              <label htmlFor="secretPassword" className="block font-medium text-sm mb-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('media.unlockDate.secretPasswordLabel') || 'Secret Password'}
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    id="secretPassword"
                    className="w-full px-5 py-4 border-[1.5px] rounded border-gray-300 text-primary focus:ring-primary/30"
                    value={secretPassword}
                    placeholder={passwordExists ? t('media.unlockDate.passwordPlaceholder') || 'Password saved. Generate new if needed' : ''}
                    readOnly
                    {...register('secretPassword')}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    {/* Regenerate Password Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newPassword = generatePassword();
                        setSecretPassword(newPassword);
                        setPasswordExists(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                      title={t('media.unlockDate.regenerateButton') || 'Generate New Password'}
                    >
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {t('media.unlockDate.regenerateButtonText') || 'New'}
                      </span>
                    </button>
                    
                    {/* Copy Password Button */}
                    <button
                      type="button"
                      onClick={copyPasswordToClipboard}
                      disabled={!secretPassword}
                      className="px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordCopied ? (
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t('media.unlockDate.copiedButton') || 'Copied'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {t('media.unlockDate.copyButton') || 'Copy'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('media.unlockDate.secretPasswordHelp') || 'This password will be required to unlock your story after the set date'}
              </p>
            </div>
          </div>
        </div>
      )}
      
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
