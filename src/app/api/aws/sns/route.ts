import { NextRequest, NextResponse } from 'next/server';
import { getEmailTemplate } from '@/lib/emails';
import { sendEmail } from '@/lib/emails/sendEmail';
import crypto from 'crypto';
import https from 'https';
import { PrismaClient } from '@prisma/client';
import { cache } from '@/lib/cache';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Types for SNS messages
interface SNSMessage {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  Subject?: string; // Optional subject field that may be present in notifications
}

interface SNSSubscriptionMessage extends SNSMessage {
  Token: string;
  SubscribeURL: string;
}

interface SNSNotificationMessage extends SNSMessage {
  Subject?: string;
  UnsubscribeURL?: string;
}

/**
 * Handler for AWS SNS HTTP notifications
 * 
 * Handles three types of messages:
 * 1. SubscriptionConfirmation - When a subscription is created
 * 2. Notification - Actual notification messages
 * 3. UnsubscribeConfirmation - When a subscription is deleted
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming message
    const body = await request.json();
    //console.log('Received SNS message:', JSON.stringify(body, null, 2));

    // Validate that this is an SNS message
    if (!body.Type || !body.MessageId || !body.TopicArn) {
      //console.error('Invalid SNS message format');
      return NextResponse.json({ error: 'Invalid SNS message format' }, { status: 400 });
    }
    
    // Validate that the TopicArn is in our allowed list
    if (!isAllowedTopicArn(body.TopicArn)) {
      //console.error(`Unauthorized SNS topic: ${body.TopicArn}`);
      return NextResponse.json({ error: 'Unauthorized SNS topic' }, { status: 403 });
    }
    
    //console.log(`Processing message from SNS topic: ${body.TopicArn}`);

    // Verify the message signature to ensure it's from AWS SNS
    const isValid = await verifySnsSignature(body);
    if (!isValid) {
      //console.error('SNS signature verification failed');
      return NextResponse.json({ error: 'Message signature verification failed' }, { status: 403 });
    }

    // Handle different message types
    switch (body.Type) {
      case 'SubscriptionConfirmation':
        return handleSubscriptionConfirmation(body as SNSSubscriptionMessage);
      
      case 'Notification':
        return handleNotification(body as SNSNotificationMessage);
      
      case 'UnsubscribeConfirmation':
        return handleUnsubscribeConfirmation(body as SNSSubscriptionMessage);
      
      default:
        //console.warn(`Unknown SNS message type: ${body.Type}`);
        return NextResponse.json({ message: 'Unknown message type' }, { status: 400 });
    }
  } catch (error) {
    //console.error('Error processing SNS message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles SNS subscription confirmation
 * Automatically confirms the subscription by making a GET request to the SubscribeURL
 */
async function handleSubscriptionConfirmation(message: SNSSubscriptionMessage) {
  //console.log('Handling subscription confirmation');
  try {
    // Confirm the subscription by visiting the SubscribeURL
    const response = await fetch(message.SubscribeURL);
    
    if (response.ok) {
      //console.log('Successfully confirmed SNS subscription');
      return NextResponse.json({ message: 'Subscription confirmed' }, { status: 200 });
    } else {
      //console.error('Failed to confirm subscription:', await response.text());
      return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 });
    }
  } catch (error) {
    //console.error('Error confirming subscription:', error);
    return NextResponse.json({ error: 'Error confirming subscription' }, { status: 500 });
  }
}

// Initialize Prisma client
const prisma = new PrismaClient();

// Certificate cache to avoid fetching the same certificate repeatedly
const certificateCache = new Map<string, { cert: string, timestamp: number }>();

/**
 * Handles SNS notifications
 * Process the actual notification message
 */
async function handleNotification(message: SNSNotificationMessage) {
  //console.log('Handling SNS notification');
  
  try {
    // Parse the message content if it's JSON
    let messageContent;
    try {
      messageContent = JSON.parse(message.Message);
    } catch (e) {
      messageContent = message.Message;
    }
    
    // Check if this is an S3 event notification
    if (message.Subject === 'Amazon S3 Notification' && messageContent.Records) {
      return await handleS3Notification(messageContent);
    }
    
    //console.log('Processed notification:', messageContent);
    
    return NextResponse.json({ message: 'Notification processed' }, { status: 200 });
  } catch (error) {
    //console.error('Error processing notification:', error);
    return NextResponse.json({ error: 'Error processing notification' }, { status: 500 });
  }
}

