import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  
  return (
    <footer className="bg-muted py-8 mt-12 text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">sealed.love <span className="text-primary">v{process.env.APP_VERSION}</span></h3>
            <p className="text-sm max-w-md">
              {t('tagline')}
            </p>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{t('joinCommunity')}</h3>
            <div className="flex space-x-5">
              <a href="https://x.com/sealedloveproj" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/sealedloveproject" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors" aria-label="Discord">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 9.2c-.2-.5-.5-1-.9-1.4-1.9-1.7-4.6-2-4.8-2h-.6c-.2 0-2.9.3-4.8 2-.4.4-.7.9-.9 1.4-1.4 3.1-.7 5.2-.5 5.5.8 1.1 2.1 1.7 3.1 1.9l.6-.9c-.5-.1-1.1-.4-1.6-.8.1-.1.2-.1.3-.2 2.2 1 4.6 1 6.8 0 .1.1.2.1.3.2-.5.4-1.1.7-1.6.8l.6.9c1-.2 2.3-.8 3.1-1.9.2-.3.9-2.4-.5-5.5zm-8.3 4.5c-.6 0-1.1-.5-1.1-1.2s.5-1.2 1.1-1.2c.6 0 1.1.5 1.1 1.2s-.5 1.2-1.1 1.2zm4.6 0c-.6 0-1.1-.5-1.1-1.2s.5-1.2 1.1-1.2c.6 0 1.1.5 1.1 1.2s-.5 1.2-1.1 1.2z"/>
                </svg>
              </a>
              <a href="https://github.com/sealedloveproject" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end">
            <div className="flex space-x-4 mb-4">
              <Link href="/about" className="text-sm hover:text-primary transition-colors">
                {t('about')}
              </Link>
              <Link href="/privacy" className="text-sm hover:text-primary transition-colors">
                {t('privacy')}
              </Link>
              <Link href="/terms" className="text-sm hover:text-primary transition-colors">
                {t('terms')}
              </Link>
              <Link href="/contact" className="text-sm hover:text-primary transition-colors">
                {t('contact')}
              </Link>
            </div>
            <p className="text-xs">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
