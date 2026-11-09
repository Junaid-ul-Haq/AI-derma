'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Facing = 'environment' | 'user';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

function describeCameraError(err: unknown): string {
  const name = (err as { name?: string })?.name;
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera permission was denied. Allow camera access in your browser settings, or use your phone\'s camera app below.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera was found on this device. You can upload a photo from your gallery instead.';
    case 'NotReadableError':
    case 'AbortError':
      return 'Your camera is being used by another app. Close that app and try again.';
    default:
      return 'Could not start the camera. Try again, or use your phone\'s camera app below.';
  }
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const [facing, setFacing] = useState<Facing>('environment');
  const [status, setStatus] = useState<'starting' | 'ready' | 'error'>('starting');
  const [error, setError] = useState<string | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [flash, setFlash] = useState(false);

  // Start (or restart) the live camera whenever the facing mode changes
  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStatus('starting');
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setError(
          window.isSecureContext
            ? 'Live camera is not supported by this browser. Use your phone\'s camera app below instead.'
            : 'Live camera needs a secure (HTTPS) connection. Use your phone\'s camera app below instead.',
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setCanSwitch(devices.filter((d) => d.kind === 'videoinput').length > 1);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setError(describeCameraError(err));
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing, attempt]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Could not capture the photo. Please try again.');
          return;
        }
        onCapture(new File([blob], `skin-photo-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  }, [onCapture]);

  function handleNativeCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          aria-label="Live camera preview"
          className={`absolute inset-0 w-full h-full object-cover ${facing === 'user' ? '-scale-x-100' : ''} ${
            status === 'ready' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Framing guide */}
        {status === 'ready' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 aspect-square rounded-full border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
            <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium drop-shadow">
              Centre the affected skin inside the circle
            </p>
          </div>
        )}

        {status === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
            <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm">Starting camera… allow access if your browser asks.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white gap-3 px-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm max-w-sm" role="alert">{error}</p>
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="mt-1 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {flash && <div className="absolute inset-0 bg-white" aria-hidden="true" />}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleCapture}
          disabled={status !== 'ready'}
          aria-label="Capture photo"
          className="w-16 h-16 rounded-full bg-white border-4 border-blue-600 shadow-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="w-11 h-11 rounded-full bg-blue-600" />
        </button>

        <button
          type="button"
          onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
          disabled={!canSwitch || status === 'starting'}
          aria-label="Switch between front and back camera"
          className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Flip
        </button>
      </div>

      {/* Fallback: the device's own camera app (works on phones without getUserMedia / HTTPS) */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => nativeInputRef.current?.click()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
        >
          Use my phone&apos;s camera app instead
        </button>
        <input
          ref={nativeInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          onChange={handleNativeCapture}
        />
      </div>
    </div>
  );
}
