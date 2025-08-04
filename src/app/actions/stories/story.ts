'use server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, verifyStoryOwnership, verifyAttachmentOwnership } from '@/lib/auth-server';
import { convertS3UrlToPublicUrl } from '@/lib/mediaUrl';
import { deleteFileFromS3, deleteDirectoryFromS3 } from '@/lib/s3Delete';
import { headers } from 'next/headers';
import { getCurrentVault } from '@/app/actions/public/vaults';

export type StorySubmission = {
  title: string;
  content: string;
  isPublic: boolean;
  location: string;
  userEmail: string;
  userName: string;
  coverImageId?: string | null;
  hashReplicatingAttachment?: boolean;
};

export type StoryUpdate = {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  userEmail?: string;
  coverImageId?: string | null;
  newCoverImageIndex?: number;
  hashReplicatingAttachment?: boolean;
  newAttachments?: Array<{
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileKey: string;
    s3Url?: string;
    s3Region?: string;
    s3Bucket?: string;
  }>;
  attachmentsToDelete?: string[]; // Array of attachment IDs to delete
};

export async function saveStory(data: StorySubmission) {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== data.userEmail) {
      return { success: false, error: 'Unauthorized: Authentication required' };
    }
    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { email: data.userEmail }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.userEmail,
          name: data.userName
        }
      });
    }
    
    // Get country code from Cloudflare header or default to RO
    // Use the provided location if it's not empty, otherwise use Cloudflare header
    let location = data.location;
    if (!location || location.trim() === '') {
      const headersList = await headers();
      location = headersList.get('cf-ipcountry') || 'RO';
    }
    
    // Get the current active vault
    const { success: vaultSuccess, vault } = await getCurrentVault();
    const vaultId = vaultSuccess && vault ? vault.id : null;
    
    // Create the story
    const story = await prisma.story.create({
      data: {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        userId: user.id,
        location: location,
        vaultId: vaultId,
        hashReplicatingAttachment: data.hashReplicatingAttachment
      }
    });
    
    //console.log(`Story created with location: ${location} and linked to vault: ${vaultId || 'none'}`);
    
    // Mark this as a new story in Redis with 30 minutes expiration
    await cache.set(`new_story:${story.id}`, true, 60 * 30); // 30 minutes expiration
    
    return { success: true, storyId: story.id, coverImageId: data.coverImageId };
  } catch (error) {
    //console.error('Error saving story:', error);
    return { success: false, error: 'Failed to save story' };
  }
}

import { cache } from '@/lib/cache';

export async function saveAttachments(storyId: string, attachments: { fileName: string, fileType: string, fileUrl: string, s3Region?: string, s3Bucket?: string, label?: string, isCoverImage?: boolean }[], userEmail: string) {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== userEmail) {
      return { success: false, error: 'Unauthorized: Authentication required' };
    }
    
    // Verify story ownership
    const hasAccess = await verifyStoryOwnership(storyId);
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized: You do not have permission to modify this story' };
    }
    
    // Check if user has explicitly selected a cover image
    const userSelectedCoverImage = attachments.some(att => att.isCoverImage === true);
    
    // Create all attachments in a transaction and keep track of created attachments
    const createdAttachments = await prisma.$transaction(
      attachments.map(attachment => 
        prisma.attachment.create({
          data: {
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileUrl: attachment.fileUrl,
            storyId: storyId,
            s3Region: attachment.s3Region,
            s3Bucket: attachment.s3Bucket,
            replicated: false
          }
        })
      )
    );
    
    // Store filename to attachment ID mappings in Redis
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      const createdAttachment = createdAttachments[i];
      
      if (createdAttachment) {
        // Extract filename from fileUrl
        const fileUrl = attachment.fileUrl;
        const filename = fileUrl.split('/').pop() || '';
        
        if (filename) {
          // Store mapping from filename to attachment ID in Redis with 1 hour TTL
          await cache.set(`replicate:${filename}`, createdAttachment.id, 3600); // 1 hour TTL
          //console.log(`Stored Redis mapping: replicate:${filename} -> ${createdAttachment.id}`);
        }
      }
    }
    
    // Find the cover image attachment if any
    const coverImageAttachment = attachments.findIndex(att => att.isCoverImage === true);
    let coverImageId = null;
    
    if (coverImageAttachment !== -1 && createdAttachments[coverImageAttachment]) {
      // User selected a cover image
      coverImageId = createdAttachments[coverImageAttachment].id;
      
      // Update the story with the cover image ID
      await updateStoryCoverImage(storyId, coverImageId);
      
      return { 
        success: true, 
        coverImageId: coverImageId 
      };
    }
    
    // Only auto-select if user didn't explicitly select a cover image
    if (!userSelectedCoverImage) {
      // Auto-select the first image as cover if no cover image was explicitly selected
      const firstImageAttachment = attachments.findIndex(att => 
        att.fileType.startsWith('image/') || 
        ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(att.fileName.split('.').pop()?.toLowerCase() || '')
      );
      
      if (firstImageAttachment !== -1 && createdAttachments[firstImageAttachment]) {
        // Auto-select the first image as cover
        coverImageId = createdAttachments[firstImageAttachment].id;
        
        // Update the story with the cover image ID
        await updateStoryCoverImage(storyId, coverImageId);
        
        // Also mark this attachment as replicated since it's now the cover image
        await prisma.attachment.update({
          where: { id: coverImageId },
          data: { replicated: true }
        });
        
        return {
          success: true,
          coverImageId: coverImageId,
          autoSelectedCover: true
        };
      }
    }
    
    return { success: true };
  } catch (error) {
    //console.error('Error saving attachments:', error);
    return { success: false, error: 'Failed to save attachments' };
  }
}

