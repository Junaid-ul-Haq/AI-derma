'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

interface Consultation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  doctorId: string;
  slotDate: Date;
  slotTime: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  paymentScreenshot?: string;
  paymentVerified: boolean;
  paymentSubmittedAt?: Date;
  paymentVerifiedAt?: Date;
  createdAt: Date;
}

export default function DoctorPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifying, setVerifying] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/signin');
      return;
    }

    const role = (session.user as any)?.role;
    if (role !== 'DOCTOR') {
      router.replace('/auth/signin');
      return;
    }

    fetchPendingPayments();
  }, [session, status, router]);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/doctor/payments');
      const data = await response.json();

      if (response.ok) {
        setConsultations(data.consultations || []);
      } else {
        setError(data.error || 'Failed to fetch pending payments');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (consultationId: string, action: 'accept' | 'reject') => {
    try {
      setVerifying(consultationId);
      setError('');
      setSuccess('');

      const response = await fetch('/api/doctor/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Refresh the list
        fetchPendingPayments();
      } else {
        setError(data.error || 'Failed to verify payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
    } finally {
      setVerifying('');
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <DashboardSidebar role="DOCTOR" />
      
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
                Payment Verification
              </h1>
              <p className="text-xl text-gray-600">
                Review and verify payment screenshots for consultation bookings
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pending payments...</p>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            {/* Consultations List */}
            {!loading && consultations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Payments</h3>
                <p className="text-gray-600">There are no payment verifications pending at the moment.</p>
              </div>
            )}

            {!loading && consultations.length > 0 && (
              <div className="space-y-6">
                {consultations.map((consultation) => (
                  <motion.div
                    key={consultation._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* User Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {consultation.userId.name}
                          </h3>
                          <p className="text-gray-600 mb-4">{consultation.userId.email}</p>
                          
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Date:</span> {new Date(consultation.slotDate).toLocaleDateString()}</p>
                            <p><span className="font-medium">Time:</span> {consultation.slotTime}</p>
                            <p><span className="font-medium">Message:</span> {consultation.message}</p>
                            <p><span className="font-medium">Submitted:</span> {consultation.paymentSubmittedAt ? new Date(consultation.paymentSubmittedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        </div>

                        {/* Payment Screenshot */}
                        <div className="flex-1">
                          <h4 className="text-md font-medium text-gray-900 mb-3">Payment Screenshot</h4>
                          {consultation.paymentScreenshot ? (
                            <div className="space-y-3">
                              <img
                                src={consultation.paymentScreenshot}
                                alt="Payment Screenshot"
                                className="w-full max-w-sm rounded-lg border border-gray-200"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.open(consultation.paymentScreenshot, '_blank')}
                                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                >
                                  View Full Size
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500">No payment screenshot uploaded</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => handleVerifyPayment(consultation._id, 'accept')}
                          disabled={verifying === consultation._id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifying === consultation._id ? 'Processing...' : 'Accept & Confirm Booking'}
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(consultation._id, 'reject')}
                          disabled={verifying === consultation._id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifying === consultation._id ? 'Processing...' : 'Reject Payment'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
