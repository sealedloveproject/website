import { MetadataRoute } from 'next';
import { getPublicStories } from '@/app/actions/public/stories';

// Maximum number of URLs per sitemap file (Google's limit is 50,000, but we'll be conservative)
const MAX_URLS_PER_SITEMAP = 45000;

// This is the main sitemap index file that will reference all other sitemaps
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get your domain from environment variables
  const domain = process.env.DOMAIN || 'sealed.love';
  const baseUrl = `https://${domain}`;
  
  // Define static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  try {
    // Get the first batch of stories with count to determine total pages
    const firstBatch = await getPublicStories(1, 100);
    const totalStories = firstBatch.totalCount;
    
    // If we have fewer stories than MAX_URLS_PER_SITEMAP, include them directly
    if (totalStories <= MAX_URLS_PER_SITEMAP - routes.length) {
      // Calculate how many pages we need to fetch to get all stories
      const totalPages = Math.ceil(totalStories / 100);
      let allStories = [...firstBatch.stories];
      
      // Fetch all remaining pages
      for (let page = 2; page <= totalPages; page++) {
        const batch = await getPublicStories(page, 100);
        allStories = [...allStories, ...batch.stories];
      }
      
      // Map stories to sitemap entries
      const storyRoutes = allStories.map((story) => ({
        url: `${baseUrl}/stories/${story.id}`,
        lastModified: new Date(story.updatedAt || story.date || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      
      // Return all routes in a single sitemap
      return [...routes, ...storyRoutes];
    } 
    // Otherwise, we'll need to create multiple sitemap files
    else {
      // For the main sitemap.xml, we'll return just the static routes
      // The dynamic story routes will be handled by sitemap-stories-[index].xml files
      return routes;
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error);
    return routes;
  }
}
