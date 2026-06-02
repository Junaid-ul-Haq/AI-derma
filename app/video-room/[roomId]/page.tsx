'use client';

import { use, useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  useCallStateHooks,
  CallingState,
  ParticipantView,
} from '@stream-io/video-react-sdk';

// ─── Inner call UI (rendered inside StreamCall provider) ─────────────────────
function CallUI({
  consultationId,
  role,
  onEnd,
}: {
  consultationId: string | null;
  role: string;
  onEnd: () => void;
}) {
  const {
    useCallCallingState,
    useLocalParticipant,
    useRemoteParticipants,
    useCameraState,
    useMicrophoneState,
  } = useCallStateHooks();

  const callingState      = useCallCallingState();
  const localParticipant  = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const { camera,     isMute: camOff  } = useCameraState();
  const { microphone, isMute: micOff  } = useMicrophoneState();

  const toggleCam = async () => { camOff ? await camera.enable() : await camera.disable(); };
  const toggleMic = async () => { micOff ? await microphone.enable() : await microphone.disable(); };

  const handleEndCall = async () => {
    if (role === 'DOCTOR' && consultationId) {
      await fetch(`/api/consultations/${consultationId}/end`, { method: 'PUT' });
    }
    onEnd();
  };

  if (callingState === CallingState.LEFT) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Call Ended</p>
          <button onClick={onEnd} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allParticipants = [
    ...(localParticipant  ? [{ ...localParticipant,  isLocal: true  }] : []),
    ...remoteParticipants.map(p => ({ ...p, isLocal: false })),
  ];

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Video grid */}
      <div className="flex-1 grid gap-2 p-3 overflow-hidden"
        style={{ gridTemplateColumns: allParticipants.length > 1 ? '1fr 1fr' : '1fr' }}
      >
        {allParticipants.map((participant) => (
          <div
            key={participant.sessionId}
            className="relative rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center"
          >
            <ParticipantView
              participant={participant}
              className="w-full h-full object-cover"
            />
            {/* Name label */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {(participant as any).isLocal ? 'You' : (participant.name || participant.userId)}
              </span>
              {(participant as any).isMuted && (
                <span className="bg-red-500/80 text-white text-xs px-1.5 py-0.5 rounded-full">🔇</span>
              )}
            </div>
          </div>
        ))}

        {/* Waiting for other party */}
        {remoteParticipants.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 rounded-2xl px-6 py-4 text-white text-center backdrop-blur-sm">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse mx-auto mb-2" />
              <p className="text-sm">Waiting for the other participant…</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-4 py-5 bg-gray-800 border-t border-gray-700">
        {/* Mic toggle */}
        <button
          onClick={toggleMic}
          className={`flex flex-col items-center gap-1 group`}
          title={micOff ? 'Unmute' : 'Mute'}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            micOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
          }`}>
            {micOff
              ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              : <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            }
          </div>
          <span className="text-xs text-gray-400">{micOff ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* End call */}
        <button
          onClick={handleEndCall}
          className="flex flex-col items-center gap-1"
          title="End Call"
        >
          <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </div>
          <span className="text-xs text-red-400">End</span>
        </button>

        {/* Camera toggle */}
        <button
          onClick={toggleCam}
          className="flex flex-col items-center gap-1"
          title={camOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            camOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
          }`}>
            {camOff
              ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2V10a2 2 0 00-2-2H3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              : <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2V10a2 2 0 00-2-2H3z" /></svg>
            }
          </div>
          <span className="text-xs text-gray-400">{camOff ? 'Camera On' : 'Camera Off'}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function VideoRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [streamClient,     setStreamClient]     = useState<StreamVideoClient | null>(null);
  const [streamCall,       setStreamCall]       = useState<any>(null);
  const [consultationId,   setConsultationId]   = useState<string | null>(null);
  const [connecting,       setConnecting]       = useState(true);
  const [error,            setError]            = useState('');

  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef   = useRef<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/auth/signin'); return; }
    if (status !== 'authenticated')  return;

    const stored = sessionStorage.getItem(`cid-${roomId}`);
    if (stored) setConsultationId(stored);

    async function init() {
      try {
        const res = await fetch('/api/stream/token');
        if (!res.ok) throw new Error('Could not get Stream token. Check STREAM_API_KEY in .env.local');
        const { token, userId } = await res.json();

        const user  = session!.user as any;
        const client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user:   { id: userId, name: user?.name ?? 'User', image: user?.profileImage ?? undefined },
          token,
        });

        const call = client.call('default', roomId);
        await call.join({ create: false });

        clientRef.current = client;
        callRef.current   = call;
        setStreamClient(client);
        setStreamCall(call);
      } catch (e: any) {
        setError(e.message ?? 'Failed to connect');
      } finally {
        setConnecting(false);
      }
    }

    init();

    return () => {
      callRef.current?.leave().catch(console.error);
      clientRef.current?.disconnectUser().catch(console.error);
    };
  }, [status]);

  const handleEnd = useCallback(async () => {
    try { await callRef.current?.leave(); } catch { /* ignore */ }
    try { await clientRef.current?.disconnectUser(); } catch { /* ignore */ }
    const role = (session?.user as any)?.role;
    router.replace(role === 'DOCTOR' ? '/doctor/consultations' : '/user/consultations');
  }, [session]);

  // ── Loading state ──
  if (connecting || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-blue-400" />
        <p className="text-sm text-gray-400">Connecting to call…</p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4 px-6 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-300 font-medium">{error}</p>
        <p className="text-gray-500 text-sm max-w-sm">
          Make sure STREAM_API_KEY and STREAM_API_SECRET are set in .env.local and the Stream account is active.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!streamClient || !streamCall) return null;

  const role = (session?.user as any)?.role ?? '';

  return (
    <StreamVideo client={streamClient}>
      <StreamCall call={streamCall}>
        <CallUI
          consultationId={consultationId}
          role={role}
          onEnd={handleEnd}
        />
      </StreamCall>
    </StreamVideo>
  );
}
