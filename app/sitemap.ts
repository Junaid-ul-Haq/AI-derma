import type { MetadataRoute } from 'next';
import { CONDITIONS } from '../lib/conditions';
import { absoluteUrl } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/analyze'), lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/conditions'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/about'), lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: absoluteUrl('/medical-disclaimer'), lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/privacy'), lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/terms'), lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const conditionPages: MetadataRoute.Sitemap = CONDITIONS.map((c) => ({
    url: absoluteUrl(`/conditions/${c.slug}`),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...pages, ...conditionPages];
}
