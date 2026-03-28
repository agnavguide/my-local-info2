import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://my-local-info2.pages.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
