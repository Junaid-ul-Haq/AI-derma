'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCall } from '../.././../context/CallContext';

interface Consultation {
  _id: string;
  doctorId: { name: string; email: string } | string;
  status: string;
  slotDate?: string;
  slotTime?: string;
  message?: string;
  roomId?: string;
  paymentVerified?: boolean;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED:  { label: 'Accepted',   color: 'bg-green-100  text-green-800'  },
  REJECTED:  { label: 'Rejected',   color: 'bg-red-100    text-red-800'    },
  IN_CALL:   { label: 'In Call',    color: 'bg-blue-100   text-blue-800'   },
  COMPLETED: { label: 'Completed',  color: 'bg-gray-100   text-gray-700'   },
};

export default function UserConsultationsPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const { callState } = useCall();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/signin');
  }, [status]);

  const fetchConsultations = async () => {
    const res = await fetch('/api/consultations');
    if (res.ok) {
      const data = await res.json();
      setConsultations(data.consultations ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchConsultations(); }, []);

  // When doctor starts a call, refresh the list to show IN_CALL status
  useEffect(() => {
    if (callState.callStarted) fetchConsultations();
  }, [callState.callStarted]);

  const doctorName = (c: Consultation) =>
    typeof c.doctorId === 'object' ? `Dr. ${c.doctorId.name}` : 'Doctor';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>
          </div>
          <Link
            href="/user/book-consultation"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            + Book New
          </Link>
        </div>

        {/* Call-started banner */}
        {callState.callStarted && callState.roomId && (
          <div className="mb-4 p-4 bg-green-600 text-white rounded-xl flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <p className="font-semibold">Your doctor started the consultation!</p>
            </div>
            <button
              onClick={() => router.push(`/video-room/${callState.roomId}`)}
              className="px-4 py-1.5 bg-white text-green-700 rounded-lg text-sm font-bold hover:bg-green-50"
            >
              Join Now
            </button>
          </div>
        )}

        {consultations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No consultations yet.</p>
            <Link href="/user/book-consultation" className="text-blue-600 hover:underline text-sm font-medium">
              Book your first consultation →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map(c => {
              const meta = STATUS_META[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600' };
              return (
                <div key={c._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{doctorName(c)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    {c.slotDate && (
                      <p className="text-sm text-gray-500">
                        {new Date(c.slotDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {c.slotTime && ` at ${c.slotTime}`}
                      </p>
                    )}
                    {c.message && <p className="text-xs text-gray-400 mt-0.5 truncate">{c.message}</p>}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {c.status === 'IN_CALL' && c.roomId && (
                      <button
                        onClick={() => router.push(`/video-room/${c.roomId}`)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <span>📹</span> Join
                      </button>
                    )}
                    <Link
                      href={`/consultation/${c._id}`}
                      className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
