import type { Metadata } from 'next';
import Link from 'next/link';
import ContentPage from '../../components/ContentPage';
import { siteConfig, pageMetadata } from '../../lib/site';

const title = 'Terms of Service';
const description = `The terms that apply when you use the free ${siteConfig.name} AI skin analysis service.`;

export const metadata: Metadata = pageMetadata({ title, description, path: '/terms' });

export default function TermsPage() {
  return (
    <ContentPage title={title} intro={description} path="/terms" updated="2026-10-06">
      <section>
        <h2>Use of the service</h2>
        <p>
          {siteConfig.name} provides a free AI skin image analysis tool for information and awareness. By using it, you
          agree to these terms. You may use the service for personal, non-commercial purposes.
        </p>
      </section>
      <section>
        <h2>Not medical advice</h2>
        <p>
          Results and reports are generated automatically by an AI model and are not a medical diagnosis. They must not
          replace an examination by a qualified healthcare professional. See our{' '}
          <Link href="/medical-disclaimer">medical disclaimer</Link>.
        </p>
      </section>
      <section>
        <h2>Your content</h2>
        <ul>
          <li>Only upload photos you have the right to use.</li>
          <li>Do not upload images that identify other people without their consent.</li>
          <li>Do not attempt to misuse, overload or reverse-engineer the service.</li>
        </ul>
      </section>
      <section>
        <h2>No warranty</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that results are
          accurate, complete or available at all times.
        </p>
      </section>
      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.name} is not liable for any decision made or action taken
          based on the AI results or reports.
        </p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>We may update these terms from time to time. Continued use of the service means you accept the updated terms.</p>
      </section>
    </ContentPage>
  );
}