/**
 * Handles S3 event notifications
 * Updates attachment records with file size and replication status
 */
async function handleS3Notification(messageContent: any) {
  try {
    // Process each record in the S3 event
    for (const record of messageContent.Records) {
      // Ensure this is an ObjectCreated event
      if (record.eventName && record.eventName.startsWith('ObjectCreated:')) {
        const s3 = record.s3;
        
        if (s3 && s3.object && s3.object.key) {
          const s3Key = s3.object.key;
          const fileSize = s3.object.size || 0;
          
          // Extract the ETag (MD5 hash) if available
          // Note: For multipart uploads, this won't be a simple MD5 hash
          const eTag = s3.object.eTag ? s3.object.eTag.replace(/\"/g, '') : null;
          
          //console.log(`Processing S3 event for key: ${s3Key} with size: ${fileSize}`);
          
          // Extract the filename from the S3 key (last part after the last slash)
          const filename = s3Key.split('/').pop() || '';
          
          if (!filename) {
            //console.error('Could not extract filename from S3 key:', s3Key);
            continue;
          }
          
          //console.log(`Extracted filename: ${filename}`);
          
          // Look up the attachment ID in Redis
          const attachmentId = await cache.get(`replicate:${filename}`);
          
          if (!attachmentId) {
            //console.error(`No Redis entry found for filename: ${filename}`);
            continue;
          }
          
          //console.log(`Found attachment ID in Redis: ${attachmentId}`);
          
          // Update the attachment with file size, hash, and replicated status
          const updatedAttachment = await prisma.attachment.update({
            where: { id: attachmentId as string },
            data: {
              size: Number(fileSize),
              hash: eTag,
              replicated: true
            }
          });
          
          //console.log(`Updated attachment ${updatedAttachment.id} with size ${fileSize} and marked as replicated`);
          
          // Check if all attachments for this story are now replicated
          const storyId = updatedAttachment.storyId;
          
          // Get all attachments for this story
          const attachments = await prisma.attachment.findMany({
            where: { storyId: storyId }
          });
          
          // Check if all attachments are replicated
          const allReplicated = attachments.every(attachment => attachment.replicated);
          
          // If all attachments are replicated, update the story's hashReplicatingAttachment to false
          if (allReplicated) {
            // Check if this is a new story by looking for the Redis key
            const isNewStory = await cache.get(`new_story:${storyId}`);
            
            // Update the story's hashReplicatingAttachment to false
            await prisma.story.update({
              where: { id: storyId },
              data: { hashReplicatingAttachment: false }
            });
            
            if (isNewStory) {
              await cache.del(`new_story:${storyId}`);
              
              // Get the story details including the user information
              const story = await prisma.story.findUnique({
                where: { id: storyId },
                include: { user: true }
              });
              
              if (story && story.user) {
                // Get all attachments for this story with their details
                const storyAttachments = await prisma.attachment.findMany({
                  where: { storyId: storyId }
                });
                
                // Format the current date and time
                const currentDate = new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                });
                
                // Create a temporary JSON file with attachment details
                
                const attachmentData = {
                  storyId: storyId,
                  storyTitle: story.title,
                  createdAt: currentDate,
                  attachments: storyAttachments.map(att => ({
                    id: att.id,
                    fileName: att.fileName,
                    fileType: att.fileType,
                    size: att.size,
                    hash: att.hash
                  }))
                };
                
                const tempFilePath = path.join(os.tmpdir(), `${storyId}.json`);
                fs.writeFileSync(tempFilePath, JSON.stringify(attachmentData, null, 2));
                
                // Convert the file to base64 for email attachment
                const fileContent = fs.readFileSync(tempFilePath);
                const base64Content = Buffer.from(fileContent).toString('base64');
                
                // Get the story stored email template
                const storyStoredTemplate = getEmailTemplate('storyStored');
                
                // Send the email to the story owner with the attachment
                try {
                  await sendEmail({
                    to: story.user.email,
                    subject: storyStoredTemplate.subject({
                      name: story.user.name,
                      email: story.user.email,
                      storyTitle: story.title,
                      storyId: story.id,
                      isPublic: story.isPublic,
                      currentDate
                    }),
                    text: storyStoredTemplate.text({
                      name: story.user.name,
                      email: story.user.email,
                      storyTitle: story.title,
                      storyId: story.id,
                      isPublic: story.isPublic,
                      currentDate
                    }),
                    html: storyStoredTemplate.html({
                      name: story.user.name,
                      email: story.user.email,
                      storyTitle: story.title,
                      storyId: story.id,
                      isPublic: story.isPublic,
                      currentDate
                    }),
                    attachments: [
                      {
                        content: base64Content,
                        filename: `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}_files.json`,
                        type: 'application/json',
                        disposition: 'attachment'
                      }
                    ]
                  });
                } catch (emailError) {
                  // Continue execution even if email fails - don't throw the error
                }
                
                // Clean up the temporary file
                try {
                  fs.unlinkSync(tempFilePath);
                } catch (error) {
                    // console.error('Error removing temporary file:', error);
                }
              }
            } else {
              // update
            }
          }
          
          // Clean up the Redis key as it's no longer needed
          await cache.del(`replicate:${filename}`);
          //console.log(`Removed Redis key for filename: ${filename}`);
        }
      }
    }
    
    return NextResponse.json({ message: 'S3 notification processed successfully' }, { status: 200 });
  } catch (error) {
    //console.error('Error processing S3 notification:', error);
    return NextResponse.json({ error: 'Error processing S3 notification' }, { status: 500 });
  }
}

