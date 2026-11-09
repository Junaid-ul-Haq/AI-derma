import type { Metadata } from 'next';
import ContentPage from '../../components/ContentPage';
import { siteConfig, pageMetadata } from '../../lib/site';

const title = 'Privacy Policy';
const description = `How ${siteConfig.name} handles your skin photos: analysed in memory, never stored, no accounts and no database.`;

export const metadata: Metadata = pageMetadata({ title, description, path: '/privacy' });

export default function PrivacyPage() {
  return (
    <ContentPage title={title} intro={description} path="/privacy" updated="2026-10-06">
      <section>
        <h2>Information we do not collect</h2>
        <p>
          {siteConfig.name} has no user accounts and no database. We do not ask for your name, email address, phone number
          or any other personal details to use the skin analyzer.
        </p>
      </section>
      <section>
        <h2>Your skin photos</h2>
        <ul>
          <li>When you click &quot;Analyze&quot;, your photo is sent securely to our AI server.</li>
          <li>The image is processed in memory to produce a prediction and is then discarded.</li>
          <li>We do not save, share, sell or use your photos to train models.</li>
        </ul>
      </section>
      <section>
        <h2>Symptoms and notes</h2>
        <p>
          Any body area, symptoms or notes you add stay in your browser and only appear in your report. They are not sent
          to our servers.
        </p>
      </section>
      <section>
        <h2>Camera access</h2>
        <p>
          If you choose &quot;Take a Photo&quot;, your browser will ask for permission to use your camera. The camera is
          only used while the capture screen is open and is switched off as soon as you take the photo or go back.
        </p>
      </section>
      <section>
        <h2>Your reports</h2>
        <p>
          Reports are generated in your browser. If you download or print a report, that file is stored only on your
          device. Closing or refreshing the page clears the report.
        </p>
      </section>
      <section>
        <h2>Server logs</h2>
        <p>
          Like most websites, our hosting provider may keep standard technical logs (such as IP address and request time)
          for security and reliability. These logs never contain your images.
        </p>
      </section>
    </ContentPage>
  );
}
