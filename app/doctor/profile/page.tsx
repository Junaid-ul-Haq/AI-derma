'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

interface BankDetails {
  accountTitle: string;
  accountNumber: string;
  bankName: string;
  iban: string;
}

export default function DoctorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountTitle: '',
    accountNumber: '',
    bankName: '',
    iban: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    fetchBankDetails();
  }, [session, status, router]);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/doctor/profile');
      const data = await response.json();

      if (response.ok) {
        if (data.bankDetails) {
          setBankDetails(data.bankDetails);
        }
      } else {
        setError(data.error || 'Failed to fetch bank details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankDetails.accountTitle || !bankDetails.accountNumber || !bankDetails.bankName) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/doctor/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankDetails }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Bank details updated successfully!');
      } else {
        setError(data.error || 'Failed to update bank details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update bank details');
    } finally {
      setSaving(false);
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-xl text-gray-600">
                Manage your bank details for consultation payments
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            )}

            {!loading && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8">
                  {/* Bank Details Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank Details</h2>
                      <p className="text-gray-600 mb-6">
                        These details will be shown to users when they book consultations with you.
                      </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {success}
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="accountTitle" className="block text-sm font-medium text-gray-700 mb-2">
                          Account Title *
                        </label>
                        <input
                          type="text"
                          id="accountTitle"
                          name="accountTitle"
                          value={bankDetails.accountTitle}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter account holder name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          id="accountNumber"
                          name="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter account number"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          id="bankName"
                          name="bankName"
                          value={bankDetails.bankName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter bank name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-2">
                          IBAN (Optional)
                        </label>
                        <input
                          type="text"
                          id="iban"
                          name="iban"
                          value={bankDetails.iban}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter IBAN if applicable"
                        />
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Security Notice
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Your bank details will only be shown to users who have booked a consultation slot with you. Please ensure all information is accurate.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Bank Details'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
