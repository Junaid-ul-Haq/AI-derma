import type { Metadata } from 'next';
import Link from 'next/link';
import SkinAnalyzer from '../../components/analyzer/SkinAnalyzer';
import JsonLd from '../../components/JsonLd';
import { CONDITIONS, SEVERITY_INFO } from '../../lib/conditions';
import { siteConfig, absoluteUrl, pageMetadata } from '../../lib/site';

const title = 'Free AI Skin Analysis — Upload or Take a Photo';
const description =
  'Analyze a skin rash, spot or mole in seconds. Choose a photo from your gallery or take one with your camera and get a free AI skin health report you can download as PDF. No sign-up needed.';

export const metadata: Metadata = pageMetadata({ title, description, path: '/analyze' });

const PHOTO_TIPS = [
  'Use natural daylight or a bright room — avoid flash glare.',
  'Hold the camera 10–15 cm from the skin and keep it steady.',
  'Make the spot fill most of the frame and keep it in focus.',
  'Remove make-up, creams or hair covering the area.',
];

export default function AnalyzePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${siteConfig.name} AI Skin Analyzer`,
      url: absoluteUrl('/analyze'),
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires a modern browser with JavaScript enabled',
      description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Upload a skin photo from your gallery',
        'Take a skin photo with your phone or laptop camera',
        'AI classification across 21 skin conditions plus healthy skin',
        'Top 3 most likely conditions with confidence scores',
        'Downloadable AI skin health report (PDF)',
      ],
      publisher: { '@id': absoluteUrl('/#organization') },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to get an AI skin health report',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Add a photo', text: 'Choose a photo from your gallery or take one with your camera.' },
        { '@type': 'HowToStep', position: 2, name: 'Add details', text: 'Optionally add the body area, duration and symptoms.' },
        { '@type': 'HowToStep', position: 3, name: 'Get your report', text: 'The AI analyses the image and generates a report you can download or print.' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Analyze Skin', item: absoluteUrl('/analyze') },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <JsonLd data={jsonLd} />

      <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto px-4 pt-6 text-sm text-gray-500">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-700">Analyze Skin</li>
        </ol>
      </nav>

      <section className="pt-8 pb-8 px-4 text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-widest">
          Free · No sign-up · Instant report
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          AI Skin Analysis &amp;{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Health Report</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
          Choose a photo from your <strong>gallery</strong> or <strong>take a photo</strong> with your camera. Our
          deep-learning model checks it against <strong>21 common skin conditions</strong> — from acne and eczema to skin
          cancer — and generates a skin health report you can download or share with your doctor.
        </p>
      </section>

      <section aria-labelledby="scanner-heading" className="max-w-3xl mx-auto px-4 pb-14">
        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-5 md:p-10">
          <h2 id="scanner-heading" className="sr-only">Skin analysis scanner</h2>
          <SkinAnalyzer />
        </div>
      </section>

      <section aria-labelledby="tips-heading" className="max-w-3xl mx-auto px-4 pb-14">
        <h2 id="tips-heading" className="text-xl font-bold text-gray-800 mb-4 text-center">
          Tips for an Accurate Skin Photo
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {PHOTO_TIPS.map((tip, i) => (
            <li key={tip} className="flex gap-3 rounded-xl bg-white border border-gray-100 shadow-sm p-4 text-sm text-gray-600">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="conditions-heading" className="max-w-3xl mx-auto px-4 pb-14">
        <h2 id="conditions-heading" className="text-xl font-bold text-gray-800 mb-5 text-center">
          Skin Conditions the AI Can Detect
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CONDITIONS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/conditions/${c.slug}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:border-blue-300 hover:shadow transition-all"
              >
                <span className="text-sm font-medium text-gray-700">{c.name}</span>
                <span className={`ml-2 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_INFO[c.severity].badge}`}>
                  {c.severity === 'high' ? 'Serious' : c.severity === 'medium' ? 'Doctor' : 'Low'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <aside className="rounded-2xl border border-yellow-200 bg-yellow-50 px-6 py-5">
          <p className="text-sm font-semibold text-yellow-800 mb-1">Important medical disclaimer</p>
          <p className="text-xs text-yellow-700 leading-relaxed">
            {siteConfig.name} provides AI analysis for <strong>education and awareness only</strong>. It is not a
            substitute for professional medical advice, diagnosis or treatment. Always consult a qualified dermatologist.
            Read our full <Link href="/medical-disclaimer" className="underline">medical disclaimer</Link>.
          </p>
        </aside>
      </section>
    </main>
  );
}
