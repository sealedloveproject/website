'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import { User, AuthContextType } from '@/types';
import { updateUserProfile as updateUserProfileAction } from '@/app/actions/users/profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>('');

  // Update user state when session changes
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      // Extract first and last name from the session user's name if available
      const fullName = session.user.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        firstName: firstName,
        lastName: lastName,
        isAdmin: session.user.isAdmin || false,
        image: session.user.image || null
      });
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, [session, status]);

  const openSignInModal = () => setIsSignInModalOpen(true);
  const closeSignInModal = () => setIsSignInModalOpen(false);

  const signIn = async (email: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    setVerificationEmail(email);
    
    try {
      // Use NextAuth's signIn method with sendgrid provider (not email)
      // Add redirect: false to prevent NextAuth from redirecting
      // This keeps the modal open and allows us to show the verification step
      const result = await nextAuthSignIn('sendgrid', { 
        email,
        redirect: false,
        callbackUrl: window.location.href
      });
      
      //console.log('NextAuth sign-in result:', result);
      
      // Even if result is undefined, we'll consider it a success
      // This is because NextAuth sometimes returns undefined even when the email is sent
      // The modal will stay open until user verifies from email
      
      // Check for explicit error
      if (result?.error) {
        throw new Error(result.error);
      }
      
      return { success: true };
    } catch (error) {
      //console.error('Authentication error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = useCallback(async (firstName: string, lastName: string) => {
    if (!user) return;
    
    // Update the user in the database using the server action
    try {
      const result = await updateUserProfileAction(firstName, lastName);
      if (!result.success) {
        //console.error('Failed to update profile in database:', result.error);
        return;
      }
    } catch (error) {
      //console.error('Error updating profile:', error);
      return;
    }
    
    // Update the user state only after successful database update
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim()
      };
    });
  }, [user]);

  const signOut = async () => {
    try {
      // Use NextAuth's signOut method
      await nextAuthSignOut({ callbackUrl: '/' });
      
      // NextAuth will handle clearing the session
      // We'll keep the user_info in localStorage for convenience
    } catch (error) {
      //console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isSignInModalOpen,
    openSignInModal,
    closeSignInModal,
    signIn,
    updateUserProfile,
    signOut,
    verificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