/**
 * Updates a story's cover image ID
 */
export async function updateStoryCoverImage(storyId: string, coverImageId: string) {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return { success: false, error: 'Unauthorized: Authentication required' };
    }
    
    // Verify story ownership
    const hasAccess = await verifyStoryOwnership(storyId);
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized: You do not have permission to modify this story' };
    }
    
    // Update the story with the cover image ID
    await prisma.story.update({
      where: { id: storyId },
      data: { coverImageId: coverImageId }
    });
    
    return { success: true };
  } catch (error) {
    //console.error('Error updating story cover image:', error);
    return { success: false, error: 'Failed to update story cover image' };
  }
}

export async function getStoryById(id: string, userEmail: string) {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== userEmail) {
      return { success: false, error: 'Unauthorized: Authentication required' };
    }
    
    // Get the user from the authenticated session
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get the story with attachments
    const story = await prisma.story.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        attachments: true
      }
    });

    if (!story) {
      return { success: false, error: 'Story not found or you do not have permission to view it' };
    }

    // Format attachments with public URLs for frontend use
    const formattedAttachments = story.attachments
      .map(attachment => ({
        id: attachment.id,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileUrl: (attachment.replicated ? convertS3UrlToPublicUrl(attachment.fileUrl, story.id) : `https://${process.env.DOMAIN}/images/baking.png`),
        isCoverImage: attachment.id === story.coverImageId,
        size: attachment.size,
        replicated: attachment.replicated
      }));

    return {
      success: true,
      story: {
        id: story.id,
        title: story.title,
        content: story.content,
        isPublic: story.isPublic,
        coverImageId: story.coverImageId,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        attachments: formattedAttachments,
        hashReplicatingAttachment: story.hashReplicatingAttachment
      }
    };
  } catch (error) {
    //console.error('Error fetching story:', error);
    return { success: false, error: 'Failed to fetch story' };
  }
}

export async function updateStory(data: StoryUpdate) {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || (data.userEmail && authenticatedUser.email !== data.userEmail)) {
      return { success: false, error: 'Unauthorized: Authentication required' };
    }
    
    // Verify story ownership
    const hasAccess = await verifyStoryOwnership(data.id);
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized: You do not have permission to modify this story' };
    }
    
    // Delete attachments if any are marked for deletion
    if (data.attachmentsToDelete && data.attachmentsToDelete.length > 0) {
      // First, get the attachments to delete to get their S3 information
      const attachmentsToDelete = await prisma.attachment.findMany({
        where: {
          id: { in: data.attachmentsToDelete },
          storyId: data.id // Ensure they belong to this story
        }
      });
      
      // Delete attachments from database
      await prisma.attachment.deleteMany({
        where: {
          id: { in: data.attachmentsToDelete },
          storyId: data.id // Ensure they belong to this story
        }
      });
      
      // Delete files from S3
      for (const attachment of attachmentsToDelete) {
        if (attachment.fileUrl && attachment.s3Region && attachment.s3Bucket) {
          // Extract fileKey from fileUrl
          // Example: https://sealed-love-frankfurt.s3.eu-central-1.amazonaws.com/stories/development/f507f2b5-cf8f-4ecc-8855-457ad2eab103/0524af73-87dd-4391-a24f-3c348cf0c357.mp3
          // We need to extract everything after the domain: stories/development/f507f2b5-cf8f-4ecc-8855-457ad2eab103/0524af73-87dd-4391-a24f-3c348cf0c357.mp3
          const urlParts = new URL(attachment.fileUrl);
          const fileKey = urlParts.pathname.substring(1);
          
          // Delete the file from S3
          await deleteFileFromS3(fileKey, attachment.s3Region, attachment.s3Bucket);
        }
      }
    }
    
    // Update the story
    const updatedStory = await prisma.story.update({
      where: { id: data.id },
      data: {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        coverImageId: data.coverImageId,
        updatedAt: new Date()
      }
    });
    
    // Handle new attachments if any (already uploaded to S3)
    if (data.newAttachments && data.newAttachments.length > 0) {
      // Create all attachments in a transaction
      const createdAttachments = await prisma.$transaction(
        data.newAttachments.map(attachment => 
          prisma.attachment.create({
            data: {
              fileName: attachment.fileName,
              fileType: attachment.fileType,
              fileUrl: attachment.fileUrl,
              storyId: data.id,
              s3Region: attachment.s3Region,
              s3Bucket: attachment.s3Bucket
            }
          })
        )
      );
      
      // Store filename to attachment ID mappings in Redis
      for (let i = 0; i < data.newAttachments.length; i++) {
        const attachment = data.newAttachments[i];
        const createdAttachment = createdAttachments[i];
        
        if (createdAttachment) {
          // Extract filename from fileUrl
          const fileUrl = attachment.fileUrl;
          const filename = fileUrl.split('/').pop() || '';
          
          if (filename) {
            // Store mapping from filename to attachment ID in Redis with 1 hour TTL
            await cache.set(`replicate:${filename}`, createdAttachment.id, 3600); // 1 hour TTL
            //console.log(`Stored Redis mapping: replicate:${filename} -> ${createdAttachment.id}`);
          }
        }
      }
      
      // If we have a new cover image, it's already been updated in the story update above
      if (data.coverImageId) {
        return { 
          success: true, 
          storyId: updatedStory.id, 
          coverImageId: data.coverImageId 
        };
      }
    }

    return { success: true, storyId: updatedStory.id };
  } catch (error) {
    //console.error('Error updating story:', error);
    return { success: false, error: 'Failed to update story' };
  }
}

