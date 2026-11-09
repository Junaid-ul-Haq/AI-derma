import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <p className="text-6xl font-black text-blue-100 mb-4">404</p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for does not exist or has moved. You can still analyze your skin for free.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/analyze" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg">
          Analyze My Skin
        </Link>
        <Link href="/" className="border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50">
          Go to Home
        </Link>
      </div>
    </main>
  );
}
