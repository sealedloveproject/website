import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Get your domain from environment variables
  const domain = process.env.DOMAIN || 'sealed.love';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/user/', 
        '/admin/',
      ],
    },
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
