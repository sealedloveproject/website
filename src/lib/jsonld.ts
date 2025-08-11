import { Attachment, Story } from '@/types';

/**
 * Generate JSON-LD structured data for the homepage
 * @returns Homepage JSON-LD structured data
 */
export function generateHomePageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sealed Love Project',
    alternateName: 'SealedLove',
    description: 'Create, preserve, and share your love stories for generations to come.',
    url: `https://${process.env.DOMAIN}/`,
    potentialAction: {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `https://${process.env.DOMAIN}/stories?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sealed Love Project',
      logo: {
        '@type': 'ImageObject',
        url: `https://${process.env.DOMAIN}/images/logo.png`,
      },
      sameAs: [
        'https://twitter.com/sealedloveproj',
        'https://instagram.com/sealedloveproject',
        'https://github.com/sealedlove'
      ]
    }
  };
}

/**
 * Generate JSON-LD structured data for a story page
 * @param story The story data
 * @returns Story JSON-LD structured data
 */
export function generateStoryJsonLd(story: Story & { 
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string; 
}) {
  // Find cover image URL
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

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://${process.env.DOMAIN}/stories/${story.id}`
    },
    headline: story.title,
    description: description,
    image: coverImageUrl,
    author: {
      '@type': 'Person',
      name: story.author || 'Anonymous'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sealed Love Project',
      logo: {
        '@type': 'ImageObject',
        url: `https://${process.env.DOMAIN}/images/logo.png`,
      },
      sameAs: [
        'https://twitter.com/sealedloveproj',
        'https://instagram.com/sealedloveproject',
        'https://github.com/sealedlove'
      ]
    },
    datePublished: story.createdAt || story.date,
    dateModified: story.updatedAt || story.date
  };
}
