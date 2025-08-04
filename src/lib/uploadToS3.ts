'use client';

/**
 * Uploads a file to S3 using a presigned URL
 * 
 * @param file The file to upload
 * @param presignedUrl The presigned URL to upload to
 * @param onProgress Optional callback for tracking upload progress (0-100)
 * @returns Promise that resolves when the upload is complete
 */
export async function uploadFileWithPresignedUrl(
  file: File, 
  presignedUrl: string, 
  onProgress?: (progress: number) => void
): Promise<boolean> {
  try {
    // Use XMLHttpRequest instead of fetch to track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          //console.error('Failed to upload file:', xhr.statusText);
          resolve(false);
        }
      };
      
      xhr.onerror = () => {
        //console.error('Error uploading file');
        resolve(false);
      };
      
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  } catch (error) {
    //console.error('Error uploading file:', error);
    return false;
  }
}

/**
 * Requests a presigned URL from the server for a file
 * 
 * @param fileName The name of the file
 * @param fileType The MIME type of the file
 * @param storyId The ID of the story the file belongs to
 * @returns The presigned URL response data
 */
export async function getPresignedUrl(fileName: string, fileType: string, storyId: string) {
  try {
    const response = await fetch('/api/aws/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType,
        storyId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }

    return await response.json();
  } catch (error) {
    //console.error('Error getting presigned URL:', error);
    throw error;
  }
}

/**
 * Uploads multiple files to S3 using presigned URLs
 * 
 * @param files Array of files with metadata to upload
 * @param storyId The ID of the story the files belong to
 * @returns Array of file metadata including S3 keys and public URLs
 */
export async function uploadFilesToS3(
  files: Array<{ id: string; file: File; label?: string }>,
  storyId: string,
  onFileProgress?: (fileId: string, progress: number) => void
): Promise<Array<{ 
  id: string; 
  fileName: string; 
  fileType: string; 
  fileUrl: string; 
  publicUrl: string;
  fileKey: string;
  s3Region?: string;
  s3Bucket?: string;
  label?: string; 
}>> {
  const uploadResults = [];
  // Determine environment for public URL
  const isProduction = process.env.NODE_ENV === 'production';
  const publicDomain = isProduction ? 'https://media.sealed.love' : 'https://devmedia.sealed.love';

  for (const fileData of files) {
    try {
      // Get presigned URL for this file
      const presignedData = await getPresignedUrl(
        fileData.file.name,
        fileData.file.type,
        storyId
      );

      // Upload the file using the presigned URL with progress tracking
      const uploadSuccess = await uploadFileWithPresignedUrl(
        fileData.file,
        presignedData.presignedUrl,
        onFileProgress ? (progress) => onFileProgress(fileData.id, progress) : undefined
      );

      if (uploadSuccess) {
        // Extract file key and file ID from the presigned URL
        const fileKey = presignedData.fileKey;
        const fileId = fileKey.split('/').pop()?.split('.')[0]; // Extract UUID from filename
        
        // Construct the permanent S3 URL
        const baseUrl = presignedData.presignedUrl.split('?')[0].split('/').slice(0, 3).join('/');
        const fileUrl = `${baseUrl}/${fileKey}`;
        
        // Construct the public URL based on environment
        const publicUrl = `${publicDomain}/${storyId}/${fileId}`;

        // Get bucket name and region from presigned URL response
        const bucketName = presignedData.bucketName || '';
        // The region is included directly in the presignedUrl
        let s3Region = 'eu-central-1'; // Default region
        
        // Extract region from the presigned URL if possible
        const regionMatch = presignedData.presignedUrl.match(/s3\.([a-z0-9-]+)\.amazonaws\.com/);
        if (regionMatch && regionMatch[1]) {
          s3Region = regionMatch[1];
        }
        
        uploadResults.push({
          id: fileData.id,
          fileName: fileData.file.name,
          fileType: fileData.file.type,
          fileUrl, // Original S3 URL
          publicUrl, // New public URL based on environment
          fileKey,
          s3Region,
          s3Bucket: bucketName,
          label: fileData.label || '',
        });
      }
    } catch (error) {
      //console.error(`Error uploading file ${fileData.file.name}:`, error);
    }
  }

  return uploadResults;
}
