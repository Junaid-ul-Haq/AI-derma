import Link from 'next/link';
import { siteConfig } from '../lib/site';
import { CONDITIONS } from '../lib/conditions';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-xl font-bold mb-4">{siteConfig.name}</p>
            <p className="text-gray-400">
              Free AI skin disease detection. Upload or take a photo of your skin and get an instant skin
              health report.
            </p>
            {siteConfig.contactEmail && (
              <p className="mt-4 text-gray-400">
                Email:{' '}
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-white transition-colors">
                  {siteConfig.contactEmail}
                </a>
              </p>
            )}
          </div>

          <nav aria-label="Quick links">
            <p className="text-lg font-semibold mb-4">Quick Links</p>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/analyze" className="text-gray-400 hover:text-white transition-colors">Analyze Your Skin</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </nav>

          <nav aria-label="Skin conditions">
            <p className="text-lg font-semibold mb-4">Skin Conditions</p>
            <ul className="space-y-2">
              {CONDITIONS.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link href={`/conditions/${c.slug}`} className="text-gray-400 hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/conditions" className="text-gray-300 hover:text-white transition-colors font-medium">
                  View all conditions →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="text-lg font-semibold mb-4">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/medical-disclaimer" className="text-gray-400 hover:text-white transition-colors">Medical Disclaimer</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. AI results are for
            information only and are not a medical diagnosis.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
