import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types";

/**
 * Gets the current authenticated user from the server-side
 * @returns User object if authenticated, null otherwise
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Verifies if a user is authenticated on the server-side
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return null;
    }
    
    // Verify that the user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: session.user.isAdmin || false,
      image: session.user.image || null
    };
  } catch (error) {
    //console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Verifies if the current user is an admin
 * @returns True if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession();
    return !!session?.user?.isAdmin;
  } catch (error) {
    //console.error('Admin verification error:', error);
    return false;
  }
}

/**
 * Verifies if the current user owns a story
 * @param storyId ID of the story to check ownership
 * @returns True if user owns the story, false otherwise
 */
export async function verifyStoryOwnership(storyId: string): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return false;
    }
    
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true }
    });
    
    return !!story && story.userId === user.id;
  } catch (error) {
    //console.error('Story ownership verification error:', error);
    return false;
  }
}

/**
 * Verifies if the current user owns an attachment
 * @param attachmentId ID of the attachment to check ownership
 * @returns True if user owns the attachment, false otherwise
 */
export async function verifyAttachmentOwnership(attachmentId: string): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return false;
    }
    
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { story: true }
    });
    
    return !!attachment && attachment.story.userId === user.id;
  } catch (error) {
    //console.error('Attachment ownership verification error:', error);
    return false;
  }
}
