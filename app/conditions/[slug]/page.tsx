import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { CONDITIONS, SEVERITY_INFO, getConditionBySlug } from '../../../lib/conditions';
import { siteConfig, absoluteUrl, pageMetadata } from '../../../lib/site';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CONDITIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getConditionBySlug(slug);
  if (!c) return {};
  const title = `${c.name}: Signs, Risk Factors & AI Skin Check`;
  const description = `${c.summary} Learn the signs of ${c.name.toLowerCase()} and check a skin spot with our free AI skin analyzer.`;
  return pageMetadata({
    title,
    description,
    path: `/conditions/${c.slug}`,
    type: 'article',
    keywords: [c.name, ...(c.alsoKnownAs ?? []), `${c.name} symptoms`, `${c.name} signs`, 'AI skin check'],
  });
}

export default async function ConditionPage({ params }: Props) {
  const { slug } = await params;
  const c = getConditionBySlug(slug);
  if (!c) notFound();

  const severity = SEVERITY_INFO[c.severity];
  const related = CONDITIONS.filter((o) => o.slug !== c.slug && o.severity === c.severity).slice(0, 3);
  const url = absoluteUrl(`/conditions/${c.slug}`);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: `${c.name}: Signs, Risk Factors & AI Skin Check`,
      url,
      description: c.summary,
      inLanguage: 'en',
      isPartOf: { '@id': absoluteUrl('/#website') },
      lastReviewed: '2026-10-01',
      mainEntity: {
        '@type': 'MedicalCondition',
        name: c.name,
        alternateName: c.alsoKnownAs,
        description: c.description,
        associatedAnatomy: { '@type': 'AnatomicalStructure', name: 'Skin' },
        signOrSymptom: c.signs.map((s) => ({ '@type': 'MedicalSignOrSymptom', name: s })),
        riskFactor: c.riskFactors.map((r) => ({ '@type': 'MedicalRiskFactor', name: r })),
        possibleTreatment: { '@type': 'MedicalTherapy', name: 'Assessment and treatment by a dermatologist' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Skin Conditions', item: absoluteUrl('/conditions') },
        { '@type': 'ListItem', position: 3, name: c.name, item: url },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <JsonLd data={jsonLd} />
      <article className="max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <ol className="flex flex-wrap gap-2">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/conditions" className="hover:text-blue-600">Skin Conditions</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gray-700">{c.name}</li>
          </ol>
        </nav>

        <header className="mb-8">
          <span className={`inline-block mb-3 text-xs font-semibold px-3 py-1 rounded-full ${severity.badge}`}>
            {severity.label}{c.isCancerous ? ' · Skin cancer' : ''}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{c.name}</h1>
          {c.alsoKnownAs && <p className="text-gray-500 mb-4">Also known as: {c.alsoKnownAs.join(', ')}</p>}
          <p className="text-xl text-gray-700 leading-relaxed">{c.summary}</p>
        </header>

        <section aria-labelledby="what-is" className="mb-8">
          <h2 id="what-is" className="text-2xl font-bold text-gray-800 mb-3">What is {c.name.toLowerCase()}?</h2>
          <p className="text-gray-600 leading-relaxed">{c.description}</p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <section aria-labelledby="signs" className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 id="signs" className="text-xl font-bold text-gray-800 mb-3">Signs &amp; symptoms</h2>
            <ul className="space-y-2 text-gray-600">
              {c.signs.map((s) => <li key={s} className="flex gap-2"><span className="text-blue-500">•</span>{s}</li>)}
            </ul>
          </section>
          <section aria-labelledby="risk" className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 id="risk" className="text-xl font-bold text-gray-800 mb-3">Risk factors</h2>
            <ul className="space-y-2 text-gray-600">
              {c.riskFactors.map((r) => <li key={r} className="flex gap-2"><span className="text-purple-500">•</span>{r}</li>)}
            </ul>
          </section>
        </div>

        <section aria-labelledby="next" className={`rounded-2xl border-2 p-6 mb-10 ${severity.card}`}>
          <h2 id="next" className="text-xl font-bold text-gray-800 mb-2">What should you do next?</h2>
          <p className={`font-medium mb-3 ${severity.text}`}>{severity.advice}</p>
          <ul className="space-y-2 text-gray-700">
            {c.nextSteps.map((s) => <li key={s} className="flex gap-2"><span className="text-green-600">✓</span>{s}</li>)}
          </ul>
        </section>

        <aside className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Check a skin spot with AI</h2>
          <p className="text-blue-100 mb-6">
            Upload or take a photo and {siteConfig.name} will check it for {c.name.toLowerCase()} and {CONDITIONS.length - 1} other conditions.
          </p>
          <Link href="/analyze" className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Start Free Skin Analysis
          </Link>
        </aside>

        {related.length > 0 && (
          <section aria-labelledby="related" className="mb-10">
            <h2 id="related" className="text-xl font-bold text-gray-800 mb-4">Related skin conditions</h2>
            <ul className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/conditions/${r.slug}`} className="block rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:border-blue-300 transition-colors">
                    <span className="font-semibold text-gray-800">{r.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-xs text-gray-500 leading-relaxed">
          This page is for general information only and is not medical advice. Always consult a qualified dermatologist
          about any skin concern. See our <Link href="/medical-disclaimer" className="underline">medical disclaimer</Link>.
        </p>
      </article>
    </main>
  );
}
