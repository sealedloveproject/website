/**
 * Media URL utilities
 * This file contains functions that can be used in both client and server components
 */

const domain = process.env.MEDIA_DOMAIN;

/**
 * Generates a public media URL based on the environment
 * 
 * @param storyId The ID of the story
 * @param fileId The ID of the file (UUID)
 * @returns The public media URL
 */
export function getPublicMediaUrl(storyId: string, fileId: string): string {
  return `${domain}/${storyId}/${fileId}`;
}

/**
 * Extracts the file ID from an S3 file key
 * 
 * @param fileKey The S3 file key (e.g., 'stories/development/storyId/fileId.png')
 * @returns The file ID (UUID without extension)
 */
export function extractFileIdFromKey(fileKey: string): string | undefined {
  return fileKey.split('/').pop()?.split('.')[0];
}

/**
 * Converts an S3 URL to a public media URL
 * 
 * @param s3Url The S3 URL
 * @param storyId The ID of the story
 * @returns The public media URL or the original URL if conversion fails
 */
export function convertS3UrlToPublicUrl(s3Url: string | undefined | null, storyId: string): string | undefined | null {
  if (!s3Url) return s3Url;
  
  try {
    // Extract the file key from the S3 URL
    const urlParts = s3Url.split('/');
    const fileName = urlParts.pop() || '';
    const fileIdParts = fileName.split('.');
    const fileId = fileIdParts[0];
    const fileExtension = fileIdParts.length > 1 ? `.${fileIdParts.slice(1).join('.')}` : '';
    
    if (fileId) {
      return `${domain}/${storyId}/${fileId}${fileExtension}`;
    }
  } catch (error) {
    //console.error('Error converting S3 URL to public URL:', error);
  }
  
  return s3Url;
}
