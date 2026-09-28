import type { MetadataRoute } from 'next';
import { portfolio } from '@/content/portfolio';
import { siteUrl } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: 'monthly', priority: 1 },
    ...portfolio.projects.map((p) => ({ url: `${base}/work/${p.id}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
