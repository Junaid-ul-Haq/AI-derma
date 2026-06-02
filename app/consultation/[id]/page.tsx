'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCall } from '../../../context/CallContext';

interface Consultation {
  _id: string;
  userId:   { name: string; email: string } | string;
  doctorId: { name: string; email: string } | string;
  status: string;
  slotDate?: string;
  slotTime?: string;
  message?: string;
  doctorResponse?: string;
  roomId?: string;
  paymentVerified: boolean;
  paymentScreenshot?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Pending Approval', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  ACCEPTED:  { label: 'Accepted',         color: 'text-green-700',  bg: 'bg-green-100'  },
  REJECTED:  { label: 'Rejected',         color: 'text-red-700',    bg: 'bg-red-100'    },
  IN_CALL:   { label: 'In Call',          color: 'text-blue-700',   bg: 'bg-blue-100'   },
  COMPLETED: { label: 'Completed',        color: 'text-gray-700',   bg: 'bg-gray-100'   },
};

export default function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { callState } = useCall();
  const role = (session?.user as any)?.role as string | undefined;

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [starting,     setStarting]     = useState(false);
  const [error,        setError]        = useState('');

  const fetchConsultation = async () => {
    const res = await fetch(`/api/consultations/${id}`);
    if (res.ok) {
      const data = await res.json();
      // API returns { consultations: [...] } with a single match OR a direct consultation
      const c = data.consultation ?? (data.consultations ?? [])[0] ?? null;
      setConsultation(c);
    }
    setLoading(false);
  };

  useEffect(() => { fetchConsultation(); }, [id]);

  // Auto-redirect patient when call starts via socket
  useEffect(() => {
    if (
      role === 'USER' &&
      callState.callStarted &&
      callState.consultationId === id &&
      callState.roomId
    ) {
      router.replace(`/video-room/${callState.roomId}`);
    }
  }, [callState, role, id]);

  // Also poll for status updates every 5s for robustness
  useEffect(() => {
    const timer = setInterval(fetchConsultation, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleStartCall = async () => {
    setStarting(true);
    setError('');
    const res = await fetch(`/api/consultations/${id}/start`, { method: 'PUT' });
    if (res.ok) {
      const data = await res.json();
      router.push(`/video-room/${data.roomId}`);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Failed to start call');
      setStarting(false);
    }
  };

  const handleJoinCall = () => {
    const roomId = consultation?.roomId ?? callState.roomId;
    if (roomId) router.push(`/video-room/${roomId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Consultation not found.
      </div>
    );
  }

  const meta    = STATUS_META[consultation.status] ?? { label: consultation.status, color: 'text-gray-600', bg: 'bg-gray-100' };
  const patient = typeof consultation.userId   === 'object' ? consultation.userId.name   : 'Patient';
  const doctor  = typeof consultation.doctorId === 'object' ? consultation.doctorId.name : 'Doctor';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Consultation</h1>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Color bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />

          <div className="p-6 space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
              <p className="text-xs text-gray-400">
                {new Date(consultation.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>

            {/* Participants */}
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">Dr</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Doctor</p>
                  <p className="font-semibold text-gray-900">Dr. {doctor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">P</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Patient</p>
                  <p className="font-semibold text-gray-900">{patient}</p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            {consultation.slotDate && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Scheduled</p>
                <p className="font-medium text-gray-800">
                  {new Date(consultation.slotDate).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                  {consultation.slotTime && ` · ${consultation.slotTime}`}
                </p>
              </div>
            )}

            {/* Message */}
            {consultation.message && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Patient's Message</p>
                <p className="text-gray-700">{consultation.message}</p>
              </div>
            )}

            {/* Doctor response */}
            {consultation.doctorResponse && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-500 mb-1">Doctor's Response</p>
                <p className="text-gray-700">{consultation.doctorResponse}</p>
              </div>
            )}

            {/* Payment */}
            {consultation.paymentScreenshot && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Payment Proof</p>
                <a
                  href={consultation.paymentScreenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View screenshot →
                </a>
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold ${consultation.paymentVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {consultation.paymentVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg">{error}</p>
            )}

            {/* Action area */}
            <div className="pt-2 border-t border-gray-100">
              {/* Doctor: start call (only when ACCEPTED) */}
              {role === 'DOCTOR' && consultation.status === 'ACCEPTED' && (
                <button
                  onClick={handleStartCall}
                  disabled={starting}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  🎥 {starting ? 'Starting...' : 'Start Video Consultation'}
                </button>
              )}

              {/* Doctor: rejoin if already in call */}
              {role === 'DOCTOR' && consultation.status === 'IN_CALL' && consultation.roomId && (
                <button
                  onClick={handleJoinCall}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  📹 Rejoin Call
                </button>
              )}

              {/* Patient: waiting for doctor */}
              {role === 'USER' && consultation.status === 'ACCEPTED' && (
                <div className="flex items-center justify-center gap-2 py-4 text-yellow-700 bg-yellow-50 rounded-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                  <p className="font-medium">Waiting for doctor to start the call…</p>
                </div>
              )}

              {/* Patient: join when in call */}
              {role === 'USER' && consultation.status === 'IN_CALL' && (consultation.roomId || callState.roomId) && (
                <button
                  onClick={handleJoinCall}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 animate-pulse"
                >
                  📞 Join Video Call Now
                </button>
              )}

              {consultation.status === 'COMPLETED' && (
                <div className="flex items-center justify-center gap-2 py-4 text-green-700 bg-green-50 rounded-xl">
                  <span>✅</span>
                  <p className="font-medium">Consultation completed</p>
                  {consultation.endedAt && (
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(consultation.endedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {consultation.status === 'REJECTED' && (
                <div className="flex items-center justify-center gap-2 py-4 text-red-600 bg-red-50 rounded-xl">
                  <span>❌</span>
                  <p className="font-medium">Consultation was rejected</p>
                </div>
              )}

              {consultation.status === 'PENDING' && (
                <div className="flex items-center justify-center gap-2 py-4 text-yellow-700 bg-yellow-50 rounded-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                  <p className="font-medium">Waiting for doctor approval…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
