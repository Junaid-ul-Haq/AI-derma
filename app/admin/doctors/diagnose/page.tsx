'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

interface DiagnosticData {
  success: boolean;
  summary: {
    totalDoctors: number;
    approvedDoctors: number;
    pendingDoctors: number;
    rejectedDoctors: number;
    unknownStatus: number;
  };
  statusCounts: Record<string, number>;
  nonApprovedDoctors: Array<{
    _id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
  message: string;
}

export default function DiagnoseDoctorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/user/dashboard');
      } else {
        fetchDiagnostics();
      }
    }
  }, [status, session, router]);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/doctors/diagnose');
      if (res.ok) {
        const data = await res.json();
        setDiagnosticData(data);
      } else {
        setMessage('Failed to fetch diagnostic data');
      }
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      setMessage('Error fetching diagnostic data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm('Are you sure you want to approve all pending doctors?')) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/doctors/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve-all' }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: ${data.message}`);
        fetchDiagnostics();
      } else {
        setMessage(`Error: ${data.error || 'Failed to approve doctors'}`);
      }
    } catch (error) {
      setMessage('Error approving doctors');
    } finally {
      setProcessing(false);
    }
  };

  const handleClean = async () => {
    if (!confirm('Are you sure you want to remove all non-approved doctors from the database? This action cannot be undone.')) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/doctors/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean' }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: ${data.message}`);
        fetchDiagnostics();
      } else {
        setMessage(`Error: ${data.error || 'Failed to clean doctors'}`);
      }
    } catch (error) {
      setMessage('Error cleaning doctors');
    } finally {
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">Doctor Database Diagnostic</h1>
              <p className="text-lg text-gray-600 mt-2">Check and fix doctor status issues</p>
            </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('Success') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {diagnosticData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{diagnosticData.summary.totalDoctors}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{diagnosticData.summary.approvedDoctors}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{diagnosticData.summary.pendingDoctors}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{diagnosticData.summary.rejectedDoctors}</p>
              </div>
            </div>

            {/* Status Message */}
            <div className={`mb-6 p-4 rounded-lg ${
              diagnosticData.nonApprovedDoctors.length === 0
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={diagnosticData.nonApprovedDoctors.length === 0 ? 'text-green-800' : 'text-yellow-800'}>
                {diagnosticData.message}
              </p>
            </div>

            {/* Non-Approved Doctors List */}
            {diagnosticData.nonApprovedDoctors.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Non-Approved Doctors ({diagnosticData.nonApprovedDoctors.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {diagnosticData.nonApprovedDoctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doctor.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {doctor.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              doctor.status === 'PENDING' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {doctor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(doctor.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {diagnosticData.nonApprovedDoctors.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Fix Issues</h3>
                <div className="flex gap-4">
                  {diagnosticData.summary.pendingDoctors > 0 && (
                    <button
                      onClick={handleApproveAll}
                      disabled={processing}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {processing ? 'Processing...' : `Approve All Pending (${diagnosticData.summary.pendingDoctors})`}
                    </button>
                  )}
                  <button
                    onClick={handleClean}
                    disabled={processing}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processing ? 'Processing...' : 'Remove All Non-Approved'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={fetchDiagnostics}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Refresh Diagnostics
          </button>
        </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

