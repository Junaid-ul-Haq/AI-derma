import { NextRequest, NextResponse } from 'next/server';

// Reads from env so deployments can point to the production AI server
// without changing code. Falls back to the local Python dev server.
const AI_SERVICE_URL =
  process.env.AI_BACKEND_URL ?? 'http://127.0.0.1:8000/predict';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface PredictResult {
  disease: string;
  confidence: number;
  top_predictions?: { disease: string; confidence: number }[];
}

// Public endpoint — no account needed. Images are forwarded to the AI service
// in memory and never written to disk or a database.
export async function POST(request: NextRequest) {
  try {
    // ── Parse the uploaded file ───────────────────────────────────────────────
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    const file = formData.get('image');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image was uploaded. Please choose or take a photo first.' },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image format. Please use a JPG, PNG or WEBP image.' },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image is too large. Please use an image under 10 MB.' },
        { status: 413 }
      );
    }

    // ── Forward to Python FastAPI microservice ────────────────────────────────
    const upstream = new FormData();
    upstream.append('file', file, (file as File).name || 'upload.jpg');

    let aiResponse: Response;
    try {
      aiResponse = await fetch(AI_SERVICE_URL, {
        method: 'POST',
        body: upstream,
        signal: AbortSignal.timeout(60_000),
      });
    } catch (networkErr) {
      console.error('[predict] AI microservice unreachable:', networkErr);
      return NextResponse.json(
        { error: 'The AI analysis service is currently unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    if (!aiResponse.ok) {
      const text = await aiResponse.text().catch(() => '');
      console.error('[predict] AI service error:', aiResponse.status, text);
      const message =
        aiResponse.status === 422
          ? 'The image could not be read. Please try a different photo.'
          : `The AI service returned an error (${aiResponse.status}). Please try again.`;
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const result: PredictResult = await aiResponse.json();

    if (
      typeof result.disease !== 'string' ||
      typeof result.confidence !== 'number' ||
      (result.top_predictions !== undefined && !Array.isArray(result.top_predictions))
    ) {
      console.error('[predict] Unexpected AI response shape:', result);
      return NextResponse.json(
        { error: 'AI service returned an unexpected response format' },
        { status: 502 }
      );
    }

    const body: PredictResult = {
      disease: result.disease,
      confidence: result.confidence,
      top_predictions: result.top_predictions ?? [
        { disease: result.disease, confidence: result.confidence },
      ],
    };

    return NextResponse.json(body, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[predict] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong while analysing the image. Please try again.' },
      { status: 500 }
    );
  }
}