/**
 * Handles SNS unsubscribe confirmation
 */
async function handleUnsubscribeConfirmation(message: SNSSubscriptionMessage) {
  //console.log('Handling unsubscribe confirmation');
  //console.log('Unsubscribe URL:', message.SubscribeURL);
  
  // You can choose to automatically confirm the unsubscribe or not
  // For logging purposes, we'll just acknowledge it
  
  return NextResponse.json({ message: 'Unsubscribe acknowledged' }, { status: 200 });
}

// GET method to verify the endpoint is working
export async function GET() {
  return NextResponse.json({ status: 'SNS endpoint is active' }, { status: 200 });
}

/**
 * Validates if the SNS topic ARN is in our allowed list from environment variables
 * 
 * @param topicArn - The SNS topic ARN to validate
 * @returns boolean - True if the topic is allowed, false otherwise
 */
function isAllowedTopicArn(topicArn: string): boolean {
  // Skip validation in development if configured
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_SNS_ARN_VALIDATION === 'true') {
    //console.warn('Skipping SNS topic ARN validation in development mode');
    return true;
  }
  
  // Get the allowed ARNs from environment variables
  const allowedArns = process.env.ALLOWED_SNS_TOPIC_ARNS?.split(',').map(arn => arn.trim()) || [];
  
  // If no ARNs are configured, log a warning and reject all
  if (allowedArns.length === 0) {
    //console.warn('No allowed SNS topic ARNs configured. Configure ALLOWED_SNS_TOPIC_ARNS in .env');
    return false;
  }
  
  // Check if the topic ARN is in our allowed list
  const isAllowed = allowedArns.includes(topicArn);
  if (!isAllowed) {
    //console.warn(`SNS topic ARN not in allowed list: ${topicArn}`);
    //console.warn(`Allowed ARNs: ${allowedArns.join(', ')}`);
  }
  return isAllowed;
}

/**
 * Verifies the authenticity of an SNS message by validating its signature
 * 
 * @param message - The SNS message to verify
 * @returns Promise<boolean> - True if the signature is valid, false otherwise
 */
