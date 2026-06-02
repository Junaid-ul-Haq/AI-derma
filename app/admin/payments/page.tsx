'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

type Consultation = {
  _id: string;
  userId?:   { name?: string; email?: string };
  doctorId?: { name?: string; email?: string };
  slotDate?: string;
  slotTime?: string;
  status?: string;
  paymentScreenshot?: string;
  paymentVerified?: boolean;
  paymentSubmittedAt?: string;
  paymentVerifiedAt?: string;
  roomId?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  ACCEPTED:  'bg-green-100  text-green-700',
  REJECTED:  'bg-red-100    text-red-700',
  IN_CALL:   'bg-blue-100   text-blue-700',
  COMPLETED: 'bg-gray-100   text-gray-600',
};

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rows,         setRows]         = useState<Consultation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [filter,       setFilter]       = useState('ALL');
  const [verifyingId,  setVerifyingId]  = useState<string | null>(null);
  const [previewImg,   setPreviewImg]   = useState<string | null>(null);

  const load = useCallback(async (statusFilter = 'ALL') => {
    setError('');
    try {
      const url = statusFilter === 'ALL'
        ? '/api/admin/consultations'
        : `/api/admin/consultations?status=${statusFilter}`;
      const res  = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to load'); return; }
      setRows(data.consultations || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin'); return; }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN') { router.push('/user/dashboard'); return; }
      load();
    }
  }, [status, session]);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    setLoading(true);
    load(f);
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    const res = await fetch('/api/admin/consultations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRows(prev =>
        prev.map(r => r._id === id ? { ...r, paymentVerified: true, paymentVerifiedAt: new Date().toISOString() } : r)
      );
    }
    setVerifyingId(null);
  };

  const withPayment = rows.filter(r => r.paymentScreenshot);
  const verified    = withPayment.filter(r => r.paymentVerified).length;
  const unverified  = withPayment.filter(r => !r.paymentVerified).length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'IN_CALL', 'COMPLETED', 'REJECTED'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <DashboardSidebar role="ADMIN" />

      {/* Payment screenshot preview modal */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImg(null)}
        >
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-gray-600 hover:text-red-500"
            >✕</button>
            <img src={previewImg} alt="Payment proof" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      <main className="md:ml-64 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments & Consultations</h1>
              <p className="text-gray-500 mt-1">All consultation bookings with payment records</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Bookings',    value: rows.length,       color: 'text-gray-900',   bg: 'bg-white' },
                { label: 'With Payment Proof',value: withPayment.length, color: 'text-blue-700',  bg: 'bg-blue-50' },
                { label: 'Payment Verified',  value: verified,          color: 'text-green-700',  bg: 'bg-green-50' },
                { label: 'Needs Verification',value: unverified,        color: 'text-orange-700', bg: 'bg-orange-50' },
              ].map(c => (
                <div key={c.label} className={`${c.bg} rounded-2xl border border-gray-100 p-4 shadow-sm`}>
                  <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Slot</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Video Call</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                          No consultations found
                        </td>
                      </tr>
                    ) : rows.map(r => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        {/* Patient */}
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{r.userId?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{r.userId?.email}</p>
                        </td>
                        {/* Doctor */}
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">Dr. {r.doctorId?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{r.doctorId?.email}</p>
                        </td>
                        {/* Slot */}
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {r.slotDate
                            ? new Date(r.slotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                          {r.slotTime && <><br />{r.slotTime}</>}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                            {r.status}
                          </span>
                        </td>
                        {/* Payment */}
                        <td className="px-5 py-3">
                          {r.paymentScreenshot ? (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => setPreviewImg(r.paymentScreenshot!)}
                                className="text-xs text-blue-600 hover:underline text-left"
                              >
                                📎 View proof
                              </button>
                              <span className={`text-xs font-semibold ${r.paymentVerified ? 'text-green-600' : 'text-orange-500'}`}>
                                {r.paymentVerified ? '✓ Verified' : '⚠ Unverified'}
                              </span>
                              {r.paymentVerifiedAt && (
                                <span className="text-xs text-gray-400">
                                  {new Date(r.paymentVerifiedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No proof</span>
                          )}
                        </td>
                        {/* Video call info */}
                        <td className="px-5 py-3">
                          {r.roomId ? (
                            <div className="text-xs text-gray-600 space-y-0.5">
                              <p className="text-blue-600 font-medium">Room created</p>
                              {r.startedAt && <p>Started: {new Date(r.startedAt).toLocaleTimeString()}</p>}
                              {r.endedAt   && <p>Ended: {new Date(r.endedAt).toLocaleTimeString()}</p>}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        {/* Action */}
                        <td className="px-5 py-3">
                          {r.paymentScreenshot && !r.paymentVerified && (
                            <button
                              onClick={() => handleVerify(r._id)}
                              disabled={verifyingId === r._id}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {verifyingId === r._id ? 'Verifying…' : 'Verify Payment'}
                            </button>
                          )}
                          {r.paymentVerified && (
                            <span className="text-xs text-green-600 font-semibold">✓ Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
