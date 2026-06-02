'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function DoctorPatients() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <DashboardSidebar role="DOCTOR" />
      
      <main className="md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Patients</h1>
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <p className="text-gray-600">Patients page content will be added here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

