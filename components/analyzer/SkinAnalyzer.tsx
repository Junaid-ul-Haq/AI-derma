'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CameraCapture from './CameraCapture';
import SkinReport, { type PatientDetails, type ReportData } from './SkinReport';
import { getConditionByModelClass, NORMAL_CLASS } from '../../lib/conditions';

type Step = 'choose' | 'camera' | 'preview' | 'report';
type Source = 'gallery' | 'camera';

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_EXT = /\.(jpe?g|png|webp)$/i;

const BODY_AREAS = ['Face', 'Scalp', 'Neck', 'Chest', 'Back', 'Abdomen', 'Arm', 'Hand', 'Leg', 'Foot', 'Other'];
const DURATIONS = ['Less than 1 week', '1–4 weeks', '1–6 months', 'More than 6 months', 'Since birth'];
const SYMPTOMS = ['Itching', 'Pain or tenderness', 'Bleeding', 'Crusting or scaling', 'Growing in size', 'Changing colour', 'Raised or lumpy'];

const EMPTY_DETAILS: PatientDetails = { bodyArea: '', duration: '', symptoms: [], notes: '' };

function validateImage(file: File): string | null {
  const typeOk = ACCEPTED_TYPES.includes(file.type) || (!file.type && ACCEPTED_EXT.test(file.name));
  if (!typeOk) {
    if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
      return 'HEIC photos are not supported. Please choose a JPG or PNG image, or use "Take a Photo".';
    }
    return 'Please choose a JPG, PNG or WEBP image.';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Image is too large. Please choose an image under ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

function makeReportId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `SKN-${ymd}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function SkinAnalyzer() {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>('choose');
  const [source, setSource] = useState<Source>('gallery');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [details, setDetails] = useState<PatientDetails>(EMPTY_DETAILS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [dragging, setDragging] = useState(false);

  // Release object URLs when they are replaced or the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const acceptFile = useCallback((f: File, from: Source) => {
    const problem = validateImage(f);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setReport(null);
    setFile(f);
    setSource(from);
    setPreviewUrl(URL.createObjectURL(f));
    setStep('preview');
  }, []);

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) acceptFile(f, 'gallery');
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f, 'gallery');
  }

  const handleCameraCapture = useCallback((f: File) => acceptFile(f, 'camera'), [acceptFile]);

  function toggleSymptom(symptom: string) {
    setDetails((d) => ({
      ...d,
      symptoms: d.symptoms.includes(symptom) ? d.symptoms.filter((s) => s !== symptom) : [...d.symptoms, symptom],
    }));
  }

  function retake() {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setStep(source === 'camera' ? 'camera' : 'choose');
    if (source === 'gallery') galleryInputRef.current?.click();
  }

  function startOver() {
    setFile(null);
    setPreviewUrl(null);
    setReport(null);
    setDetails(EMPTY_DETAILS);
    setError(null);
    setStep('choose');
    scrollToTop();
  }

  async function handleAnalyze() {
    if (!file || !previewUrl) return;
    setLoading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append('image', file);

      const res = await fetch('/api/predict', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? 'Analysis failed. Please try again.');
        return;
      }

      const rawTop: { disease: string; confidence: number }[] =
        Array.isArray(data.top_predictions) && data.top_predictions.length
          ? data.top_predictions
          : [{ disease: data.disease, confidence: data.confidence }];

      setReport({
        id: makeReportId(),
        createdAt: new Date(),
        imageUrl: previewUrl,
        source,
        predictedName: data.disease,
        confidence: data.confidence,
        condition: getConditionByModelClass(data.disease) ?? null,
        isNormal: data.disease === NORMAL_CLASS,
        topPredictions: rawTop.map((p) => ({
          modelClass: p.disease,
          confidence: p.confidence,
          condition: getConditionByModelClass(p.disease) ?? null,
        })),
        details,
      });
      setStep('report');
      scrollToTop();
    } catch {
      setError('Network error — could not reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={topRef} className="w-full space-y-6 scroll-mt-24">
      {/* Progress indicator */}
      <ol className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium no-print" aria-label="Progress">
        {[
          { key: 'choose', label: '1. Add photo' },
          { key: 'preview', label: '2. Review' },
          { key: 'report', label: '3. Report' },
        ].map((s, i) => {
          const order = { choose: 0, camera: 0, preview: 1, report: 2 }[step];
          const active = order === i;
          const done = order > i;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={`px-3 py-1 rounded-full ${
                  active ? 'bg-blue-600 text-white' : done ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {s.label}
              </span>
              {i < 2 && <span className="text-gray-300" aria-hidden="true">→</span>}
            </li>
          );
        })}
      </ol>

      {/* Error banner */}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg className="mt-0.5 w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Hidden gallery input — no `capture`, so phones open the photo library */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleGalleryChange}
      />

      {/* ── Step 1: choose source ─────────────────────────────────────── */}
      {step === 'choose' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-blue-300 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400'
            }`}
          >
            <span className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span>
              <span className="block text-lg font-semibold text-gray-800">Choose from Gallery</span>
              <span className="block mt-1 text-sm text-gray-500">Pick an existing photo, or drag &amp; drop it here</span>
              <span className="block mt-1 text-xs text-gray-400">JPG, PNG, WEBP · max {MAX_SIZE_MB} MB</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setError(null); setStep('camera'); }}
            className="group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-purple-300 bg-purple-50/40 px-6 py-10 text-center transition-all hover:bg-purple-50 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <span className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span>
              <span className="block text-lg font-semibold text-gray-800">Take a Photo</span>
              <span className="block mt-1 text-sm text-gray-500">Use your phone or laptop camera right now</span>
              <span className="block mt-1 text-xs text-gray-400">Back or front camera supported</span>
            </span>
          </button>
        </div>
      )}

      {/* ── Step 1b: live camera ──────────────────────────────────────── */}
      {step === 'camera' && <CameraCapture onCapture={handleCameraCapture} onCancel={() => setStep('choose')} />}

      {/* ── Step 2: preview + optional details ────────────────────────── */}
      {step === 'preview' && previewUrl && (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={previewUrl} alt="Selected skin image preview" className="w-full max-h-96 object-contain" />
            <span className="absolute top-3 left-3 bg-black/55 text-white text-xs font-medium px-3 py-1 rounded-full">
              {source === 'camera' ? 'Camera photo' : 'From gallery'}
            </span>
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={retake}
                disabled={loading}
                className="bg-white/90 hover:bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow transition-colors disabled:opacity-50"
              >
                {source === 'camera' ? 'Retake' : 'Choose another'}
              </button>
              <button
                type="button"
                onClick={startOver}
                disabled={loading}
                className="bg-white/90 hover:bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow transition-colors disabled:opacity-50"
              >
                Start over
              </button>
            </div>
          </div>

          <fieldset className="rounded-2xl border border-gray-200 p-5 space-y-4" disabled={loading}>
            <legend className="px-2 text-sm font-semibold text-gray-700">
              Add details to your report <span className="font-normal text-gray-400">(optional)</span>
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="text-gray-600">Body area</span>
                <select
                  value={details.bodyArea}
                  onChange={(e) => setDetails((d) => ({ ...d, bodyArea: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select…</option>
                  {BODY_AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-gray-600">How long have you noticed it?</span>
                <select
                  value={details.duration}
                  onChange={(e) => setDetails((d) => ({ ...d, duration: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select…</option>
                  {DURATIONS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => {
                  const on = details.symptoms.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        on ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block text-sm">
              <span className="text-gray-600">Notes for your dermatologist</span>
              <textarea
                value={details.notes}
                maxLength={500}
                rows={3}
                onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                placeholder="e.g. appeared after a sunburn, family history of skin cancer…"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <p className="text-xs text-gray-400">
              These details appear in your report only. They are not stored and not used by the AI model.
            </p>
          </fieldset>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-base shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing your skin image…
              </>
            ) : (
              'Analyze & Generate Report'
            )}
          </button>
        </div>
      )}

      {/* ── Step 3: report ────────────────────────────────────────────── */}
      {step === 'report' && report && <SkinReport report={report} onNewScan={startOver} />}
    </div>
  );
}
