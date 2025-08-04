import { Story } from './story';

// Response type for story-related server actions
export type StoryActionResponse = {
  success: boolean;
  message?: string;
  data?: Story | Story[] | null;
  error?: string;
};

// Response type for authentication-related server actions
export type AuthActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

// Generic server action response
export type ServerActionResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};
