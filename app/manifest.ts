import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — AI Skin Analysis`,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: siteConfig.themeColor,
    categories: ['health', 'medical'],
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