export async function deleteStory(storyId: string) {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return { success: false, error: 'Unauthorized: Authentication required' };
    }
    
    // Verify story ownership
    const hasAccess = await verifyStoryOwnership(storyId);
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized: You do not have permission to delete this story' };
    }
    
    // Get the user from the authenticated session
    const user = await prisma.user.findUnique({
      where: { email: authenticatedUser.email }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify the story belongs to this user
    const existingStory = await prisma.story.findUnique({
      where: { 
        id: storyId,
        userId: user.id
      }
    });

    if (!existingStory) {
      return { success: false, error: 'Story not found or you do not have permission to delete it' };
    }

    // Get all attachments to get S3 information
    const attachments = await prisma.attachment.findMany({
      where: { storyId }
    });
    
    // Get S3 region and bucket from any attachment (assuming all attachments use the same region/bucket)
    let s3Region = 'eu-central-1'; // Default region
    let s3Bucket = 'sealed-love-frankfurt'; // Default bucket
    
    if (attachments.length > 0 && attachments[0].s3Region && attachments[0].s3Bucket) {
      s3Region = attachments[0].s3Region;
      s3Bucket = attachments[0].s3Bucket;
    }
    
    // Delete all attachments from the database
    await prisma.attachment.deleteMany({
      where: { storyId }
    });

    // Delete the story from the database
    await prisma.story.delete({
      where: { id: storyId }
    });
    
    // Delete all files in the story directory from S3
    // The directory structure is: stories/development/<storyId>
    // or stories/production/<storyId> in production
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    const directoryPrefix = `stories/${environment}/${storyId}`;
    
    try {
      await deleteDirectoryFromS3(directoryPrefix, s3Region, s3Bucket);
    } catch (error) {
      //console.error('Error deleting S3 files for story:', error);
      // Continue with the story deletion even if S3 deletion fails
    }

    return { success: true };
  } catch (error) {
    //console.error('Error deleting story:', error);
    return { success: false, error: 'Failed to delete story' };
  }
}

export async function deleteAttachment(attachmentId: string) {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return { success: false, error: 'Unauthorized: Authentication required' };
    }
    
    // Verify attachment ownership
    const hasAccess = await verifyAttachmentOwnership(attachmentId);
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized: You do not have permission to delete this attachment' };
    }
    
    // Get the user from the authenticated session
    const user = await prisma.user.findUnique({
      where: { email: authenticatedUser.email }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Find the attachment and verify ownership
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { story: true }
    });

    if (!attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Verify the story belongs to this user
    if (attachment.story.userId !== user.id) {
      return { success: false, error: 'You do not have permission to delete this attachment' };
    }

    // Delete the attachment
    await prisma.attachment.delete({
      where: { id: attachmentId }
    });

    return { success: true };
  } catch (error) {
    //console.error('Error deleting attachment:', error);
    return { success: false, error: 'Failed to delete attachment' };
  }
}
