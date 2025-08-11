import React from 'react';
import Link from 'next/link';
import StoryCard from '@/components/stories/StoryCard';
import { getHotStories } from '@/app/actions/public/stories';
import { getCurrentVault } from '@/app/actions/public/vaults';
import { Story } from '@/types';
import FallbackImage from '@/components/stories/FallbackImage';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createMetadata } from '@/lib/metadata';
import { generateHomePageJsonLd } from '@/lib/jsonld';

// Define metadata for the homepage
export const metadata: Metadata = createMetadata('/', {
  title: 'Sealed Love Project | Preserve Your Love Stories',
  description: 'Create, preserve, and share your love stories for generations to come. Sealed Love Project offers secure, timeless digital preservation of your most precious romantic memories and milestones, completely free.',
  openGraph: {
    title: 'Sealed Love Project | Preserve Your Love Stories',
    description: 'Create, preserve, and share your love stories for generations to come. Sealed Love Project offers secure, timeless digital preservation of your most precious romantic memories and milestones, completely free.',
    url: `https://${process.env.DOMAIN}/`,
    siteName: 'Sealed Love',
    images: [
      {
        url: `https://${process.env.DOMAIN}/images/og-home.png`,
        width: 1024,
        height: 1024,
        alt: 'Sealed Love Project',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sealed Love Project | Preserve Your Love Stories',
    description: 'Create, preserve, and share your love stories for generations to come. Sealed Love Project offers secure, timeless digital preservation of your most precious romantic memories and milestones—completely free.',
    images: [`https://${process.env.DOMAIN}/images/og-home.png`],
  },
  // Note: canonical URL will be automatically added by createMetadata
});

export default async function Home() {
  const t = await getTranslations('Home');

  const publicStories = await getHotStories(3);
  const { success, vault } = await getCurrentVault();

  return (
    <div className="fade-in text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20">
      {/* Enhanced background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/3 via-transparent to-secondary/3 opacity-20 -z-10"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 blur-3xl animate-float-slow -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-secondary/15 to-primary/10 blur-3xl animate-float-slower -z-10"></div>
      
      {/* Subtle pattern overlay - CSS-based dots */}
      <div className="absolute inset-0 opacity-5 -z-10" 
           style={{
             backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }}>
      </div>
      
      {/* Light beams */}
      <div className="absolute -top-[10%] left-[20%] w-[150px] h-[600px] rotate-[30deg] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-2xl -z-10"></div>
      <div className="absolute -bottom-[10%] right-[30%] w-[100px] h-[500px] rotate-[-35deg] bg-gradient-to-t from-secondary/20 via-secondary/5 to-transparent blur-2xl -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Main heading with animated underline */}
        <div className="mb-6 relative">
          <div className="absolute -inset-8 rounded-full bg-primary/5 blur-3xl"></div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-foreground relative tracking-tight">
            <span className="inline-block">{t('hero.title')}</span>
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-2"></div>
        </div>
        
        {/* Tagline with improved typography */}
        <p className="text-2xl md:text-3xl mb-4 max-w-3xl text-foreground/90 leading-relaxed font-light">
          {t('hero.tagline')}
        </p>
        
        <p className="text-lg md:text-xl mb-5 max-w-2xl text-muted-foreground italic">
          {t('hero.description')}
        </p>
        
        <p className="text-lg md:text-xl mb-8 font-medium text-primary/90">
          {t('hero.motto')}
        </p>
        
        {/* CTA buttons with enhanced hover effects */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <Link 
            href="/user/stories" 
            className="btn-primary inline-flex items-center gap-2 group"
          >
            {t('hero.storeStory')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          
          <a 
            href="/about" 
            className="relative overflow-hidden px-8 py-4 rounded-xl font-medium border-2 border-primary/30 hover:border-primary transition-all duration-300 group"
          >
            <span className="relative z-10 flex items-center space-x-2 text-foreground group-hover:text-primary transition-colors duration-300">
              <span>{t('hero.learnMore')}</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
      
      {/* Millennium Vault Section */}
      <section className="pt-24 pb-20 relative overflow-hidden">
            {/* Enhanced background decorations */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slower"></div>
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-tr from-primary/5 to-secondary/5 rounded-full blur-3xl -z-10 animate-float-slow"></div>
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5 -z-10" 
                 style={{
                   backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                   backgroundSize: '30px 30px'
                 }}>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                {vault ? (
                  <h2 className="text-4xl md:text-4xl font-bold relative inline-block">{t('vault.presentingVault', { vaultName: vault.name })}</h2>
                ) : (
                  <h2 className="text-4xl md:text-4xl font-bold relative inline-block">{t('vault.title')}</h2>
                )}
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
                {vault && (
                  <p className="mt-4 text-xl text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {t('vault.storyCollectionPeriod')} {' '}
                      <span className="font-medium">
                        {new Date(vault.startsAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span> - 
                      <span className="font-medium">
                        {new Date(vault.endsAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </span>
                  </p>
                )}
              </div>
      
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -left-16 top-1/4 w-32 h-32 rounded-full bg-primary/5 blur-xl -z-10"></div>
                <div className="absolute -right-16 bottom-1/4 w-32 h-32 rounded-full bg-secondary/5 blur-xl -z-10"></div>
                
                {/* Content with enhanced styling */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Small icon column */}
                    <div className="hidden md:flex md:col-span-2 justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-5 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-primary/70">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Text content */}
                    <div className="md:col-span-10">
                      <div className="prose max-w-none text-foreground/90">
                        <p className="text-lg mb-5 leading-relaxed">
                          {t('vault.paragraph1')}
                        </p>
                        
                        <p className="text-lg mb-5 leading-relaxed">
                          {t('vault.paragraph2')}
                        </p>
                        
                        <p className="text-lg mb-5 leading-relaxed">
                          {t('vault.paragraph3')}
                        </p>
                        
                        <p className="text-lg leading-relaxed">
                          {t('vault.paragraph4')}
                        </p>
                      </div>
                      
                      {/* CTA button */}
                      <div className="mt-8 flex justify-center md:justify-start">
                        <Link 
                          href="/user/stories" 
                          className="btn-primary inline-flex items-center gap-2 group"
                        >
                          {t('vault.preserveStory')}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
      
      {/* Public Stories Section */}
      <section className="pt-24 pb-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/5 to-transparent rounded-tr-full -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-4xl font-bold relative inline-block">{t('publicStories.title')}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <p className="mt-6 text-lg text-foreground/80 max-w-3xl mx-auto">
            {t('publicStories.description')}
          </p>
        </div>

        {publicStories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {publicStories.map((story: Story) => (
                <StoryCard
                  key={story.id}
                  id={story.id}
                  title={story.title}
                  excerpt={story.excerpt}
                  author={story.author}
                  date={story.date}
                  imageUrl={story.imageUrl}
                  likes={story.likes}
                  featured={story.featured}
                  showStatusBadge={false}
                />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link 
                href="/stories" 
                className="btn-secondary inline-flex items-center gap-2 group"
              >
                {t('publicStories.viewAll')}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">{t('publicStories.noStories.title')}</h3>
              <p className="text-lg text-foreground/80 mb-6 max-w-2xl mx-auto">
                {t('publicStories.noStories.description')}
              </p>
            </div>
            <Link 
              href="/user/stories" 
              className="btn-primary inline-flex items-center gap-2 group"
            >
              {t('publicStories.noStories.cta')}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
    </div>
  );
}
