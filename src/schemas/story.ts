import { z } from 'zod';

// Zod schema for story form validation
export const storyFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string()
    .min(1, { message: "Story content is required" })
    .refine(
      (text) => {
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        return wordCount <= 1000;
      },
      { message: "Story must be 1000 words or less" }
    ),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  isPublic: z.boolean().optional().default(false),
  storeInVault: z.boolean().optional().default(false),
  setupUnlockDate: z.boolean().optional().default(false),
  unlockDate: z.string().optional().nullable(),
  unlockPasswordHash: z.string().optional().nullable()
});

export type StoryFormData = z.infer<typeof storyFormSchema>;

// Zod schema for file validation
export const fileSchema = z.object({
  totalSize: z.number().max(100 * 1024 * 1024, { message: "Total file size exceeds the 100MB limit" })
});

// Interface for file with metadata
export interface FileWithMetadata {
  file: File;
  label: string;
  id: string;
}

// Helper functions for validation
export const validateStoryField = (field: keyof StoryFormData, value: string): string => {
  try {
    // Validate just the specific field
    storyFormSchema.shape[field].parse(value);
    
    // Special case for content word count
    if (field === 'content') {
      const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
      if (wordCount > 1000) {
        return 'Story must be 1000 words or less';
      }
    }
    return '';
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = error.format();
      return formattedError._errors?.[0] || `Invalid ${field}`;
    }
    return `Invalid ${field}`;
  }
};

export const validateFileSize = (currentSize: number, newSize: number): { valid: boolean; message: string } => {
  const totalSize = currentSize + newSize;
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  try {
    fileSchema.parse({ totalSize });
    return { valid: true, message: '' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const existingSizeMB = (currentSize / (1024 * 1024)).toFixed(2);
      const newSizeMB = (newSize / (1024 * 1024)).toFixed(2);
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      return {
        valid: false,
        message: `Cannot add these files. Total size would exceed the 100MB limit.\n\nCurrent files: ${existingSizeMB} MB\nNew files: ${newSizeMB} MB\nTotal would be: ${totalSizeMB} MB`
      };
    }
    return { valid: false, message: 'File size validation failed' };
  }
};
