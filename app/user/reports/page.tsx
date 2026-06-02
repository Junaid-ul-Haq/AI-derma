'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function UserReports() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/signin');
    } else {
      const userRole = (session.user as any)?.role;
      if (userRole === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else if (userRole === 'DOCTOR') {
        router.replace('/doctor/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== 'USER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <DashboardSidebar role="USER" />
      
      <main className="md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Reports</h1>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <p className="text-gray-600">My Reports page content will be added here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

