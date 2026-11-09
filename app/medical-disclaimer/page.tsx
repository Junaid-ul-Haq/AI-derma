import type { Metadata } from 'next';
import ContentPage from '../../components/ContentPage';
import { siteConfig, pageMetadata } from '../../lib/site';

const title = 'Medical Disclaimer';
const description = `${siteConfig.name} AI skin reports are for information and awareness only and are not a substitute for professional medical diagnosis or treatment.`;

export const metadata: Metadata = pageMetadata({ title, description, path: '/medical-disclaimer' });

export default function MedicalDisclaimerPage() {
  return (
    <ContentPage title={title} intro={description} path="/medical-disclaimer" updated="2026-10-06">
      <section>
        <h2>Information only</h2>
        <p>
          The AI analysis, reports and condition pages on {siteConfig.name} are provided for general information and
          awareness. They are not medical advice, a diagnosis, or a treatment recommendation.
        </p>
      </section>
      <section>
        <h2>AI can be wrong</h2>
        <p>
          The model recognises only 21 skin conditions plus healthy skin, and in testing its top answer was correct about
          38% of the time. It cannot detect every skin disease, and its results may be incorrect — particularly with
          blurry, dark or distant photos, unusual skin tones or conditions it was not trained on. A low-risk or
          &quot;no disease recognised&quot; result does not mean your skin is healthy.
        </p>
      </section>
      <section>
        <h2>Always see a professional</h2>
        <ul>
          <li>Consult a qualified dermatologist or doctor about any skin concern.</li>
          <li>Seek medical attention promptly for a spot that is new, changing, bleeding, itching or painful.</li>
          <li>Never delay or ignore professional advice because of an AI result.</li>
        </ul>
      </section>
      <section>
        <h2>Emergencies</h2>
        <p>If you think you have a medical emergency, contact your local emergency services immediately.</p>
      </section>
    </ContentPage>
  );
}
