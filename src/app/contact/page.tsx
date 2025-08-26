'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { sendContactEmail, ContactFormData } from '../actions/sendContactEmail';

export default function ContactPage() {
  const t = useTranslations('Contact');
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions by disabling the submit button immediately
    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
    
    setIsSubmitting(true);
    setGeneralError('');
    setErrors({});
    
    try {
      // Send the contact form data to the server action
      // But since this is a client component, we'll let the server action use default 'unknown'
      const result = await sendContactEmail(formData as ContactFormData);
      
      if (result.success) {
        // Show success state
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        // Handle validation or server errors
        if (result.fieldErrors) {
          // Map field errors to the corresponding form fields
          const fieldErrorsMap: Record<string, string> = {};
          
          // Convert Zod field errors to our format
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrorsMap[field] = messages[0];
            }
          });
          
          setErrors(fieldErrorsMap);
          
          if (Object.keys(fieldErrorsMap).length === 0) {
            setGeneralError('Please check your form data and try again.');
          }
        } else {
          setGeneralError(result.error || 'Something went wrong. Please try again later.');
        }
      }
    } catch (err) {
      setGeneralError('Something went wrong. Please try again later.');
      console.error('Contact form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-3xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center" role="status" aria-live="polite">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">{t('success.title')}</h2>
            <p className="text-green-700 mb-6">
              {t('success.message')}
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('success.button')}
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm p-8">
            {/* General Error Message */}
            {generalError && (
              <div className="mb-6 p-4 border border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{generalError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} aria-describedby="error-message" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Fields */}
                <div className="mb-6">
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('form.name.label')}</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`bg-white dark:bg-gray-900 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3`}
                    required
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.name}</p>}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('form.email.label')}</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`bg-white dark:bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3`}
                    required
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.email}</p>}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('form.subject.label')}</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`bg-white dark:bg-gray-900 border ${errors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3`}
                  required
                />
                {errors.subject && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.subject}</p>}
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('form.message.label')}</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`bg-white dark:bg-gray-900 border ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3`}
                  required
                />
                {errors.message && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.message}</p>}
              </div>
              
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth={true}
                  size="lg"
                  aria-live="polite"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" role="status">
                        <title>{t('form.loading')}</title>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('form.sending')}
                    </>
                  ) : (
                    t('form.submit')
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        <div className="mt-12 grid grid-cols-1 gap-8">
          <div className="bg-card p-6 rounded-xl text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('helpCenter.title')}</h3>
            <p className="text-foreground/70">
              <Link href="/about" className="hover:text-primary transition-colors" aria-label={t('helpCenter.link')}>
                {t('helpCenter.link')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
