'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { saveStory, saveAttachments, type StorySubmission } from '@/app/actions/stories/story';
import { uploadFilesToS3 } from '@/lib/uploadToS3';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storyFormSchema, validateFileSize, type StoryFormData, type FileWithMetadata } from '@/schemas/story';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StoryForm from '@/components/stories/StoryForm';

export default function StoreYourStory() {
  const { user, isAuthenticated, openSignInModal } = useAuth();
  const router = useRouter();
  const [wordCount, setWordCount] = useState(0);
  
  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(storyFormSchema) as any,
    defaultValues: {
      title: '',
      content: '',
      agreeToTerms: false,
      isPublic: false
    }
  });
  
  // Watch the content field for word count
  const storyContent = watch('content');
  
  // File management state
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Update word count when story content changes
  useEffect(() => {
    if (storyContent) {
      const words = storyContent.trim() ? storyContent.trim().split(/\s+/).length : 0;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [storyContent]);
  
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
      alert(`${fileArray.length - validFiles.length} file(s) were not added because they are not supported. Please only upload jpg, jpeg, png, webp, mp4, mov, mp3, or aac files.`);
      if (validFiles.length === 0) return; // Exit if no valid files
    }
    
    // Calculate existing files size
    const existingFilesSize = files.reduce((sum, fileData) => sum + fileData.file.size, 0);
    
    // Calculate new files size
    const newFilesSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    
    // Check if total size exceeds 100MB
    const totalSizeBytes = existingFilesSize + newFilesSize;
    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    
    if (totalSizeMB > 100) {
      alert('Adding these files would exceed your 100MB storage limit. Please remove some files first.');
      return;
    }
    
    // Process files and add to state
    const filesWithMetadata = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      label: ''
    }));
    
    // Add the new files to state
    setFiles(prev => {
      const updatedFiles = [...prev, ...filesWithMetadata];
      
      // If no cover image is selected yet, automatically select the first image file
      if (coverImageId === null) {
        // Find the first image file among the new files
        const firstImageFile = filesWithMetadata.find(fileData => {
          const fileType = fileData.file.type;
          return fileType.startsWith('image/');
        });
        
        // If an image file is found, set it as the cover image
        if (firstImageFile) {
          setCoverImageId(firstImageFile.id);
        }
      }
      
      return updatedFiles;
    });
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    
    // If the removed file was the cover image, reset the cover image
    if (coverImageId === id) {
      setCoverImageId(null);
    }
  };
  
  // Check for existing privacy preference on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const privacyAgreed = localStorage.getItem('storyPrivacyAgreed');
        if (privacyAgreed === 'true') {
          setValue('agreeToTerms', true);
        }
      } catch (e) {
        //console.error('Failed to get privacy preference from localStorage', e);
      }
    }
  }, [setValue]);
  
  
  // Handle form submission with React Hook Form
  const onSubmit = async (data: StoryFormData) => {
    try {
      if (!user?.email) return;
      
      // Create story submission
      const storySubmission: StorySubmission = {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        userEmail: user.email,
        userName: user.name || 'Anonymous',
        location: '',
        hashReplicatingAttachment: files.length > 0
      };
      
      // Save story first to get the story ID
      const storyResult = await saveStory(storySubmission);
      
      if (!storyResult.success || !storyResult.storyId) {
        //console.error('Error saving story:', storyResult.error);
        return;
      }

      // If there are files to upload, handle them
      if (files.length > 0) {
        // Initialize progress for each file
        const initialProgress: Record<string, number> = {};
        files.forEach(file => {
          initialProgress[file.id] = 0;
        });
        setUploadProgress(initialProgress);
        
        // Upload files to S3 with progress tracking
        const uploadResults = await uploadFilesToS3(
          files, 
          storyResult.storyId,
          (fileId, progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress
            }));
          }
        );
        
        // Save attachments to database
        if (uploadResults && uploadResults.length > 0) {
          // Mark cover image in the upload results if one is selected
          const uploadResultsWithCover = uploadResults.map(result => ({
            ...result,
            isCoverImage: result.id === coverImageId // Compare file ID directly with coverImageId
          }));
          
          const attachmentResult = await saveAttachments(storyResult.storyId, uploadResultsWithCover, user.email);
          
          // Update story with cover image ID if available
          if (attachmentResult.coverImageId) {
            // We could update the story here with the cover image ID if needed
            //console.log(`Cover image set: ${attachmentResult.coverImageId}`);
          }
          
          // Redirect to success page
          router.push('/user/stories/success');
        } else {
          //console.error('Error saving story');
        }
      } else {
        // No files to upload, just redirect
        router.push('/user/stories/success');
      }
    } catch (error) {
      //console.error('Error submitting form:', error);
    }
  };

  
  return (
    <div className="fade-in pt-16 pb-20 px-6 max-w-5xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      

      <header className="mb-8">
        <div className="flex justify-start mb-4">
          <Link href="/user/stories" className="inline-flex items-center gap-2 bg-background hover:bg-muted px-4 py-2 rounded-lg text-foreground font-medium border border-border transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to My Stories
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Store Your Love Story</h1>
        <p className="text-muted-foreground mt-2">
          Preserve your memories in our millennium vault
        </p>
      </header>

      {!isAuthenticated && (
        <div className="bg-card p-8 rounded-2xl mb-10 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Email Login with One-Time Code
          </h2>
          <p className="mb-3 text-foreground/80">Enter your email address to receive a 6-digit code that lets you access and manage your stories. No registration required.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground/80">
              <span className="font-medium">Why we use email login:</span> This simple method allows you to edit, update or delete your story later. Your email is only used for authentication and we never share it with third parties.
            </p>
          </div>
          
          <button 
            onClick={openSignInModal}
            className="w-full bg-gradient-to-r from-primary to-secondary py-3.5 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            Continue with Email
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}

      {isAuthenticated && (
        <StoryForm
          register={register}
          handleSubmit={handleSubmit}
          formState={{ errors }}
          errors={errors}
          getValues={getValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Save Story"
          loadingButtonText="Submitting..."
          files={files}
          handleFiles={handleFiles}
          removeFile={removeFile}
          handleFileChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
            }
          }}
          coverImageId={coverImageId}
          setCoverImageId={setCoverImageId}
          wordCount={wordCount}
          onCancel={() => router.push('/user/stories')}
          uploadProgress={uploadProgress}
        />
      )}
    </div>
  );
}
