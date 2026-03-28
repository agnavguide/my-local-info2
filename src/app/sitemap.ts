import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const BASE_URL = 'https://my-local-info2.pages.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const postsDir = path.join(process.cwd(), 'src/content/posts');

  // 블로그 글 URL 자동 수집
  const slugs = fs.existsSync(postsDir)
    ? fs.readdirSync(postsDir)
        .filter((file) => file.endsWith('.md'))
        .map((file) => file.replace(/\.md$/, ''))
    : [];

  const blogPostEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogPostEntries,
  ];
}
