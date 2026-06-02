'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

type ConsultationRow = {
  _id: string;
  meetingLive?: boolean;
  slotDate?: string;
  slotTime?: string;
  userId?: { name?: string; email?: string };
};

export default function DoctorMeetings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<ConsultationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/consultations', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.consultations)) {
        const live = data.consultations.filter((c: ConsultationRow) => c.meetingLive);
        setRows(live);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?type=doctor');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'DOCTOR') {
        if (userRole === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/user/dashboard');
        }
      } else {
        load();
      }
    }
  }, [status, session, router, load]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <DashboardSidebar role="DOCTOR" />

      <main className="md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Active meetings</h1>
          <p className="text-gray-600 mb-8">
            Active consultation meetings with confirmed bookings will appear here.
          </p>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <li className="px-6 py-12 text-center text-gray-500">
                  No active meetings. Completed payments will list here automatically.
                </li>
              ) : (
                rows.map((r) => (
                  <li key={r._id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {r.userId?.name || 'Patient'}
                      </p>
                      <p className="text-sm text-gray-500">{r.userId?.email}</p>
                    </div>
                    <div className="text-sm text-gray-700 md:text-right">
                      <p>
                        {r.slotDate && new Date(r.slotDate).toLocaleDateString()} at {r.slotTime}
                      </p>
                      <p className="text-emerald-600 font-medium text-xs mt-1">
                        Paid · schedule active
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
