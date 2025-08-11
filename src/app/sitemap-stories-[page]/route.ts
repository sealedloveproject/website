import { MetadataRoute } from 'next';
import { getPublicStories } from '@/app/actions/public/stories';
import { Story } from '@/types';

// Number of stories per sitemap file page
const STORIES_PER_SITEMAP_PAGE = 5000;

export async function generateStaticParams() {
  try {
    // Get total count of stories
    const firstBatch = await getPublicStories(1, 1);
    const totalStories = firstBatch.totalCount;
    const totalPages = Math.ceil(totalStories / STORIES_PER_SITEMAP_PAGE);
    
    // Generate pages array [1, 2, 3, ...totalPages]
    return Array.from({ length: totalPages }, (_, i) => ({
      page: String(i + 1),
    }));
  } catch (error) {
    console.error('Error generating sitemap page params:', error);
    return [{ page: '1' }];
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { page: string } }
) {
  const domain = process.env.DOMAIN || 'sealed.love';
  const baseUrl = `https://${domain}`;
  
  const page = parseInt(params.page, 10) || 1;
  const storiesPerPage = STORIES_PER_SITEMAP_PAGE;
  
  try {
    // Calculate how many API pages we need to fetch
    // Our API pagination (getPublicStories) uses a different page size than our sitemap pagination
    const apiPageSize = 100; // The page size used by getPublicStories
    const startApiPage = Math.floor(((page - 1) * storiesPerPage) / apiPageSize) + 1;
    const endApiPage = Math.ceil((page * storiesPerPage) / apiPageSize);
    
    let allStories: Story[] = [];
    
    // Fetch all required API pages
    for (let apiPage = startApiPage; apiPage <= endApiPage; apiPage++) {
      const result = await getPublicStories(apiPage, apiPageSize);
      allStories = [...allStories, ...result.stories];
      
      // If no more stories, break early
      if (!result.hasMore) break;
    }
    
    // Calculate start and end indices for this sitemap page
    const startIdx = ((page - 1) * storiesPerPage) % apiPageSize;
    const endIdx = Math.min(startIdx + storiesPerPage, allStories.length);
    
    // Get stories for just this sitemap page
    const pageStories = allStories.slice(startIdx, endIdx);
    
    // Map stories to sitemap entries
    const sitemap: MetadataRoute.Sitemap = pageStories.map((story) => ({
      url: `${baseUrl}/stories/${story.id}`,
      lastModified: new Date(story.updatedAt || story.date || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
    
    // Return sitemap XML
    return new Response(JSON.stringify(sitemap), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error(`Error generating sitemap-stories-${page}:`, error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