async function verifySnsSignature(message: SNSMessage): Promise<boolean> {
  try {
    //console.log(`Verifying SNS signature for message ID: ${message.MessageId}`);
    
    // Skip signature verification in development environment if needed
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_SNS_VERIFICATION === 'true') {
      //console.warn('Skipping SNS signature verification in development mode');
      return true;
    }

    // 1. Get the signing certificate from AWS
    //console.log(`Fetching signing certificate from: ${message.SigningCertURL}`);
    const cert = await fetchSigningCertificate(message.SigningCertURL);
    if (!cert || cert.trim() === '') {
      //console.error('Empty certificate received from AWS');
      return false;
    }
    
    // 2. Create the canonical string to verify
    const canonicalString = createCanonicalString(message);
    //console.log('Canonical string created for verification:', canonicalString);
    
    // 3. Verify the signature
    const verifier = crypto.createVerify('RSA-SHA1');
    verifier.update(canonicalString, 'utf8');
    
    // The signature from SNS is base64 encoded
    const signatureBuffer = Buffer.from(message.Signature, 'base64');
    
    const isValid = verifier.verify(cert, signatureBuffer);
    //console.log(`Signature verification result: ${isValid ? 'Valid' : 'Invalid'}`);
    
    if (!isValid) {
      //console.error('Signature verification failed. This could be due to:');
      //console.error('1. Message tampering');
      //console.error('2. Incorrect canonical string format');
      //console.error('3. Certificate issues');
      //console.error('4. Signature algorithm mismatch');
    }
    
    return isValid;
  } catch (error) {
    //console.error('Error verifying SNS signature:', error);
    return false;
  }
}

/**
 * Fetches the signing certificate from AWS
 * 
 * @param certUrl - The URL of the signing certificate
 * @returns Promise<string> - The certificate
 */
async function fetchSigningCertificate(certUrl: string): Promise<string> {
  // Validate the certificate URL to ensure it's from AWS
  if (!certUrl.startsWith('https://sns.') || !certUrl.includes('.amazonaws.com')) {
    throw new Error('Invalid certificate URL: Not from AWS SNS');
  }
  
  // Check if we have a cached certificate that's less than 24 hours old
  const cachedCert = certificateCache.get(certUrl);
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  if (cachedCert && (Date.now() - cachedCert.timestamp) < CACHE_TTL) {
    //console.log('Using cached certificate');
    return cachedCert.cert;
  }
  
  try {
    //console.log(`Fetching certificate from: ${certUrl}`);
    const response = await fetch(certUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch certificate: ${response.status} ${response.statusText}`);
    }
    
    const cert = await response.text();
    // console.log('Certificate fetched successfully');
    
    // Cache the certificate
    certificateCache.set(certUrl, { cert, timestamp: Date.now() });
    
    return cert;
  } catch (error) {
    //console.error('Error fetching certificate:', error);
    throw error;
  }
}

/**
 * Creates the canonical string for signature verification
 * based on the SNS message type
 * 
 * @param message - The SNS message
 * @returns string - The canonical string
 */
function createCanonicalString(message: SNSMessage): string {
  // AWS SNS requires a very specific format for the canonical string
  // The order of fields is critical and must match exactly what AWS expects
  let canonical = '';
  
  // The canonical string format depends on the message type
  if (message.Type === 'Notification') {
    // For Notification type, the order is critical
    canonical += 'Message\n' + message.Message + '\n';
    canonical += 'MessageId\n' + message.MessageId + '\n';
    
    // Subject is optional
    if (message.Subject) {
      canonical += 'Subject\n' + message.Subject + '\n';
    }
    
    canonical += 'Timestamp\n' + message.Timestamp + '\n';
    canonical += 'TopicArn\n' + message.TopicArn + '\n';
    canonical += 'Type\n' + message.Type + '\n';
    
    // Do not include UnsubscribeURL in the canonical string
    // AWS SNS doesn't include it when generating the signature
  } else if (message.Type === 'SubscriptionConfirmation' || message.Type === 'UnsubscribeConfirmation') {
    // For Subscription and Unsubscribe confirmation types
    const subscriptionMessage = message as SNSSubscriptionMessage;
    
    canonical += 'Message\n' + message.Message + '\n';
    canonical += 'MessageId\n' + message.MessageId + '\n';
    canonical += 'SubscribeURL\n' + subscriptionMessage.SubscribeURL + '\n';
    canonical += 'Timestamp\n' + message.Timestamp + '\n';
    canonical += 'Token\n' + subscriptionMessage.Token + '\n';
    canonical += 'TopicArn\n' + message.TopicArn + '\n';
    canonical += 'Type\n' + message.Type + '\n';
  } else {
    throw new Error(`Unknown SNS message type: ${message.Type}`);
  }
  
  return canonical;
}
