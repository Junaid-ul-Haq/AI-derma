import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '../components/Hero';
import WhyImportant from '../components/WhyImportant';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import AIReport from '../components/AIReport';
import TrustSafety from '../components/TrustSafety';
import FAQ, { faqJsonLd } from '../components/FAQ';
import JsonLd from '../components/JsonLd';
import { CONDITIONS, SEVERITY_INFO } from '../lib/conditions';
import { siteConfig, absoluteUrl, pageMetadata } from '../lib/site';

export const metadata: Metadata = {
  ...pageMetadata({ title: `${siteConfig.name} — ${siteConfig.tagline}`, description: siteConfig.description, path: '/' }),
  // absolute so the root title template is not applied twice
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}` },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: `${siteConfig.name} — ${siteConfig.tagline}`,
  url: absoluteUrl('/'),
  description: siteConfig.description,
  inLanguage: 'en',
  isPartOf: { '@id': absoluteUrl('/#website') },
  about: CONDITIONS.map((c) => ({ '@type': 'MedicalCondition', name: c.name, url: absoluteUrl(`/conditions/${c.slug}`) })),
  audience: { '@type': 'PeopleAudience', audienceType: 'Patient' },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <JsonLd data={[homeJsonLd, faqJsonLd]} />
      <Hero />
      <WhyImportant />
      <div id="how-it-works"><HowItWorks /></div>
      <div id="features"><Features /></div>
      <AIReport />

      {/* Conditions overview — internal links to every condition page */}
      <section aria-labelledby="conditions-heading" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 id="conditions-heading" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              21 Skin Conditions Our AI Detects
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From acne, eczema and ringworm to lupus and skin cancer — learn the signs of each condition.
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONDITIONS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/conditions/${c.slug}`}
                  className="block h-full rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_INFO[c.severity].badge}`}>
                      {SEVERITY_INFO[c.severity].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.summary}</p>
                  <span className="inline-block mt-3 text-sm font-medium text-blue-600">Learn more →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div id="about"><TrustSafety /></div>
      <FAQ />

      {/* Final CTA */}
      <section aria-labelledby="cta-heading" className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-4">Check Your Skin in Under a Minute</h2>
          <p className="text-lg text-blue-100 mb-8">
            Upload a photo from your gallery or take one with your camera and get your free AI skin health report.
          </p>
          <Link
            href="/analyze"
            className="inline-block bg-white text-blue-700 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
          >
            Analyze My Skin — Free
          </Link>
        </div>
      </section>
    </main>
  );
}
