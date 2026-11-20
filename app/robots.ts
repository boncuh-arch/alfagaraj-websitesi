import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/yonetim', '/api/'],
    },
    sitemap: 'https://alfagaraj-websitesi.vercel.app/sitemap.xml',
  };
}
