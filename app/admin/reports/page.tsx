'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        if (userRole === 'DOCTOR') {
          router.replace('/doctor/dashboard');
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

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <DashboardSidebar role="ADMIN" />
      
      <main className="md:ml-64 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-lg text-gray-600 mb-8">System reports and analytics</p>
            
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <p className="text-center text-gray-500 py-8">Reports page coming soon...</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

