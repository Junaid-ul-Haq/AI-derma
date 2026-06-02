'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

export default function UserDashboard() {
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
          <p className="mt-4 text-gray-600 text-lg">Loading your dashboard...</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  User Dashboard
                </h1>
                <p className="text-xl text-gray-600">
                  Welcome back, {session.user?.name}!
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Link href="/user/upload">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Image</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Upload your skin images for AI-powered analysis
                    </p>
                  </motion.div>
                </Link>

                <Link href="/user/reports">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">My Reports</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      View your AI-generated health reports
                    </p>
                  </motion.div>
                </Link>

                <Link href="/user/doctors">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Browse Doctors</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      View available doctors and book consultations
                    </p>
                  </motion.div>
                </Link>

                <Link href="/user/consultations">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Consultations</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Connect with dermatologists for expert advice
                    </p>
                  </motion.div>
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-sm mt-2">Your uploads and reports will appear here</p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

