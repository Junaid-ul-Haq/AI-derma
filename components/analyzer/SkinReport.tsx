'use client';

import Link from 'next/link';
import { MODEL_INFO, SEVERITY_INFO, modelClassLabel, type SkinCondition } from '../../lib/conditions';
import { siteConfig } from '../../lib/site';

export interface PatientDetails {
  bodyArea: string;
  duration: string;
  symptoms: string[];
  notes: string;
}

export interface TopPrediction {
  modelClass: string;
  confidence: number; // 0..1
  condition: SkinCondition | null;
}

export interface ReportData {
  id: string;
  createdAt: Date;
  imageUrl: string;
  source: 'gallery' | 'camera';
  predictedName: string;
  confidence: number; // 0..1
  condition: SkinCondition | null;
  isNormal: boolean;
  topPredictions: TopPrediction[];
  details: PatientDetails;
}

// With 22 classes, a top score below this means the AI is unsure
const LOW_CONFIDENCE = 0.4;

export default function SkinReport({ report, onNewScan }: { report: ReportData; onNewScan: () => void }) {
  const { condition, details } = report;
  const severity = condition ? SEVERITY_INFO[condition.severity] : null;
  const confidencePct = Math.round(report.confidence * 100);
  const otherPredictions = report.topPredictions.slice(1);
  const hasDetails = details.bodyArea || details.duration || details.symptoms.length > 0 || details.notes.trim();
  const accuracyPct = Math.round(MODEL_INFO.testAccuracy * 100);

  const cardClasses = report.isNormal
    ? 'border-blue-200 bg-blue-50'
    : severity
      ? severity.card
      : 'border-gray-200 bg-gray-50';

  return (
    <article
      id="skin-report"
      aria-labelledby="report-title"
      className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden"
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">{siteConfig.name}</p>
            <h2 id="report-title" className="text-2xl font-bold">AI Skin Health Report</h2>
          </div>
          <dl className="text-right text-xs text-blue-100 space-y-0.5">
            <div><dt className="inline">Report ID: </dt><dd className="inline font-mono text-white">{report.id}</dd></div>
            <div>
              <dt className="inline">Generated: </dt>
              <dd className="inline text-white">
                <time dateTime={report.createdAt.toISOString()}>{report.createdAt.toLocaleString()}</time>
              </dd>
            </div>
            <div><dt className="inline">Image source: </dt><dd className="inline text-white">{report.source === 'camera' ? 'Camera' : 'Gallery upload'}</dd></div>
          </dl>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Image + result */}
        <section className="grid sm:grid-cols-[200px_1fr] gap-6 items-start" aria-label="Analysis result">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, must print */}
          <img
            src={report.imageUrl}
            alt="Analysed skin image"
            className="w-full sm:w-[200px] aspect-square object-cover rounded-xl border border-gray-200"
          />

          <div className={`rounded-xl border-2 p-5 space-y-4 ${cardClasses}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                  {report.isNormal ? 'AI result' : 'Most likely condition'}
                </p>
                <h3 className={`text-2xl font-bold ${report.isNormal ? 'text-blue-800' : severity ? severity.text : 'text-gray-800'}`}>
                  {report.isNormal ? 'No skin disease recognised' : condition?.name ?? modelClassLabel(report.predictedName)}
                </h3>
                {!report.isNormal && condition?.alsoKnownAs && (
                  <p className="text-xs text-gray-500 mt-0.5">Also known as: {condition.alsoKnownAs.join(', ')}</p>
                )}
              </div>
              {!report.isNormal && severity && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severity.badge}`}>{severity.label}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-600">AI confidence</span>
                <span className="font-bold text-gray-800">{confidencePct}%</span>
              </div>
              <div
                className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={confidencePct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="AI confidence"
              >
                <div
                  className={`h-full rounded-full ${report.isNormal ? 'bg-blue-500' : severity ? severity.bar : 'bg-blue-500'}`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>

            {report.isNormal ? (
              <p className="text-sm text-gray-700">
                The AI did not match this image to any of the {MODEL_INFO.totalClasses - 1} skin conditions it knows. This
                can mean the skin looks healthy — or that the photo is unclear or shows a condition the AI was not trained
                on. If you are worried about your skin, please see a doctor.
              </p>
            ) : (
              severity && <p className="text-sm text-gray-700">{severity.advice}</p>
            )}

            {report.confidence < LOW_CONFIDENCE && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <strong>Low confidence.</strong> The AI is unsure about this image — also look at the other possibilities
                below. Retaking the photo in daylight, in focus, with the skin area filling most of the frame can help.
              </p>
            )}
          </div>
        </section>

        {/* Other possibilities */}
        {otherPredictions.length > 0 && (
          <section aria-labelledby="other-possibilities">
            <h3 id="other-possibilities" className="text-lg font-bold text-gray-800 mb-3">Other possibilities</h3>
            <ul className="space-y-3">
              {otherPredictions.map((p) => {
                const pct = Math.round(p.confidence * 100);
                const label = modelClassLabel(p.modelClass);
                return (
                  <li key={p.modelClass} className="rounded-xl border border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                      {p.condition ? (
                        <Link href={`/conditions/${p.condition.slug}`} className="font-semibold text-blue-700 hover:underline">
                          {label}
                        </Link>
                      ) : (
                        <span className="font-semibold text-gray-700">{label}</span>
                      )}
                      <span className="font-bold text-gray-700">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden" aria-hidden="true">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* About the condition */}
        {!report.isNormal && condition && (
          <section aria-labelledby="about-condition">
            <h3 id="about-condition" className="text-lg font-bold text-gray-800 mb-2">About {condition.name}</h3>
            <p className="text-gray-600 leading-relaxed">{condition.summary}</p>
            {condition.isCancerous && (
              <p className="mt-2 text-sm font-medium text-red-700">
                This is a type of skin cancer. Early assessment by a dermatologist is important.
              </p>
            )}
          </section>
        )}

        {/* Signs & next steps */}
        {!report.isNormal && condition && (
          <div className="grid md:grid-cols-2 gap-6">
            <section aria-labelledby="common-signs">
              <h3 id="common-signs" className="text-lg font-bold text-gray-800 mb-2">Common signs</h3>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {condition.signs.map((s) => (
                  <li key={s} className="flex gap-2"><span className="text-blue-500">•</span><span>{s}</span></li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="next-steps">
              <h3 id="next-steps" className="text-lg font-bold text-gray-800 mb-2">Recommended next steps</h3>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {condition.nextSteps.map((s) => (
                  <li key={s} className="flex gap-2"><span className="text-green-600">✓</span><span>{s}</span></li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* User-provided details */}
        {hasDetails && (
          <section aria-labelledby="your-details" className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <h3 id="your-details" className="text-lg font-bold text-gray-800 mb-2">Details you provided</h3>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {details.bodyArea && (
                <div><dt className="text-gray-500">Body area</dt><dd className="font-medium text-gray-800">{details.bodyArea}</dd></div>
              )}
              {details.duration && (
                <div><dt className="text-gray-500">Noticed for</dt><dd className="font-medium text-gray-800">{details.duration}</dd></div>
              )}
              {details.symptoms.length > 0 && (
                <div className="sm:col-span-2"><dt className="text-gray-500">Symptoms</dt><dd className="font-medium text-gray-800">{details.symptoms.join(', ')}</dd></div>
              )}
              {details.notes.trim() && (
                <div className="sm:col-span-2"><dt className="text-gray-500">Notes</dt><dd className="font-medium text-gray-800 whitespace-pre-line">{details.notes}</dd></div>
              )}
            </dl>
            <p className="mt-3 text-xs text-gray-500">
              These details are included for your doctor. The AI result is based on the image only.
            </p>
          </section>
        )}

        {/* Method */}
        <section aria-labelledby="method" className="text-xs text-gray-500 space-y-1">
          <h3 id="method" className="font-semibold text-gray-600">How this report was generated</h3>
          <p>
            A {MODEL_INFO.architecture} deep-learning model, trained on {MODEL_INFO.trainingImages.toLocaleString('en-US')}{' '}
            clinical skin photos, compared your image against {MODEL_INFO.totalClasses} categories (
            {MODEL_INFO.totalClasses - 1} skin conditions plus healthy skin) and returned the most likely matches with
            confidence scores. In testing on photos it had never seen, its top answer was correct about {accuracyPct}% of
            the time, so treat this result as a first indication only. Your image was analysed in memory and was not stored.
          </p>
        </section>

        {/* Disclaimer */}
        <aside className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <p className="text-sm font-semibold text-yellow-800 mb-1">Medical disclaimer</p>
          <p className="text-xs text-yellow-800 leading-relaxed">
            This report is generated by an AI model for information and awareness only. It is{' '}
            <strong>not a medical diagnosis</strong> and does not replace an examination by a qualified doctor or
            dermatologist. If you are worried about a skin change, or a spot is bleeding, growing or changing, see a doctor.
          </p>
        </aside>

        {/* Actions (hidden when printing) */}
        <div className="no-print flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm shadow hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Download / Print Report (PDF)
          </button>
          <button
            type="button"
            onClick={onNewScan}
            className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Analyze Another Image
          </button>
          {!report.isNormal && condition && (
            <Link
              href={`/conditions/${condition.slug}`}
              className="flex-1 py-3 rounded-xl border-2 border-blue-200 text-blue-700 font-semibold text-sm text-center hover:bg-blue-50 transition-colors"
            >
              Learn about {condition.name}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
