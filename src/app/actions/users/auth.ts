"use server";

import { prisma } from '@/lib/prisma';
import { ServerActionResponse, User } from '@/types';
import { getAuthenticatedUser } from '@/lib/auth-server';

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    return user;
  } catch (error) {
    //console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function updateUserProfile(
  userEmail: string,
  data: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  }
): Promise<ServerActionResponse> {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== userEmail) {
      return {
        success: false,
        message: "Unauthorized: Authentication required"
      };
    }

    // Update the user profile
    await prisma.user.update({
      where: { email: userEmail },
      data
    });

    return {
      success: true,
      message: "Profile updated successfully"
    };
  } catch (error) {
    //console.error('Error updating user profile:', error);
    return {
      success: false,
      message: "Failed to update profile"
    };
  }
}
