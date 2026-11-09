import Link from 'next/link';
import JsonLd from './JsonLd';
import { absoluteUrl } from '../lib/site';

interface ContentPageProps {
  title: string;
  intro: string;
  path: string;
  updated?: string;
  children: React.ReactNode;
}

// Shared layout for text pages (About, Privacy, Terms, Disclaimer)
export default function ContentPage({ title, intro, path, updated, children }: ContentPageProps) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: title, item: absoluteUrl(path) },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <JsonLd data={breadcrumb} />
      <article className="max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gray-700">{title}</li>
          </ol>
        </nav>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{intro}</p>
          {updated && <p className="mt-2 text-sm text-gray-400">Last updated: <time dateTime={updated}>{updated}</time></p>}
        </header>
        <div className="space-y-8 text-gray-700 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-blue-600 [&_a]:underline">
          {children}
        </div>
      </article>
    </main>
  );
}
