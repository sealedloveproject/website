import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateCanonicalUrl, shouldExcludeFromCanonical } from '@/lib/canonicalUrl';
import { getPublicStoryById } from '@/app/actions/public/stories';
import { Story, Attachment } from '@/types';
import SupportBlock from '@/components/SupportBlock';
import StoryHeader from './storyheader.client';
import MediaGallery from './mediagallery.client';
import StoryContent from './storycontent';
import StoryActions from './storyactions.client';
import { getTranslations } from 'next-intl/server';
import { generateStoryJsonLd } from '@/lib/jsonld';

// Extended story type with attachments for the story detail page
type StoryWithAttachments = Story & {
  attachments: Attachment[];
  createdAt?: string;
  updatedAt?: string;
  vault?: {
    id: string;
    name: string;
  };
};

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // Get translations
  const t = await getTranslations('Story');
  
  // Properly await the params object before accessing its properties
  const resolvedParams = await params;
  const storyId = resolvedParams.id;
  
  // Generate canonical URL path for the story
  const canonicalPath = `/stories/${storyId}`;
  
  try {
    const story = await getPublicStoryById(storyId);
    
    if (!story) {
      return {
        title: t('metadata.notFound.title'),
        description: t('metadata.notFound.description')
      };
    }
    
    // Get the cover image URL
    let coverImageUrl = '';
    
    // First check if there's a dedicated cover image in attachments
    if (story.attachments && story.attachments.length > 0) {
      const coverAttachment = story.attachments.find(attachment => 
        attachment.fileType?.startsWith('image/')
      );
      
      if (coverAttachment) {
        coverImageUrl = coverAttachment.fileUrl;
      }
    }
    
    // If no dedicated cover image found, use the story's imageUrl if available
    if (!coverImageUrl && story.imageUrl) {
      coverImageUrl = story.imageUrl;
    }
    
    // Fallback to default image if no cover image found
    if (!coverImageUrl) {
      coverImageUrl = `${process.env.DOMAIN}/images/og-stories.jpg`;
    }
    
    // Create a description from the content if excerpt is not available
    let description = story.excerpt;
    if (!description && story.content) {
      // Strip HTML tags and get first 160 characters
      description = story.content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ')   // Normalize whitespace
        .trim()
        .substring(0, 160);
      
      // Add ellipsis if content was truncated
      if (story.content.length > 160) {
        description += '...';
      }
    }
    
    // Use default description if still empty
    if (!description) {
      description = `Read this touching love story on Sealed Love Project`;
    }
    
    // Generate JSON-LD data for the story
    const jsonLd = generateStoryJsonLd(story);
    
    // Create base metadata
    const baseMetadata = {
      title: `${story.title} by ${story.author} | Sealed Love Project`,
      description,
      openGraph: {
        title: `${story.title} by ${story.author}`,
        description,
        images: [{ url: coverImageUrl, width: 1200, height: 630, alt: story.title }],
        type: 'article',
        publishedTime: story.createdAt,
        modifiedTime: story.updatedAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${story.title} by ${story.author}`,
        description,
        images: [coverImageUrl],
      },
    };
    
    // Add canonical URL if this path should not be excluded
    if (!shouldExcludeFromCanonical(canonicalPath)) {
      return {
        ...baseMetadata,
        alternates: {
          canonical: generateCanonicalUrl(canonicalPath),
        },
      };
    }
    
    return baseMetadata;
  } catch (error) {
    //console.error('Error generating metadata:', error);
    return {
      title: 'Love Story | Sealed Love Project',
      description: 'Read touching love stories on Sealed Love Project',
    };
  }
}

// JSON-LD will be injected directly in the component using a Script tag

export default async function StoryPage(props: { params: Promise<{ id: string }> }) {
  // Get translations
  const t = await getTranslations('Story');
  
  const params = await props.params;
  const storyId = params.id;
  
  // Fetch story data from the database
  let story: StoryWithAttachments | null = null;
  let error: string | null = null;
  
  try {
    story = await getPublicStoryById(storyId);
    
    if (!story) {
      notFound();
    }
  } catch (err) {
    //console.error('Error fetching story:', err);
    error = 'Failed to load story';
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6 text-red-600">{error}</h1>
          <p className="mb-8">{t('notFound.description')}</p>
          <Link href="/stories" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            {t('notFound.button')}
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="w-full mx-auto">
        {/* Replication notification */}
        {story!.hashReplicatingAttachment && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {t('attachments.processing')}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Story header */}
        <StoryHeader 
          story={story!} 
          storyId={storyId}
        />
        
        {/* Media Gallery */}
        <MediaGallery 
          story={story!} 
          storyId={storyId} 
        />
        
        {/* Story content */}
        <StoryContent content={story!.content} />
        
        {/* Support/Donation section */}
        <div className="mt-16 mb-16">
          <SupportBlock 
            title={t('support.title')}
            description={t('support.description')}
            buttonText={t('support.button')}
          />
        </div>
        
        {/* Social sharing and additional actions */}
        <StoryActions 
          story={story!}
          storyId={storyId}
        />
      </div>
    </div>
  );
}
