import { UseFormRegister, FieldErrors, UseFormHandleSubmit, FormState } from 'react-hook-form';

// Type for the story form data
export interface StoryFormData {
  title: string;
  content: string;
  isPublic: boolean;
  agreeToTerms: boolean;
  unlockDate?: string;
  secretPassword?: string;
}

// Type for attachment objects
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string | null | undefined;
  isCoverImage?: boolean;
}

// Props for the StoryForm component
export interface StoryFormProps {
  register: UseFormRegister<StoryFormData>;
  handleSubmit: UseFormHandleSubmit<StoryFormData>;
  formState: FormState<StoryFormData>;
  errors: FieldErrors<StoryFormData>;
  getValues: (fieldName?: keyof StoryFormData) => any;
  onSubmit: (data: StoryFormData) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  loadingButtonText: string;
  files: File[];
  handleFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  coverImageId: string | null;
  setCoverImageId: (id: string) => void;
  wordCount: number;
  isEdit?: boolean;
  attachments?: Attachment[];
  removeAttachment?: (id: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

// Props for the FileList component
export interface FileListProps {
  files: File[];
  coverImageId: string | null;
  setCoverImageId: (id: string) => void;
  removeFile: (index: number) => void;
}

// Props for the AttachmentsList component
export interface AttachmentsListProps {
  attachments: Attachment[];
  coverImageId: string | null;
  setCoverImageId: (id: string) => void;
  removeAttachment: (id: string) => void;
}

// Props for the FileUploadArea component
export interface FileUploadAreaProps {
  handleFiles: (files: File[]) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getTotalFileSize: (files: any[], returnRawSize?: boolean) => string | number;
  files: File[];
  attachments: Attachment[];
}
