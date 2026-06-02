'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Consultation {
  _id: string;
  userId: { name: string; email: string } | string;
  status: string;
  slotDate?: string;
  slotTime?: string;
  message?: string;
  roomId?: string;
  paymentVerified: boolean;
  paymentScreenshot?: string;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED:  { label: 'Accepted',   color: 'bg-green-100  text-green-800'  },
  REJECTED:  { label: 'Rejected',   color: 'bg-red-100    text-red-800'    },
  IN_CALL:   { label: 'In Call',    color: 'bg-blue-100   text-blue-800'   },
  COMPLETED: { label: 'Completed',  color: 'bg-gray-100   text-gray-700'   },
};

export default function DoctorConsultationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionId,      setActionId]      = useState<string | null>(null);
  const [filter,        setFilter]        = useState<string>('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/signin?type=doctor');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'DOCTOR')
      router.replace('/user/dashboard');
  }, [status, session]);

  const fetchConsultations = async () => {
    const res = await fetch('/api/consultations');
    if (res.ok) {
      const data = await res.json();
      setConsultations(data.consultations ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchConsultations(); }, []);

  const handleAccept = async (id: string) => {
    setActionId(id);
    const res = await fetch(`/api/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    if (res.ok) fetchConsultations();
    setActionId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this consultation?')) return;
    setActionId(id);
    const res = await fetch(`/api/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    if (res.ok) fetchConsultations();
    setActionId(null);
  };

  const handleStartCall = async (id: string) => {
    setActionId(id);
    const res = await fetch(`/api/consultations/${id}/start`, { method: 'PUT' });
    if (res.ok) {
      const data = await res.json();
      router.push(`/video-room/${data.roomId}`);
    } else {
      const d = await res.json();
      alert(d.error || 'Could not start call');
    }
    setActionId(null);
  };

  const patientName = (c: Consultation) =>
    typeof c.userId === 'object' ? c.userId.name : 'Patient';

  const filtered = filter === 'ALL'
    ? consultations
    : consultations.filter(c => c.status === filter);

  const tabs = ['ALL', 'PENDING', 'ACCEPTED', 'IN_CALL', 'COMPLETED', 'REJECTED'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/doctor/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {consultations.filter(c => c.status === 'PENDING').length} pending
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t === 'ALL' ? 'All' : STATUS_META[t]?.label ?? t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            No consultations found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const meta = STATUS_META[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600' };
              const busy = actionId === c._id;
              return (
                <div key={c._id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-gray-900">{patientName(c)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                          {meta.label}
                        </span>
                        {!c.paymentVerified && c.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Payment Pending
                          </span>
                        )}
                      </div>
                      {c.slotDate && (
                        <p className="text-sm text-gray-500">
                          {new Date(c.slotDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {c.slotTime && ` at ${c.slotTime}`}
                        </p>
                      )}
                      {c.message && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.message}</p>}
                      {c.paymentScreenshot && (
                        <a
                          href={c.paymentScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          View payment proof →
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {c.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAccept(c._id)}
                            disabled={busy}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {busy ? '...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleReject(c._id)}
                            disabled={busy}
                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {c.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleStartCall(c._id)}
                          disabled={busy}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          <span>🎥</span>
                          {busy ? 'Starting...' : 'Start Call'}
                        </button>
                      )}

                      {c.status === 'IN_CALL' && c.roomId && (
                        <button
                          onClick={() => router.push(`/video-room/${c.roomId}`)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <span>📹</span> Rejoin
                        </button>
                      )}

                      <Link
                        href={`/consultation/${c._id}`}
                        className="px-3 py-1.5 text-center border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
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
