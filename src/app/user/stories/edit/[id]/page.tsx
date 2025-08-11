'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { updateStory, getStoryById, deleteStory, deleteAttachment, type StoryUpdate } from '@/app/actions/stories/story';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storyFormSchema, type StoryFormData } from '@/schemas/story';
import { uploadFilesToS3 } from '@/lib/uploadToS3';
import StoryForm from '@/components/stories/StoryForm';
import Modal from '@/components/ui/Modal';
import { useTranslations } from 'next-intl';
import UserBreadcrumbs from '@/components/user/Breadcrumbs';

export default function EditStory() {
  const { user, isAuthenticated, openSignInModal, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  const t = useTranslations('User.editStory');
  
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyLoaded, setStoryLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attachments, setAttachments] = useState<Array<{id: string, fileName: string, fileType: string, fileUrl: string | null | undefined, isCoverImage?: boolean}>>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [hashReplicatingAttachment, setHashReplicatingAttachment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(storyFormSchema) as any,
    defaultValues: {
      title: '',
      content: '',
      isPublic: false,
      agreeToTerms: true
    }
  });
  
  // Watch the story content for word count
  const storyContent = watch('content');
  
  // Update word count when content changes
  useEffect(() => {
    if (storyContent) {
      const words = storyContent.trim() ? storyContent.trim().split(/\s+/).length : 0;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [storyContent]);
  
  // Load story data - use useCallback to stabilize the function
  const loadStory = useCallback(async () => {
    // Prevent loading if story is already loaded (prevents Alt+Tab reloads)
    if (storyLoaded) {
      return;
    }
    
    // Only check authentication after the auth context has finished loading
    if (!authLoading && (!isAuthenticated || !user?.email)) {
      openSignInModal();
      return;
    }
    
    // Don't try to load story data if we're still checking authentication
    if (authLoading || !user?.email) {
      return;
    }

    try {
      setIsLoading(true);
      
      // NextAuth handles authentication on the server side now
      const result = await getStoryById(storyId, user.email);
      
      if (result.success && result.story) {
        // Pre-fill form with story data
        reset({
          title: result.story.title,
          content: result.story.content,
          isPublic: result.story.isPublic,
          agreeToTerms: true,
        });
        // console.log(result)
        setHashReplicatingAttachment(result.story.hashReplicatingAttachment);

        // Update word count
        setWordCount(result.story.content.trim().split(/\s+/).length);
        
        // Set attachments
        if (result.story.attachments) {
          setAttachments(result.story.attachments);
          
          // Set cover image if available
          if (result.story.coverImageId) {
            setCoverImageId(result.story.coverImageId);
          } else {
            // If no cover image is set, use the first image attachment as the default cover
            const firstImageAttachment = result.story.attachments.find(att => att.fileType.startsWith('image/'));
            if (firstImageAttachment) {
              setCoverImageId(firstImageAttachment.id);
            }
          }
        }
        
        setStoryLoaded(true);
      } else {
        setError(t('errors.notFound'));
      }
    } catch (error) {
      //console.error('Error loading story:', error);
      setError(t('errors.loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [storyId, user?.email, isAuthenticated, authLoading, reset, storyLoaded, openSignInModal, t]);
  
  // Load story data on component mount
  useEffect(() => {
    loadStory();
  }, [loadStory]);
  
  // Calculate total file size
  const getTotalFileSize = (fileList: File[], existingAttachments: Array<{id: string, fileName: string, fileType: string, fileUrl: string | null | undefined, isCoverImage?: boolean, size?: number}> = [], returnRawSize = false) => {
    // Calculate size of files to upload (in bytes)
    const newFilesSize = fileList.reduce((acc, curr) => acc + curr.size, 0);
    
    // Calculate size of existing attachments using the actual size property if available (in bytes)
    const existingFilesSize = existingAttachments.reduce((acc, curr) => {
      // Use the actual size if available, otherwise use a fallback estimate
      if (typeof curr.size === 'number' && curr.size > 0) {
        // Size from S3 is already in bytes, use as is
        return acc + curr.size;
      } else {
        // Fallback to estimates if size is not available (in bytes)
        if (curr.fileType.startsWith('image/')) {
          return acc + 2 * 1024 * 1024; // 2MB per image
        } else if (curr.fileType.startsWith('video/')) {
          return acc + 10 * 1024 * 1024; // 10MB per video
        } else if (curr.fileType.startsWith('audio/')) {
          return acc + 5 * 1024 * 1024; // 5MB per audio
        }
        return acc + 1 * 1024 * 1024; // 1MB for other files
      }
    }, 0);
    
    //  Log sizes for debugging
    //console.log('Edit page - New files size (bytes):', newFilesSize);
    //console.log('Edit page - Existing attachments size (bytes):', existingFilesSize);
    //console.log('Edit page - Total size (bytes):', newFilesSize + existingFilesSize);
    
    const totalBytes = newFilesSize + existingFilesSize;
    const totalMB = totalBytes / (1024 * 1024); // Convert bytes to MB
    
    if (returnRawSize) {
      return totalMB;
    }
    
    return totalMB.toFixed(2) + ' MB';
  };
  
  // Handle files (both from input and drag-drop)
  const handleFiles = (fileArray: File[]) => {
    // Filter files to only include allowed types
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.mp3', '.aac'];
    const validFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedExtensions.includes(extension);
    });
    
    // Alert if some files were filtered out
    if (validFiles.length < fileArray.length) {
      alert(t('fileUpload.unsupportedFiles', { count: fileArray.length - validFiles.length }));
      if (validFiles.length === 0) return; // Exit if no valid files
    }
    
    // Calculate existing files size (both already uploaded and pending upload)
    const existingFilesSize = [...filesToUpload].reduce((sum, file) => sum + file.size, 0);
    
    // Calculate new files size
    const newFilesSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    
    // Check if total size exceeds 100MB
    const totalSizeBytes = existingFilesSize + newFilesSize;
    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    
    // Also consider existing attachments in the size calculation
    const estimatedTotalSize = parseFloat(getTotalFileSize(filesToUpload, attachments, true) as string);
    const estimatedNewTotalSize = estimatedTotalSize + (newFilesSize / (1024 * 1024));
    
    if (estimatedNewTotalSize > 100) {
      alert(t('fileUpload.sizeExceeded'));
      return;
    }
    
    // Process files and add to state
    setFilesToUpload(prev => [...prev, ...validFiles]);
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };
  
  // Remove file from upload list
  const removeFileToUpload = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove existing attachment
  const removeAttachment = async (attachmentId: string) => {
    try {
      // Check if this is the cover image
      if (coverImageId === attachmentId) {
        // Find another image to use as cover
        const otherImageAttachment = attachments.find(att => 
          att.id !== attachmentId && att.fileType.startsWith('image/')
        );
        
        if (otherImageAttachment) {
          setCoverImageId(otherImageAttachment.id);
        } else {
          // If no other image attachments, check if there's an image in filesToUpload
          setCoverImageId(null);
        }
      }
      
      // Add to the list of attachments to delete
      setAttachmentsToDelete(prev => [...prev, attachmentId]);
      
      // Remove from UI immediately for better UX
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      
      // We don't delete the attachment immediately anymore
      // Instead, we'll delete it when the user clicks the Update Story button
    } catch (error) {
      //console.error('Error marking attachment for deletion:', error);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: StoryFormData) => {
    try {
      // Prepare story data
      const storyData: StoryUpdate = {
        id: storyId,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        coverImageId: coverImageId
      };
      
      // Upload new files to S3 if there are any
      let newAttachments: { fileName: string, fileType: string, fileUrl: string, fileKey: string, s3Url?: string, isCoverImage?: boolean }[] = [];
      
      if (filesToUpload.length > 0) {
        setIsUploading(true);
        
        // Convert File[] to the expected format for uploadFilesToS3
        const filesWithMetadata = filesToUpload.map(file => {
          const id = crypto.randomUUID();
          // Initialize progress for this file
          setUploadProgress(prev => ({
            ...prev,
            [id]: 0
          }));
          return {
            id,
            file,
            label: file.name
          };
        });
        
        // Upload files to S3 with progress tracking
        const uploadResults = await uploadFilesToS3(
          filesWithMetadata, 
          storyId,
          (fileId, progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress
            }));
          }
        );
        
        if (uploadResults && uploadResults.length > 0) {
          // Map uploaded files to attachments with labels
          newAttachments = uploadResults.map((uploadedFile, index) => {
            const originalFile = filesToUpload[index];
            return {
              fileName: originalFile.name,
              fileType: originalFile.type,
              fileUrl: uploadedFile.fileUrl,
              fileKey: uploadedFile.fileKey,
              s3Region: uploadedFile.s3Region,
              s3Bucket: uploadedFile.s3Bucket,
              label: uploadedFile.label || originalFile.name
            };
          });
          
          setIsUploading(false);
        } else {
          //console.error('Error uploading files');
          setIsUploading(false);
          throw new Error('Failed to upload files');
        }
      }
      
      // Update story with new attachments and attachments to delete
      const result = await updateStory({
        ...storyData,
        newAttachments,
        attachmentsToDelete: attachmentsToDelete.length > 0 ? attachmentsToDelete : undefined,
        hashReplicatingAttachment: filesToUpload.length > 0
      });
      
      if (result.success) {
        // Redirect to success page with updated query param
        router.push('/user/stories/success?action=updated');
      } else {
        //console.error('Error updating story:', result.error);
        setError(result.error || t('errors.updateFailed'));
      }
    } catch (error) {
      //console.error('Error submitting form:', error);
      setError(t('errors.unexpected'));
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    router.push('/user/stories');
  };
  
  // Handle delete button
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Call server action to delete the story
      const result = await deleteStory(storyId);
      
      if (result.success) {
        // Redirect to my stories page
        router.push('/user/stories');
      } else {
        //console.error('Error deleting story:', result.error);
        setError(result.error || t('errors.deleteFailed'));
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      //console.error('Error deleting story:', error);
      setError(t('errors.deleteUnexpected'));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="fade-in flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">{t('error.title')}</h2>
          <p className="mb-4">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fade-in text-foreground">
      {/* Breadcrumbs */}
      <div>
        <UserBreadcrumbs />
      </div>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t('header.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('header.subtitle')}
        </p>
      </header>
      
      {/* Delete Confirmation Modal - Using Modal Component */}
      <Modal isOpen={showDeleteConfirm} onClose={handleCancelDelete} className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600 dark:text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">{t('deleteModal.title')}</h3>
          <p className="text-muted-foreground">{t('deleteModal.message')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
          <button
            onClick={handleCancelDelete}
            className="px-5 py-2.5 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-all duration-200"
            disabled={isDeleting}
          >
            {t('deleteModal.cancel')}
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                <span>{t('deleteModal.deleting')}</span>
              </>
            ) : (
              t('deleteModal.confirm')
            )}
          </button>
        </div>
      </Modal>
      
      <div className="space-y-8">
        <StoryForm
          register={register}
          handleSubmit={handleSubmit}
          formState={{ errors }}
          errors={errors}
          getValues={getValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitButtonText={t('form.submitButton')}
          loadingButtonText={t('form.submitting')}
          files={filesToUpload}
          handleFiles={handleFiles}
          removeFile={(id) => {
            const index = parseInt(id);
            if (!isNaN(index)) {
              removeFileToUpload(index);
            }
          }}
          handleFileChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
            }
          }}
          coverImageId={coverImageId}
          setCoverImageId={setCoverImageId}
          wordCount={wordCount}
          isEdit={true}
          attachments={attachments.map(att => ({ ...att, fileUrl: att.fileUrl || '' }))}
          removeAttachment={removeAttachment}
          onCancel={handleCancel}
          onDelete={handleDeleteClick}
          uploadProgress={uploadProgress}
          hashReplicatingAttachment={hashReplicatingAttachment}
        />
        
        {/* Danger Zone */}
        <div className="mt-12">
          <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border-2 border-red-300 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-800 dark:text-red-400">{t('dangerZone.title')}</h3>
            </div>
            
            <div className="space-y-4 mb-5">
              <p className="text-red-700 dark:text-red-300">
                <span className="font-semibold">{t('dangerZone.warning')}:</span> {t('dangerZone.permanentWarning')}
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-2 pl-1">
                <li>{t('dangerZone.consequences.servers')}</li>
                <li>{t('dangerZone.consequences.media')}</li>
                <li>{t('dangerZone.consequences.backups')}</li>
                <li>{t('dangerZone.consequences.support')}</li>
              </ul>
            </div>
            
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              {t('dangerZone.deleteButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
