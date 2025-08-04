import { S3Client } from '@aws-sdk/client-s3';
import { getClosestS3Region } from './s3Region';
import { headers } from 'next/headers';

/**
 * Creates an S3 client for the closest region to the user
 * 
 * @param headers Request headers that may contain CF_IPCOUNTRY
 * @returns An S3 client configured for the appropriate region
 */
export function createS3Client(headers?: Headers): S3Client {
  const region = getClosestS3Region(headers);
  
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}
