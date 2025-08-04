'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Import types from centralized types index
import { User } from '@/types';
import { Button } from '@/components/ui/Button';

type SignInStep = 'email' | 'verification' | 'profile';

type SignInFormProps = {
  onClose?: () => void;
  className?: string;
  onStepChange?: (step: SignInStep) => void;
};

export default function SignInForm({ onClose, className = '', onStepChange }: SignInFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<SignInStep>('email');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions by disabling the submit button immediately
    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use the signIn function from AuthContext which now uses NextAuth with sendgrid provider
      await signIn(email);
      
      // Move to verification step
      setStep('verification');
      
      // Notify parent component of step change
      if (onStepChange) {
        onStepChange('verification');
      }
      
      // Clear any previous errors
      setError('');
    } catch (err) {
      setError('Failed to send verification code. Please check your email and try again.');
      //console.error('Email verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if we need to collect profile information
  const checkProfileNeeded = async (email: string) => {
    // If not in localStorage, check if user exists in database and has a name
    try {
      const { getUserByEmail } = await import('@/app/actions/users/auth');
      const user = await getUserByEmail(email);
      
      if (user && user.name) {
        // User exists and has a name in the database
        // Parse the name to get firstName and lastName
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        if (firstName) {
          // Store in localStorage for future use
          localStorage.setItem('user_info', JSON.stringify({
            firstName,
            lastName
          }));
          
          return {
            needed: false,
            firstName,
            lastName
          };
        }
      }
      
      // No profile info found
      return { needed: true };
    } catch (error) {
      //console.error('Error checking user profile:', error);
      return { needed: true };
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions by disabling the submit button immediately
    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Join the verification code array into a single string
      const codeString = verificationCode.join('');
      
      // Check if the code is complete
      if (codeString.length !== 6) {
        throw new Error('Please enter all 6 digits of the verification code');
      }
      
      // Use the verification code to authenticate with NextAuth
      const { signIn: nextAuthSignIn } = await import('next-auth/react');
      
      // Authenticate with the credentials provider using the verification code
      const result = await nextAuthSignIn('credentials', {
        email,
        code: codeString,
        redirect: false
      });
      
      if (result?.error) {
        // Show a single, clear error message for invalid verification code
        throw new Error('Invalid verification code');
      }
      
      // Check if we need to collect user profile information
      const profileCheck = await checkProfileNeeded(email);
      
      if (!profileCheck.needed) {
        // User already has profile info, we'll close the modal and refresh the page
        if (onClose) {
          onClose();
        }
        // Force a page refresh to update the session
        window.location.reload();
      } else {
        // We need to collect user profile information
        setFirstName(profileCheck.firstName || '');
        setLastName(profileCheck.lastName || '');
        setStep('profile');
        if (onStepChange) {
          onStepChange('profile');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
      //console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input change for individual code inputs
  const handleCodeInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update the code array
    const newCode = [...verificationCode];
    
    // If pasting multiple digits
    if (value.length > 1) {
      // Distribute the pasted digits across the inputs
      const digits = value.split('').slice(0, 6);
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 6) {
          newCode[index + i] = digits[i];
        }
      }
      setVerificationCode(newCode);
      
      // Focus the appropriate input after paste
      const nextIndex = Math.min(index + digits.length, 5);
      codeInputRefs.current[nextIndex]?.focus();
    } else {
      // Handle single digit input
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input if this one is filled
      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  // Handle key down for navigation between inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      codeInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move to previous input on left arrow
      codeInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Move to next input on right arrow
      codeInputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle paste event on the container
  const handleContainerPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!pastedData) return;
    
    // Extract only digits from pasted content
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    const newCode = [...verificationCode];
    
    // Fill in the code inputs with pasted digits
    digits.forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    
    setVerificationCode(newCode);
    
    // Focus the last input or the next empty one
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    codeInputRefs.current[focusIndex]?.focus();
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions by disabling the submit button immediately
    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Validate inputs
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error('Please enter both your first and last name');
      }
      
      // Update the user profile in the database
      const { updateUserProfile } = await import('@/app/actions/users/auth');
      await updateUserProfile(email, {
        name: `${firstName} ${lastName}`
      });
      
      // Store profile info in localStorage
      localStorage.setItem('user_info', JSON.stringify({
        firstName,
        lastName
      }));
      
      // Refresh the session to include the updated user info
      const { signIn: nextAuthSignIn } = await import('next-auth/react');
      await nextAuthSignIn('credentials', {
        email,
        code: 'profile_update', // Special code to indicate profile update
        redirect: false
      });
      
      // Close the modal if it's being used as a modal
      if (onClose) {
        onClose();
      }
      
      // Force a page refresh to update the session
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
      //console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleRequestCode} className="space-y-6">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-medium">Sign in to your account</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Enter your email to receive a verification code
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm bg-background focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              variant="primary"
              className="flex justify-center"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </div>
        </form>
      ) : step === 'verification' ? (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-medium">Verify your email</h3>
            <p className="mt-2 text-sm text-foreground/70">
              We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
            </p>
          </div>
          
          <div 
            ref={containerRef} 
            onPaste={handleContainerPaste}
            className="flex justify-center space-x-2 mb-4"
          >
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={el => {
                  codeInputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg border border-border rounded-md shadow-sm bg-background focus:ring-primary focus:border-primary"
                required
              />
            ))}
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={isLoading || verificationCode.some(digit => !digit)}
              fullWidth
              variant="primary"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </Button>

            <div className="flex justify-between text-sm">
              <Button
                type="button"
                onClick={() => {
                  setStep('email');
                  if (onStepChange) {
                    onStepChange('email');
                  }
                }}
                variant="link"
                className="text-foreground/70 hover:text-foreground"
              >
                Use a different email
              </Button>
              
              <Button
                type="button"
                onClick={handleRequestCode}
                variant="link"
                className="text-primary hover:text-primary/80"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Resend code'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-medium">Complete Your Profile</h3>
            <div className="mt-2 flex justify-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-foreground/70 mt-3">
              Tell us a bit about yourself
            </p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full px-4 py-3 border border-border rounded-md shadow-sm bg-background focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your first name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full px-4 py-3 border border-border rounded-md shadow-sm bg-background focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              disabled={isLoading || !firstName || !lastName}
              fullWidth
              variant="primary"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </div>
        </form>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-foreground/70">
          No registration needed. Just enter your email to get started.
        </p>
      </div>
    </div>
  );
}
