'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteAccount, sendDeleteVerification, verifyDeleteCode } from '@/app/actions/users/deleteAccount';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, isAuthenticated, updateUserProfile, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/');
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      setUpdateError('Both first and last name are required');
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      await updateUserProfile(firstName.trim(), lastName.trim());
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      //console.error('Error updating profile:', error);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      setIsSendingCode(true);
      setCodeError(null);
      
      // Call the server action to send verification code
      const result = await sendDeleteVerification();
      
      if (result.success) {
        setIsCodeSent(true);
      } else {
        setCodeError(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      //console.error('Error sending verification code:', error);
      setCodeError('An unexpected error occurred while sending verification code');
    } finally {
      setIsSendingCode(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setCodeError('Please enter the verification code');
      return;
    }
    
    try {
      setIsVerifyingCode(true);
      setCodeError(null);
      
      // Call the server action to verify the code
      const result = await verifyDeleteCode(verificationCode);
      
      if (result.success) {
        setCodeVerified(true);
        setCodeError(null);
      } else {
        setCodeError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      //console.error('Error verifying code:', error);
      setCodeError('An unexpected error occurred while verifying code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT' || !codeVerified) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // Call the server action to delete the account
      const result = await deleteAccount();
      
      if (result.success) {
        // Sign out and redirect to home page
        await signOut();
        router.push('/?deleted=true');
      } else {
        //console.error('Account deletion failed:', result.error);
        setUpdateError(result.error || 'Failed to delete account');
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      //console.error('Error deleting account:', error);
      setUpdateError('An unexpected error occurred while deleting your account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const resetDeleteFlow = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    setVerificationCode('');
    setIsCodeSent(false);
    setCodeVerified(false);
    setCodeError(null);
  };

  return (
    <div className="fade-in pt-16 pb-20 px-6 max-w-4xl mx-auto">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      
      <header className="mb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-4xl font-bold mb-4">Profile Settings</h1>
          <p className="text-lg text-foreground/80">Manage your account information and preferences</p>
        </div>
      </header>

      <div className="space-y-8">
        {/* Profile Information */}
        <section className="modern-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Personal Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Your first name"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Your last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  {user?.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {updateError}
              </div>
            )}

            {updateSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                Profile updated successfully!
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUpdating}
                variant="primary"
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Account Management */}
        <section className="modern-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Account Management</h2>
          </div>

          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. This will permanently delete your account and all associated data including your stories and media files.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={resetDeleteFlow} className="max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Account</h3>
              <p className="text-muted-foreground mb-4">
                This action cannot be undone. All your stories, media files, and account data will be permanently deleted.
              </p>
              
              {/* Email verification section */}
              <div className="text-left mb-4">
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    For security, we need to verify your email address before deleting your account.
                  </p>
                </div>
                
                {!isCodeSent ? (
                  <button
                    onClick={handleSendVerificationCode}
                    disabled={isSendingCode}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSendingCode ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        <span>Sending code...</span>
                      </>
                    ) : (
                      'Send verification code to my email'
                    )}
                  </button>
                ) : !codeVerified ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter the 6-digit verification code sent to your email:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="6-digit code"
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={isVerifyingCode || !verificationCode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isVerifyingCode ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </div>
                    {codeError && (
                      <p className="text-sm text-red-600 mt-2">{codeError}</p>
                    )}
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      {isSendingCode ? 'Sending...' : 'Resend code'}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-800">Email verified successfully</span>
                  </div>
                )}
              </div>
              
              {/* Confirmation text input */}
              {codeVerified && (
                <div className="text-left mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE MY ACCOUNT</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Type confirmation text"
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
              <button
                onClick={resetDeleteFlow}
                className="px-5 py-2.5 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-all duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting || deleteConfirmText !== 'DELETE MY ACCOUNT' || !codeVerified}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
      </Modal>
    </div>
  );
}
