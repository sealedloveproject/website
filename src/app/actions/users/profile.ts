"use server";

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Updates a user's profile information
 * @param firstName User's first name
 * @param lastName User's last name
 */
export async function updateUserProfile(firstName: string, lastName: string) {
  try {
    // Get the current session
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      throw new Error('You must be signed in to update your profile');
    }
    
    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: `${firstName} ${lastName}`.trim()
      }
    });
    
    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    };
  } catch (error) {
    //console.error('Error updating user profile:', error);
    return {
      success: false,
      error: 'Failed to update profile'
    };
  }
}
