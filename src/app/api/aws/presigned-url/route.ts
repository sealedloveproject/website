import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '@/lib/s3Client';
import { getClosestS3Region } from '@/lib/s3Region';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { v4 as uuidv4 } from 'uuid';

// Base bucket name prefix
const BUCKET_NAME_PREFIX = 'sealed-love-';

// Get the current environment
const NODE_ENV = process.env.NODE_ENV || 'development';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { fileName, fileType, storyId } = body;

    if (!fileName || !fileType || !storyId) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, storyId' },
        { status: 400 }
      );
    }

    // Generate a unique file key with the correct path structure
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `stories/${NODE_ENV}/${storyId}/${uuidv4()}.${fileExtension}`;

    // Get the closest region directly
    const regionCode = getClosestS3Region(request.headers);
    
    // Map region code to region name for bucket naming
    const regionNameMap: Record<string, string> = {
      'us-east-1': 'virginia',
      'us-east-2': 'ohio',
      'us-west-1': 'california',
      'us-west-2': 'oregon',
      'ap-south-1': 'mumbai',
      'ap-northeast-1': 'tokyo',
      'ap-northeast-2': 'seoul',
      'ap-northeast-3': 'osaka',
      'ap-southeast-1': 'singapore',
      'ap-southeast-2': 'sydney',
      'ca-central-1': 'canada',
      'eu-central-1': 'frankfurt',
      'eu-west-1': 'ireland',
      'eu-west-2': 'london',
      'eu-west-3': 'paris',
      'eu-north-1': 'stockholm',
      'sa-east-1': 'saopaulo'
    };
    
    // Get the region name for the bucket
    const regionName = regionNameMap[regionCode] || 'virginia'; // Default to virginia if not found
    
    // Construct the bucket name using the region name
    const BUCKET_NAME = `${BUCKET_NAME_PREFIX}${regionName}`;
    
    // Create S3 client with the closest region
    const s3Client = createS3Client(request.headers);

    // Create the command to put an object in S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    // Generate a presigned URL that expires in 15 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900, // 15 minutes
    });

    // Return the presigned URL, bucket name, and file details
    return NextResponse.json({
      success: true,
      presignedUrl,
      fileKey: uniqueFileName,
      fileName,
      fileType,
      bucketName: BUCKET_NAME,
    });
  } catch (error) {
    //console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
