// Central site configuration — used by metadata, sitemap, robots, JSON-LD and UI.

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Skinova',
  url: rawUrl.replace(/\/+$/, ''),
  tagline: 'AI Skin Disease Detection & Instant Skin Health Reports',
  description:
    'Free AI skin disease detection. Upload a photo from your gallery or take one with your camera and get an instant AI skin health report covering 21 conditions, including acne, eczema, psoriasis, ringworm and skin cancer.',
  shortDescription:
    'Upload or snap a photo of your skin and get an instant, free AI-generated skin health report.',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  keywords: [
    'AI skin disease detection',
    'skin disease checker',
    'online skin analysis',
    'AI skin health report',
    'skin cancer detection AI',
    'skin rash identifier',
    'acne checker',
    'eczema vs psoriasis',
    'ringworm checker',
    'mole checker',
    'dermatology AI',
    'free skin scan',
    'skin condition identifier',
  ],
  locale: 'en_US',
  themeColor: '#2563eb',
} as const;

export function absoluteUrl(path = '/') {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}

const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — ${siteConfig.tagline}`,
};

// Per-page metadata with complete Open Graph + Twitter tags. Next.js replaces
// (does not merge) `openGraph`/`twitter` from the root layout, so every page
// must supply the shared fields itself.
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  keywords?: string[];
}) {
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
