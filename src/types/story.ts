// Database Story model
export type DbStory = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  isPublic: boolean;
};

// Story type as returned to the frontend
export type Story = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string | null | undefined;
  likes: number;
  featured: boolean;
  isPublic: boolean;
  content?: string; // Optional for list views
  createdAt?: string; // ISO string date format
  updatedAt?: string; // ISO string date format
  hashReplicatingAttachment?: boolean; // Flag indicating if story has attachments that are still replicating
};

// Story attachment type
export type Attachment = {
  id: string;
  storyId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  createdAt: Date;
};

// Story with attachments
export type StoryWithAttachments = Story & {
  attachments: Attachment[];
};
