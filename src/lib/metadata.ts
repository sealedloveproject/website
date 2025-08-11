import { Metadata } from 'next';
import { generateCanonicalUrl, shouldExcludeFromCanonical } from './canonicalUrl';

/**
 * Generate metadata with canonical URL for public pages
 * 
 * @param path - The current page path
 * @param metadata - Base metadata object to extend
 * @returns Extended metadata with canonical URL (if applicable)
 */
export function createMetadata(path: string, metadata: Metadata = {}): Metadata {
  // Don't add canonical URLs to excluded paths (user, admin)
  if (shouldExcludeFromCanonical(path)) {
    return metadata;
  }
  
  // Generate canonical URL
  const canonicalUrl = generateCanonicalUrl(path);
  
  // Return metadata with canonical URL
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: canonicalUrl,
    },
  };
}
