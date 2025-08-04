import { StoryFormData, FileWithMetadata } from '@/schemas/story';
import { UseFormReturn } from 'react-hook-form';

/**
 * Props for the shared StoryForm component
 */
export interface StoryFormProps {
  // Form handling
  register: any;
  handleSubmit: any;
  formState: any;
  errors: any;
  getValues: any;
  onSubmit: (data: StoryFormData) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  loadingButtonText: string;
  
  // File handling
  files: FileWithMetadata[] | File[];
  handleFiles: (fileArray: File[]) => void;
  removeFile: (id: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Cover image
  coverImageId: string | null;
  setCoverImageId: (id: string | null) => void;
  
  // UI state
  wordCount: number;
  isEdit?: boolean;
  uploadProgress?: Record<string, number>; // Map of file IDs to upload progress (0-100)
  
  // For edit mode only
  attachments?: Array<{id: string, fileName: string, fileType: string, fileUrl: string, size?: number}>;
  removeAttachment?: (id: string) => void;
  
  // Optional callbacks
  onCancel?: () => void;
  onDelete?: () => void;

  // Hash replicating attachment
  hashReplicatingAttachment?: boolean;
}

/**
 * Props for the file list component
 */
export interface FileListProps {
  files: FileWithMetadata[] | File[];
  coverImageId: string | null;
  setCoverImageId: (id: string | null) => void;
  removeFile: (id: string) => void;
  isNewFile?: boolean;
  uploadProgress?: Record<string, number>; // Map of file IDs to upload progress (0-100)
}

/**
 * Props for the existing attachments component
 */
export interface AttachmentsListProps {
  attachments: Array<{id: string, fileName: string, fileType: string, fileUrl: string, size?: number}>;
  coverImageId: string | null;
  setCoverImageId: (id: string | null) => void;
  removeAttachment: (id: string) => void;
}

/**
 * Props for the file upload area component
 */
export interface FileUploadAreaProps {
  handleFiles: (fileArray: File[]) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getTotalFileSize: (files: any[], returnRawSize?: boolean) => string | number;
  files: any[];
  attachments?: Array<{id: string, fileName: string, fileType: string, fileUrl: string, size?: number}>;

  // Hash replicating attachment
  hashReplicatingAttachment?: boolean;
}
