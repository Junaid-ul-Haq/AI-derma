import Link from 'next/link';
import { siteConfig } from '../lib/site';

export const FAQS: { q: string; a: string }[] = [
  {
    q: `Is ${siteConfig.name} free to use?`,
    a: `Yes. ${siteConfig.name} is completely free. You do not need to create an account or sign up — just open the analyzer, add a photo and get your skin health report.`,
  },
  {
    q: 'Can I take a photo with my camera or do I need to upload one?',
    a: 'You can do either. On the analyze page choose "Choose from Gallery" to pick an existing photo, or "Take a Photo" to use your phone or laptop camera directly in the browser. Front and back cameras are supported.',
  },
  {
    q: 'Which skin conditions can the AI detect?',
    a: 'The AI model recognises 21 skin conditions — skin cancer, acne, eczema, psoriasis, moles, tinea (ringworm), warts, rosacea, vitiligo, actinic keratosis, sun damage, seborrheic keratosis, benign skin tumours, vascular tumours, candidiasis, infestations and bites, lichen planus, lupus, bullous disease, drug eruptions and vasculitis — and can also recognise healthy skin.',
  },
  {
    q: 'What is included in the AI skin health report?',
    a: 'Your report includes the most likely condition, the top 3 possibilities with AI confidence scores, a risk level, a short explanation of the condition, common signs, recommended next steps, any symptoms you added, a report ID and date. You can download it as a PDF or print it.',
  },
  {
    q: 'Are my skin photos stored?',
    a: 'No. Your photo is sent securely to our AI model, analysed in memory and discarded. We have no user accounts and no database, so nothing about you or your skin is saved.',
  },
  {
    q: 'How accurate is the AI skin analysis?',
    a: "In testing on photos it had never seen, the model's top answer was correct about 38% of the time, and it is much better at some conditions (such as vitiligo, warts and healthy skin) than others. That is why every report shows the top 3 possibilities with confidence scores. The AI is an awareness tool — only a doctor can confirm a diagnosis.",
  },
  {
    q: 'Is the AI result a medical diagnosis?',
    a: 'No. The report is for information and awareness only and does not replace an examination by a qualified dermatologist. If a spot is new, changing, bleeding or worrying you, please see a doctor.',
  },
  {
    q: 'How do I take a good photo of my skin?',
    a: 'Use natural daylight, hold the camera 10–15 cm from the skin, keep it steady and in focus, and make the spot fill most of the frame. Remove make-up or creams from the area first.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 id="faq-heading" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">Everything you need to know about our AI skin analysis and reports.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-gray-200 bg-gray-50 open:bg-white open:shadow-md transition-all">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-gray-800">
                <h3 className="text-base md:text-lg">{f.q}</h3>
                <span className="flex-shrink-0 text-blue-600 text-xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="px-5 pb-5 text-gray-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="text-center mt-10 text-gray-600">
          Ready to try it?{' '}
          <Link href="/analyze" className="text-blue-600 font-semibold hover:underline">
            Analyze your skin for free →
          </Link>
        </p>
      </div>
    </section>
  );
}
