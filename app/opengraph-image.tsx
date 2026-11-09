import { ImageResponse } from 'next/og';
import { siteConfig } from '../lib/site';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Default social-share image for every page (Facebook, LinkedIn, X, WhatsApp…)
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, opacity: 0.9 }}>{siteConfig.name}</div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginTop: 24 }}>
          AI Skin Disease Detection &amp; Instant Skin Health Reports
        </div>
        <div style={{ display: 'flex', fontSize: 32, marginTop: 32, opacity: 0.9 }}>
          Upload or snap a photo · 21 skin conditions · Free PDF report
        </div>
      </div>
    ),
    size,
  );
}
