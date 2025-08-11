/**
 * Utility functions for generating canonical URLs for pages
 */

/**
 * Generate a canonical URL for a page
 * @param path - The path to the page (e.g., /about, /stories/123)
 * @returns Full canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  // Remove trailing slash if present (except for root path)
  const normalizedPath = path === '/' ? path : path.replace(/\/$/, '');
  
  // Get domain from environment or use default
  const domain = process.env.DOMAIN || 'sealed.love';
  
  // Return full canonical URL
  return `https://${domain}${normalizedPath}`;
}

/**
 * Check if a path should be excluded from canonicalization
 * This excludes admin and user routes
 * 
 * @param path - The path to check
 * @returns boolean - True if the path should be excluded
 */
export function shouldExcludeFromCanonical(path: string): boolean {
  // Paths that start with /admin or /user should be excluded
  return path.startsWith('/admin') || path.startsWith('/user');
}
