import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createMetadata } from '@/lib/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = createMetadata('/about', {
  title: 'About - sealed.love project',
  description: 'Learn more about the sealed.love project, our story, and how the platform works.',
});

export default async function About() {
  // Get translations
  const t = await getTranslations('About');
  return (
    <div className="fade-in pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      <header className="mb-16">
        <div className="mt-10 mb-6 relative text-center">
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl"></div>
          <h1 className="text-3xl md:text-3xl font-bold relative inline-block">{t('header.title')}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <p className="mt-6 text-lg text-foreground/80">{t('header.subtitle')}</p>
        </div>
      </header>

      <div className="space-y-20">
        <section className="modern-card p-10 md:p-12 text-foreground stagger-children">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-2xl font-bold">{t('sections.story.title')}</h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed">
            <div className="mb-2">
              <p className="mb-3">
                {t('sections.story.content.intro')}
              </p>
              <p>
                {t('sections.story.content.dream')}
              </p>
            </div>
            
            <div className="mb-2">
              <p className="mb-3">
                {t.rich('sections.story.content.revelation', {
                  love: (chunks) => <span className="font-semibold">{chunks}</span>
                })}
              </p>
              <p>
                {t('sections.story.content.transcends')}
              </p>
            </div>
            
            <p>
              {t('sections.story.content.purpose')}
            </p>
            
            <p>
              {t('sections.story.content.background')}
            </p>
            
            <div className="mb-2">
              <p>
                {t('sections.story.content.immortal')}
              </p>
            </div>
            
            <p>
              {t('sections.story.content.essence')}
            </p>
            
            <div className="mb-2">
              <p className="mb-3">
                {t('sections.story.content.divine')}
              </p>
              <p>
                {t('sections.story.content.forgive')}
              </p>
            </div>
            
            <p>
              {t('sections.story.content.chance')}
            </p>
            
            <p className="font-bold text-center mt-10 text-xl">
              {t('sections.story.content.love')}
            </p>
          </div>
        </section>

        <section className="modern-card p-10 md:p-12 text-foreground stagger-children" id="about-vault">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-2xl font-bold">{t('sections.vault.title')}</h2>
          </div>
          
          <div className="space-y-8 text-lg leading-relaxed">
            {/* Introduction with simple explanation */}
            <div className="space-y-5 text-lg leading-relaxed">
              <h3 className="text-xl font-semibold">{t('sections.vault.whatIsVault.title')}</h3>
              <p>
                {t('sections.vault.whatIsVault.description')}
              </p>
            </div>

            {/* How Love Vaults Work */}
            <div className="space-y-8 mt-10">
              <div className="mb-12">
                <h3 className="text-2xl md:text-2xl font-bold mb-4">{t('sections.vault.howItWorks.title')}</h3>
                <p className="text-lg text-foreground/80">{t('sections.vault.howItWorks.subtitle')}</p>
              </div>
              
              <div className="space-y-12">
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-3 text-primary">{t('sections.vault.collection.title')}</h4>
                    <p className="text-lg leading-relaxed text-foreground/90">{t('sections.vault.collection.description')}</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-3 text-primary">{t('sections.vault.digitalPreservation.title')}</h4>
                    <p className="text-lg leading-relaxed text-foreground/90">{t('sections.vault.digitalPreservation.description')}</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-3 text-primary">{t('sections.vault.futureDiscovery.title')}</h4>
                    <p className="text-lg leading-relaxed text-foreground/90">{t('sections.vault.futureDiscovery.description')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-12 text-center slide-up">
          <Link 
            href="/user/stories" 
            className="btn-primary inline-flex items-center gap-2 group"
          >
            {t('sections.vault.preserveStory')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
          </div>
        </section>

        {/* Trust & Transparency Section */}
        <section className="modern-card p-10 md:p-12 text-foreground stagger-children">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623A11.99 11.99 0 0018.402 6 11.959 11.959 0 0112 2.713z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-2xl font-bold">{t('sections.trust.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">{t('sections.trust.features.openSource.title')}</h3>
              <p className="text-muted-foreground text-sm">{t.rich('sections.trust.features.openSource.description', {
                githubLink: (chunks) => <a href="https://github.com/sealedlove" className="text-primary hover:underline">{chunks}</a>
              })}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">{t('sections.trust.features.dataIntegrity.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('sections.trust.features.dataIntegrity.description')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('sections.trust.features.community.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('sections.trust.features.community.description')}</p>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="modern-card p-10 md:p-12 text-foreground stagger-children">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-2xl font-bold">{t('sections.joinCommunity.title')}</h2>
          </div>
          
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-lg mb-8">
              {t('sections.joinCommunity.description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              <a href="https://x.com/sealedloveproj" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center p-6 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border group">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{t('sections.joinCommunity.platforms.twitter.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('sections.joinCommunity.platforms.twitter.description')}</p>
              </a>
              
              <a href="https://instagram.com/sealedloveproject" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center p-6 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border group">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{t('sections.joinCommunity.platforms.instagram.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('sections.joinCommunity.platforms.instagram.description')}</p>
              </a>
              
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center p-6 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border group">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M18 9.2c-.2-.5-.5-1-.9-1.4-1.9-1.7-4.6-2-4.8-2h-.6c-.2 0-2.9.3-4.8 2-.4.4-.7.9-.9 1.4-1.4 3.1-.7 5.2-.5 5.5.8 1.1 2.1 1.7 3.1 1.9l.6-.9c-.5-.1-1.1-.4-1.6-.8.1-.1.2-.1.3-.2 2.2 1 4.6 1 6.8 0 .1.1.2.1.3.2-.5.4-1.1.7-1.6.8l.6.9c1-.2 2.3-.8 3.1-1.9.2-.3.9-2.4-.5-5.5zm-8.3 4.5c-.6 0-1.1-.5-1.1-1.2s.5-1.2 1.1-1.2c.6 0 1.1.5 1.1 1.2s-.5 1.2-1.1 1.2zm4.6 0c-.6 0-1.1-.5-1.1-1.2s.5-1.2 1.1-1.2c.6 0 1.1.5 1.1 1.2s-.5 1.2-1.1 1.2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{t('sections.joinCommunity.platforms.discord.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('sections.joinCommunity.platforms.discord.description')}</p>
              </a>
              
              <a href="https://github.com/sealedloveproject" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center p-6 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border group">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{t('sections.joinCommunity.platforms.github.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('sections.joinCommunity.platforms.github.description')}</p>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="modern-card p-10 md:p-12 text-foreground stagger-children">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-2xl font-bold mb-8">{t('sections.faq.title')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium text-lg">{t('sections.faq.questions.vaultDuration.question')}</h4>
              </div>
              <div className="p-4">
                <p>{t('sections.faq.questions.vaultDuration.answer')}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium text-lg">{t('sections.faq.questions.storySelection.question')}</h4>
              </div>
              <div className="p-4">
                <p>{t('sections.faq.questions.storySelection.answer')}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium text-lg">{t('sections.faq.questions.whyVaults.question')}</h4>
              </div>
              <div className="p-4">
                <p>{t('sections.faq.questions.whyVaults.answer')}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium text-lg">{t('sections.faq.questions.dataControl.question')}</h4>
              </div>
              <div className="p-4">
                <p>{t('sections.faq.questions.dataControl.answer')}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium text-lg">{t('sections.faq.questions.cost.question')}</h4>
              </div>
              <div className="p-4">
                <p>{t.rich('sections.faq.questions.cost.answer', {
                  supportLink: (chunks) => <Link href="/support" className="text-primary hover:underline">{chunks}</Link>
                })}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium text-lg">{t('sections.faq.questions.security.question')}</h4>
              </div>
              <div className="p-4">
                <p>{t('sections.faq.questions.security.answer')}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium text-lg">{t('sections.faq.questions.locations.question')}</h4>
              </div>
              <div className="p-4">
                <p>{t('sections.faq.questions.locations.answer')}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="py-12 text-center slide-up">
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/user/stories" 
              className="btn-primary inline-flex items-center gap-2 group"
            >
              {t('sections.cta.storeStory')}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link 
              href="/stories" 
              className="btn-secondary inline-flex items-center gap-2 group"
            >
              {t('sections.cta.readStories')}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </Link>
          </div>
          <div className="mt-4 text-sm text-foreground/70">{t('sections.cta.vaultDescription')}</div>
          <div className="mt-8 text-foreground/80 italic">{t('sections.cta.motto')}<br />Alex</div>
        </div>
      </div>
    </div>
  );
}
