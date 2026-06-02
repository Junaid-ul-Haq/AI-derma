'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

interface Doctor {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string | null;
  description?: string;
  consultationHours?: {
    startTime: string;
    endTime: string;
    days: string[];
    slotDuration: number;
  };
  professionalExperience: number;
  age?: number;
}

export default function DoctorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching approved doctors from database...');
      const res = await fetch('/api/doctors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const data = await res.json();
      console.log('Doctors API response:', { status: res.status, success: data.success, count: data.count });

      if (!res.ok || !data.success) {
        const errorMsg = data.error || data.message || 'Failed to fetch doctors from database';
        console.error('API Error:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const doctorsList = data.doctors || [];
      setDoctors(doctorsList);

      console.log(`Successfully fetched ${doctorsList.length} approved doctors from database`);

      if (doctorsList.length === 0) {
        setError('No approved doctors available at the moment. Please check back later.');
      } else {
        setError('');
      }
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Something went wrong while fetching doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/auth/signin');
      return;
    }

    const role = (session.user as any)?.role;

    if (role === 'ADMIN') {
      router.replace('/admin/dashboard');
      return;
    } else if (role === 'DOCTOR') {
      router.replace('/doctor/dashboard');
      return;
    } else if (role === 'USER') {
      fetchDoctors();
    } else {
      router.replace('/auth/signin');
    }
  }, [session, status, router, fetchDoctors]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Browse Doctors
              </h1>
              <p className="text-lg text-gray-600">
                View available dermatologists and book consultations for expert medical advice
              </p>
            </div>

            {/* Error Message */}
            {error && !loading && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">{error}</p>
                </div>
                <button
                  onClick={() => fetchDoctors()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading available doctors...</p>
                </div>
              </div>
            ) : doctors.length > 0 ? (
              <>
                {/* Doctors Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {doctors.map((doc, index) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/doctors/${doc._id}`}
                        className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 overflow-hidden"
                      >
                        <div className="p-6">
                          {/* Doctor Avatar */}
                          <div className="flex justify-center mb-4">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                              {doc.profileImage ? (
                                <img
                                  src={doc.profileImage}
                                  alt={doc.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                getInitials(doc.name)
                              )}
                            </div>
                          </div>

                          {/* Doctor Info */}
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Dr. {doc.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              {doc.professionalExperience} years of experience
                            </p>

                            {doc.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {doc.description}
                              </p>
                            )}

                            {doc.consultationHours && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Available</p>
                                <p className="text-sm font-medium text-gray-700">
                                  {doc.consultationHours.days.slice(0, 3).join(', ')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {doc.consultationHours.startTime} - {doc.consultationHours.endTime}
                                </p>
                              </div>
                            )}

                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                              Book Consultation
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Why Choose Our Doctors?
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Professionals</h3>
                      <p className="text-gray-600 text-sm">
                        All doctors are verified and approved by our medical board
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Available 24/7</h3>
                      <p className="text-gray-600 text-sm">
                        Book consultations at your convenience with flexible scheduling
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
                      <p className="text-gray-600 text-sm">
                        Your consultations are completely confidential and secure
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Available</h3>
                <p className="text-gray-600 mb-4">
                  There are currently no approved doctors available. Please check back later.
                </p>
                <button
                  onClick={() => fetchDoctors()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
