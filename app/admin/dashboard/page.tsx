'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

interface Stats {
  overview: {
    totalUsers: number;
    totalDoctors: number;
    approvedDoctors: number;
    pendingDoctors: number;
    totalConsultations: number;
    activeCallsNow: number;
  };
  byStatus: {
    PENDING: number;
    ACCEPTED: number;
    REJECTED: number;
    IN_CALL: number;
    COMPLETED: number;
  };
  payments: { total: number; verified: number; pending: number };
  perDoctor: {
    doctorId: string;
    name: string;
    email: string;
    profileImage?: string;
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    inCall: number;
    rejected: number;
    paymentsReceived: number;
    paymentsVerified: number;
  }[];
  recentActivity: {
    _id: string;
    patientName: string;
    doctorName: string;
    status: string;
    slotDate?: string;
    slotTime?: string;
    paymentVerified: boolean;
    paymentScreenshot?: string;
    roomId?: string;
    createdAt: string;
  }[];
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  ACCEPTED:  'bg-green-100  text-green-700',
  REJECTED:  'bg-red-100    text-red-700',
  IN_CALL:   'bg-blue-100   text-blue-700',
  COMPLETED: 'bg-gray-100   text-gray-600',
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/auth/signin'); return; }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN') {
        router.replace(role === 'DOCTOR' ? '/doctor/dashboard' : '/user/dashboard');
      } else {
        fetch('/api/admin/stats')
          .then(async r => {
            const data = await r.json();
            if (!r.ok || !data.overview) {
              setApiError(data.error || 'Failed to load dashboard stats.');
            } else {
              setStats(data);
            }
          })
          .catch(() => setApiError('Network error — could not reach the server.'))
          .finally(() => setLoading(false));
      }
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DashboardSidebar role="ADMIN" />
        <div className="md:ml-64 w-full flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold text-lg mb-2">Dashboard Error</p>
            <p className="text-gray-500 text-sm mb-6">{apiError}</p>
            <button
              onClick={() => { setApiError(''); setLoading(true); window.location.reload(); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats?.overview) return null;
  const { overview, byStatus, payments, perDoctor, recentActivity } = stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <DashboardSidebar role="ADMIN" />

      <main className="md:ml-64 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">System overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* ── Row 1: System overview cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Users',       value: overview.totalUsers,        color: 'bg-blue-500',   icon: '👥' },
                { label: 'Total Doctors',     value: overview.totalDoctors,      color: 'bg-green-500',  icon: '🩺' },
                { label: 'Pending Doctors',   value: overview.pendingDoctors,    color: 'bg-yellow-500', icon: '⏳' },
                { label: 'Consultations',     value: overview.totalConsultations,color: 'bg-purple-500', icon: '📋' },
                { label: 'Active Calls Now',  value: overview.activeCallsNow,    color: 'bg-red-500',    icon: '🔴' },
                { label: 'Payments Pending',  value: payments.pending,           color: 'bg-orange-500', icon: '💳' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className={`w-9 h-9 ${card.color} rounded-xl flex items-center justify-center text-lg mb-3`}>
                    {card.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* ── Row 2: Consultations by status + Payments ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Consultations by status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Consultations by Status</h2>
                <div className="space-y-3">
                  {(Object.entries(byStatus) as [string, number][]).map(([s, count]) => {
                    const pct = overview.totalConsultations > 0
                      ? Math.round((count / overview.totalConsultations) * 100)
                      : 0;
                    const barColors: Record<string, string> = {
                      PENDING:   'bg-yellow-400',
                      ACCEPTED:  'bg-green-400',
                      REJECTED:  'bg-red-400',
                      IN_CALL:   'bg-blue-500',
                      COMPLETED: 'bg-gray-400',
                    };
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[s]}`}>{s}</span>
                          <span className="font-semibold text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${barColors[s]} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Payment Records</h2>
                  <Link href="/admin/payments" className="text-xs text-blue-600 hover:underline">View all →</Link>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500">Total Payments Submitted</p>
                      <p className="text-2xl font-bold text-gray-900">{payments.total}</p>
                    </div>
                    <span className="text-3xl">💰</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-xs text-green-600 mb-1">Verified</p>
                      <p className="text-xl font-bold text-green-700">{payments.verified}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <p className="text-xs text-orange-600 mb-1">Pending Verification</p>
                      <p className="text-xl font-bold text-orange-700">{payments.pending}</p>
                      {payments.pending > 0 && (
                        <Link href="/admin/payments" className="text-xs text-orange-600 hover:underline">Review →</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 3: Per-doctor breakdown ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Consultations per Doctor</h2>
                <span className="text-xs text-gray-400">{perDoctor.length} doctors with activity</span>
              </div>
              {perDoctor.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">No consultations yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Total</th>
                        <th className="px-4 py-3 text-xs font-semibold text-yellow-600 uppercase text-center">Pending</th>
                        <th className="px-4 py-3 text-xs font-semibold text-green-600 uppercase text-center">Accepted</th>
                        <th className="px-4 py-3 text-xs font-semibold text-blue-600 uppercase text-center">In Call</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Completed</th>
                        <th className="px-4 py-3 text-xs font-semibold text-red-500 uppercase text-center">Rejected</th>
                        <th className="px-4 py-3 text-xs font-semibold text-orange-500 uppercase text-center">Payments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {perDoctor.map(d => (
                        <tr key={d.doctorId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                {d.profileImage
                                  ? <img src={d.profileImage} alt={d.name} className="h-8 w-8 object-cover rounded-full" />
                                  : d.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Dr. {d.name}</p>
                                <p className="text-xs text-gray-400">{d.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{d.total}</td>
                          <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">{d.pending}</span></td>
                          <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">{d.accepted}</span></td>
                          <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{d.inCall}</span></td>
                          <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{d.completed}</span></td>
                          <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold">{d.rejected}</span></td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs text-gray-700">
                              <span className="text-green-600 font-semibold">{d.paymentsVerified}</span>
                              <span className="text-gray-400">/{d.paymentsReceived}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Row 4: Recent activity ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Recent Consultations</h2>
                <Link href="/admin/payments" className="text-xs text-blue-600 hover:underline">View all →</Link>
              </div>
              {recentActivity.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">No consultations yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map(a => (
                    <div key={a._id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{a.patientName}</span>
                          <span className="text-gray-400 text-xs">→</span>
                          <span className="font-medium text-gray-700">Dr. {a.doctorName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {a.status}
                          </span>
                          {a.roomId && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                              Video Room
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {a.slotDate && (
                            <span className="text-xs text-gray-400">
                              {new Date(a.slotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {a.slotTime && ` · ${a.slotTime}`}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            Booked {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {a.paymentScreenshot && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.paymentVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                            {a.paymentVerified ? '✓ Paid' : '⚠ Unverified'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Quick actions ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: '/admin/users',    label: 'Manage Users',    icon: '👥', color: 'hover:border-blue-300   hover:bg-blue-50'   },
                { href: '/admin/doctors',  label: 'Approve Doctors', icon: '🩺', color: 'hover:border-green-300  hover:bg-green-50'  },
                { href: '/admin/payments', label: 'View Payments',   icon: '💳', color: 'hover:border-orange-300 hover:bg-orange-50' },
                { href: '/admin/reports',  label: 'Reports',         icon: '📊', color: 'hover:border-purple-300 hover:bg-purple-50' },
              ].map(q => (
                <Link key={q.href} href={q.href}>
                  <div className={`bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all cursor-pointer ${q.color}`}>
                    <span className="text-2xl">{q.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{q.label}</span>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
