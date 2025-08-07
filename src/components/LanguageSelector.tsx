'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import * as Flags from 'country-flag-icons/react/3x2';

// Define language type
type Language = {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
};

// Define props for the component
type LanguageSelectorProps = {
  variant: 'dropdown' | 'grid';
  onClose?: () => void;
  theme?: string;
};

export default function LanguageSelector({ variant, onClose, theme }: LanguageSelectorProps) {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  
  // Default languages configuration
  const defaultLanguages: Language[] = [
    { code: 'en', name: t('language.en'), flag: 'US', enabled: false },
    { code: 'es', name: t('language.es'), flag: 'ES', enabled: false },
    { code: 'fr', name: t('language.fr'), flag: 'FR', enabled: false },
    { code: 'de', name: t('language.de'), flag: 'DE', enabled: false },
    { code: 'it', name: t('language.it'), flag: 'IT', enabled: false },
    { code: 'pt', name: t('language.pt'), flag: 'PT', enabled: false },
    { code: 'ru', name: t('language.ru'), flag: 'RU', enabled: false },
    { code: 'ro', name: t('language.ro'), flag: 'RO', enabled: false },
  ];
  
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    defaultLanguages.find(lang => lang.code === locale) || defaultLanguages[0]
  );
  const [isOpen, setIsOpen] = useState(false);

  // Fetch available locales from the server
  useEffect(() => {
    async function fetchAvailableLocales() {
      try {
        const response = await fetch('/api/available-locales');
        if (response.ok) {
          const availableLocales = await response.json();
          
          // Update languages with enabled status
          setLanguages(prevLanguages => 
            prevLanguages.map(lang => ({
              ...lang,
              enabled: availableLocales.includes(lang.code)
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch available locales:', error);
      }
    }
    
    fetchAvailableLocales();
  }, []);

  // Handle language change
  const handleLanguageChange = (language: Language) => {
    if (!language.enabled) return;
    if (language.code === locale) return;
    
    setSelectedLanguage(language);
    setIsOpen(false);
    if (onClose) onClose();
    
    // Set a cookie with the selected language
    document.cookie = `NEXT_LOCALE=${language.code};path=/;max-age=31536000`; // 1 year expiry
    
    // Reload the page to apply the language change
    window.location.reload();
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded hover:bg-foreground/5 transition-colors duration-200"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="w-5 h-4 relative">
            {selectedLanguage.flag && {
              'US': <Flags.US className="w-full h-full" title={selectedLanguage.name} />,
              'ES': <Flags.ES className="w-full h-full" title={selectedLanguage.name} />,
              'FR': <Flags.FR className="w-full h-full" title={selectedLanguage.name} />,
              'DE': <Flags.DE className="w-full h-full" title={selectedLanguage.name} />,
              'PT': <Flags.PT className="w-full h-full" title={selectedLanguage.name} />,
              'RU': <Flags.RU className="w-full h-full" title={selectedLanguage.name} />,
              'RO': <Flags.RO className="w-full h-full" title={selectedLanguage.name} />,
              'IT': <Flags.IT className="w-full h-full" title={selectedLanguage.name} />
            }[selectedLanguage.flag]}
          </div>
          <span className="text-sm font-medium">{selectedLanguage.code.toUpperCase()}</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)}
            />
            <div 
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-40"
              role="listbox"
            >
              <div className="py-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    className={`flex items-center w-full space-x-3 px-4 py-2 text-left text-sm ${
                      selectedLanguage.code === language.code 
                        ? 'bg-primary/10 text-primary dark:text-primary-400' 
                        : language.enabled 
                          ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200' 
                          : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => language.enabled && handleLanguageChange(language)}
                    disabled={!language.enabled}
                    role="option"
                    aria-selected={selectedLanguage.code === language.code}
                  >
                    <div className="w-6 h-4 relative">
                      {language.flag && {
                        'US': <Flags.US className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
                        'ES': <Flags.ES className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
                        'FR': <Flags.FR className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
                        'DE': <Flags.DE className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
                        'PT': <Flags.PT className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
                        'RU': <Flags.RU className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
                        'RO': <Flags.RO className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
                        'IT': <Flags.IT className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />
                      }[language.flag]}
                    </div>
                    <span>{language.name}</span>
                    {!language.enabled && (
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 italic">Soon</span>
                    )}
                    {selectedLanguage.code === language.code && (
                      <div className="ml-auto">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
  
  // Grid variant (for mobile)
  return (
    <div className="grid grid-cols-2 gap-2 px-4">
      {languages.map((language) => (
        <button
          key={language.code}
          className={`flex items-center space-x-2 p-2 rounded ${
            selectedLanguage.code === language.code 
              ? 'bg-primary/10 text-primary dark:text-primary-400' 
              : language.enabled 
                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200' 
                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => language.enabled && handleLanguageChange(language)}
          disabled={!language.enabled}
        >
          <div className="w-8 h-6 relative">
            {language.flag && {
              'US': <Flags.US className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
              'ES': <Flags.ES className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
              'FR': <Flags.FR className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
              'DE': <Flags.DE className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
              'PT': <Flags.PT className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
              'RU': <Flags.RU className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
              'RO': <Flags.RO className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />,
              'IT': <Flags.IT className={`w-full h-full ${!language.enabled ? 'opacity-50' : ''}`} title={language.name} />
            }[language.flag]}
          </div>
          <span className="text-base">{language.name}</span>
          {!language.enabled && (
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-300 italic">Soon</span>
          )}
          {selectedLanguage.code === language.code && (
            <div className="ml-auto">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
