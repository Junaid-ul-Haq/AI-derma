import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { CONDITIONS, SEVERITY_INFO } from '../../lib/conditions';
import { absoluteUrl, pageMetadata } from '../../lib/site';

const title = 'Skin Conditions Guide — Acne, Eczema, Psoriasis, Skin Cancer & More';
const description =
  'Learn the signs, risk factors and next steps for the 21 skin conditions our AI can detect, including acne, eczema, psoriasis, ringworm, vitiligo, warts and skin cancer.';

export const metadata: Metadata = pageMetadata({ title, description, path: '/conditions' });

export default function ConditionsPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: absoluteUrl('/conditions'),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: CONDITIONS.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: absoluteUrl(`/conditions/${c.slug}`),
          name: c.name,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Skin Conditions', item: absoluteUrl('/conditions') },
      ],
    },
  ];

  const groups = [
    { heading: 'Serious Conditions — See a Dermatologist Soon', items: CONDITIONS.filter((c) => c.severity === 'high') },
    { heading: 'Common Conditions — See a Doctor for Treatment', items: CONDITIONS.filter((c) => c.severity === 'medium') },
    { heading: 'Usually Harmless Conditions', items: CONDITIONS.filter((c) => c.severity === 'low') },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <JsonLd data={jsonLd} />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gray-700">Skin Conditions</li>
          </ol>
        </nav>

        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Skin Conditions Our AI Can Detect</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our AI skin analyzer recognises 21 skin conditions. Learn what each condition looks like, who is at risk
            and when you should see a dermatologist.
          </p>
        </header>

        {groups.map((g) => (
          <section key={g.heading} className="mb-12" aria-label={g.heading}>
            <h2 className="text-2xl font-bold text-gray-800 mb-5">{g.heading}</h2>
            <ul className="grid sm:grid-cols-2 gap-5">
              {g.items.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/conditions/${c.slug}`}
                    className="block h-full rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_INFO[c.severity].badge}`}>
                        {SEVERITY_INFO[c.severity].label}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{c.summary}</p>
                    <span className="inline-block mt-3 text-sm font-medium text-blue-600">Signs, risks &amp; next steps →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Worried about a spot or mole?</h2>
          <p className="text-blue-100 mb-6">Upload or take a photo and get a free AI skin health report in seconds.</p>
          <Link href="/analyze" className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Analyze My Skin
          </Link>
        </div>
      </div>
    </main>
  );
}
