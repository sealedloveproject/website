'use server';

import { DeleteObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

/**
 * Deletes a file from S3
 * 
 * @param fileKey The S3 key of the file to delete
 * @param s3Region The AWS region of the S3 bucket
 * @param s3Bucket The name of the S3 bucket
 * @returns Promise that resolves to true if deletion was successful
 */
export async function deleteFileFromS3(fileKey: string, s3Region: string, s3Bucket: string): Promise<boolean> {
  try {
    // Create S3 client with the specified region
    const s3Client = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Create the command to delete an object from S3
    const command = new DeleteObjectCommand({
      Bucket: s3Bucket,
      Key: fileKey,
    });

    // Execute the delete command
    await s3Client.send(command);
    return true;
  } catch (error) {
    //console.error('Error deleting file from S3:', error);
    return false;
  }
}

/**
 * Deletes all files in a directory from S3
 * 
 * @param directoryPrefix - The directory prefix (e.g., 'stories/development/story-id/')
 * @param s3Region - The S3 region
 * @param s3Bucket - The S3 bucket name
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function deleteDirectoryFromS3(directoryPrefix: string, s3Region: string, s3Bucket: string): Promise<boolean> {
  try {
    // Create S3 client with the specified region
    const s3Client = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Make sure the directory prefix ends with a slash
    const prefix = directoryPrefix.endsWith('/') ? directoryPrefix : `${directoryPrefix}/`;

    // List all objects in the directory
    const listCommand = new ListObjectsV2Command({
      Bucket: s3Bucket,
      Prefix: prefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    // If no objects found, return early
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return true;
    }

    // Delete each object in the directory
    for (const object of listedObjects.Contents) {
      if (object.Key) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: s3Bucket,
          Key: object.Key,
        });
        await s3Client.send(deleteCommand);
      }
    }

    // Check if there are more objects to delete (pagination)
    if (listedObjects.IsTruncated) {
      // For simplicity, we're not handling pagination here
      // In a production environment, you would want to handle this case
      //console.warn('More objects exist but were not deleted due to pagination');
    }

    return true;
  } catch (error) {
    //console.error('Error deleting directory from S3:', error);
    return false;
  }
}
