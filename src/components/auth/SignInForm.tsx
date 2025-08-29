'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

// Import types from auth types
import { User } from '@/types/auth';
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
  const containerRef = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<SignInStep>('email');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const t = useTranslations('Auth');
  
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
      setError(t('errors.sendCode'));
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
        throw new Error(t('errors.missingDigits'));
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
        throw new Error(t('errors.invalidCode'));
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
        throw new Error(t('errors.missingName'));
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
      setError(err instanceof Error ? err.message : t('errors.profileError'));
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

      {step === 'email' && (
        <form onSubmit={handleRequestCode} className="space-y-8 animate-fadeIn">
          <div className="mb-8 text-center">
            <div className="inline-block mb-2 bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-primary/90">sealed.love</span>
            </div>
            <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              {t('form.email.title')}
            </h3>
            <p className="mt-3 text-sm text-foreground/80 max-w-md mx-auto leading-relaxed">
              {t('form.email.subtitle')}
            </p>
          </div>

          <div className="bg-gradient-to-r from-muted/40 to-muted/20 p-6 rounded-2xl shadow-sm border border-white/5 backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground/90">
              <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {t('form.email.label')}
            </label>
            <div className="relative group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-border/50 rounded-lg shadow-sm bg-background/80 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm group-hover:border-primary/30"
                placeholder={t('form.email.placeholder')}
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            <div className="mt-3 flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-foreground/70">{t('form.email.privacyNotice')}</p>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              variant="primary"
              className="flex justify-center py-3.5 text-base font-medium shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 rounded-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">{t('form.email.loading')}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  {t('form.email.button')}
                </span>
              )}
            </Button>
          </div>
        </form>
      )}
      
      {step === 'verification' && (
        <form 
          ref={containerRef}
          onSubmit={handleVerifyCode} 
          onPaste={handleContainerPaste}
          className="space-y-8 animate-fadeIn"
        >
          <div className="mb-8 text-center">
            <div className="inline-block mb-2 bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-primary/90">verification</span>
            </div>
            <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              {t('form.verification.title')}
            </h3>
            <p className="mt-3 text-sm text-foreground/80 max-w-md mx-auto leading-relaxed">
              {t('form.verification.subtitle')} <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          <div className="bg-gradient-to-r from-muted/40 to-muted/20 p-6 rounded-2xl shadow-sm border border-white/5 backdrop-blur-sm">
            <div className="flex justify-center gap-3 mb-6">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { codeInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center border border-border/50 rounded-lg shadow-sm bg-background/80 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-xl font-semibold hover:border-primary/30"
                  aria-label={`Digit ${index + 1}`}
                  required
                />
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-foreground/70 hover:text-foreground flex items-center gap-1 transition-colors duration-200"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                {t('form.verification.useAnotherEmail')}
              </button>
              <button
                type="button"
                onClick={handleRequestCode}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors duration-200"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {t('form.verification.resendCode')}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isLoading || verificationCode.some(digit => !digit)}
              fullWidth
              variant="primary"
              className="flex justify-center py-3.5 text-base font-medium shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 rounded-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">{t('form.verification.loading')}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('form.verification.button')}
                </span>
              )}
            </Button>
          </div>
        </form>
      )}
      
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-8 animate-fadeIn">
          <div className="mb-8 text-center">
            <div className="inline-block mb-2 bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-primary/90">profile</span>
            </div>
            <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              {t('form.profile.title')}
            </h3>
            <p className="mt-3 text-sm text-foreground/80 max-w-md mx-auto leading-relaxed">
              {t('form.profile.subtitle')}
            </p>
          </div>

          <div className="bg-gradient-to-r from-muted/40 to-muted/20 p-6 rounded-2xl shadow-sm border border-white/5 backdrop-blur-sm">
            <div className="grid gap-5">
              <div>
                <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground/90">
                  <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {t('form.profile.firstName.label')}
                </label>
                <div className="relative group">
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full px-4 py-3 border border-border/50 rounded-lg shadow-sm bg-background/80 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm group-hover:border-primary/30"
                    placeholder={t('form.profile.firstName.placeholder')}
                    autoFocus
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground/90">
                  <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {t('form.profile.lastName.label')}
                </label>
                <div className="relative group">
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full px-4 py-3 border border-border/50 rounded-lg shadow-sm bg-background/80 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm group-hover:border-primary/30"
                    placeholder={t('form.profile.lastName.placeholder')}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              variant="primary"
              className="flex justify-center py-3.5 text-base font-medium shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 rounded-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">{t('form.profile.loading')}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('form.profile.button')}
                </span>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
