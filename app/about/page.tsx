import type { Metadata } from 'next';
import Link from 'next/link';
import ContentPage from '../../components/ContentPage';
import { siteConfig, pageMetadata } from '../../lib/site';

const title = `About ${siteConfig.name}`;
const description = `${siteConfig.name} is a free AI skin disease detection platform that turns a single skin photo into an instant, downloadable skin health report.`;

export const metadata: Metadata = pageMetadata({ title, description, path: '/about' });

export default function AboutPage() {
  return (
    <ContentPage title={title} intro={description} path="/about">
      <section>
        <h2>Our mission</h2>
        <p>
          Millions of people live far from a dermatologist or put off getting a worrying spot checked. {siteConfig.name}{' '}
          gives anyone with a phone or computer an instant, free first opinion on a skin concern — and a clear report they
          can take to a doctor. Earlier awareness means earlier treatment, especially for skin cancers like melanoma.
        </p>
      </section>

      <section>
        <h2>What we do</h2>
        <ul>
          <li>Analyse a skin photo from your gallery or your camera in seconds</li>
          <li>Classify it across 21 skin conditions — from acne, eczema and psoriasis to skin cancer — or recognise healthy skin</li>
          <li>Generate a skin health report with a confidence score, risk level and next steps</li>
          <li>Let you download or print the report to share with a dermatologist</li>
        </ul>
      </section>

      <section>
        <h2>The technology</h2>
        <p>
          Our analyzer uses a VGG19 convolutional neural network fine-tuned on 15,444 clinical skin photos covering 22
          categories (21 skin conditions plus healthy skin). In testing on photos it had never seen, its top answer was
          correct about 38% of the time, which is why every report also lists the next most likely conditions — treat
          results as a first indication. The model runs on our own AI server; your image is processed in memory and is
          never stored.
        </p>
      </section>

      <section>
        <h2>Privacy first</h2>
        <p>
          There are no accounts and no database. We do not keep your photos, symptoms or reports. Read our{' '}
          <Link href="/privacy">privacy policy</Link> for details.
        </p>
      </section>

      <section>
        <h2>Important limitations</h2>
        <p>
          {siteConfig.name} is an awareness and screening tool, not a doctor. Results can be wrong, especially with blurry
          or poorly lit photos. Always see a qualified dermatologist for a diagnosis — see our{' '}
          <Link href="/medical-disclaimer">medical disclaimer</Link>.
        </p>
      </section>

      {siteConfig.contactEmail && (
        <section>
          <h2>Contact</h2>
          <p>
            Questions or feedback? Email us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      )}

      <p>
        <Link href="/analyze" className="!no-underline inline-block bg-gradient-to-r from-blue-600 to-purple-600 !text-white font-semibold px-6 py-3 rounded-lg">
          Try the free AI skin analyzer
        </Link>
      </p>
    </ContentPage>
  );
}
