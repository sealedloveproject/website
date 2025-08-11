import { MetadataRoute } from 'next';
import { getPublicStories } from '@/app/actions/public/stories';

// Stories per sitemap page - must match the value in sitemap-stories-[page]/route.ts
const STORIES_PER_SITEMAP_PAGE = 5000;

export default async function sitemapIndex(): Promise<MetadataRoute.Sitemap> {
  const domain = process.env.DOMAIN || 'sealed.love';
  const baseUrl = `https://${domain}`;
  
  // Start with the main sitemap
  const sitemaps: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/sitemap.xml`,
      lastModified: new Date(),
    }
  ];

  try {
    // Get total count of stories to determine how many sitemap files we need
    const firstBatch = await getPublicStories(1, 1);
    const totalStories = firstBatch.totalCount;
    
    // If we have a large number of stories, create multiple sitemap files
    if (totalStories > 0) {
      const totalSitemapPages = Math.ceil(totalStories / STORIES_PER_SITEMAP_PAGE);
      
      // Add entries for each stories sitemap page
      for (let page = 1; page <= totalSitemapPages; page++) {
        sitemaps.push({
          url: `${baseUrl}/sitemap-stories-${page}`,
          lastModified: new Date(),
        });
      }
    }
    
    return sitemaps;
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return sitemaps;
  }
}
