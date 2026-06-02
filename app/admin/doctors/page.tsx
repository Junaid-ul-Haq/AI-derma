'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';
import { useAlert } from '@/components/AlertProvider';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  age: number;
  professionalExperience: number;
  phoneNumber: string;
  degreeUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  suspended?: boolean;
  description?: string;
  profileImage?: string;
  consultationHours?: {
    startTime: string;
    endTime: string;
    days: string[];
    slotDuration: number;
  };
  createdAt: string;
}

interface DoctorDetails extends Doctor {
  consultationsCount: number;
  pendingConsultations: number;
  completedConsultations: number;
}

export default function AdminDoctorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const alertContext = useAlert();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetails | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Safe alert wrapper that handles errors gracefully
  const showAlert = async (options: any) => {
    try {
      if (alertContext?.showAlert) {
        return await alertContext.showAlert(options);
      } else {
        // Fallback to native alert if context not available
        alert(options.message || options.title || 'Alert');
        return true;
      }
    } catch (error) {
      console.error('Alert error:', error);
      // Fallback to native alert on error
      alert(options.message || options.title || 'Alert');
      return true;
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/upload');
      } else {
        fetchDoctors();
      }
    }
  }, [status, session, router]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/admin/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId: string) => {
    setProcessing(doctorId);
    try {
      console.log('Approving doctor with ID:', doctorId);
      const res = await fetch(`/api/admin/doctors/${doctorId}/approve`, {
        method: 'POST',
      });

      const data = await res.json();
      console.log('Approve response:', { status: res.status, data });

      if (res.ok) {
        try {
          await showAlert({
            type: 'success',
            title: 'Success',
            message: 'Doctor approved! Email sent with login credentials.',
          });
        } catch (alertError) {
          console.error('Alert error:', alertError);
          alert('Doctor approved! Email sent with login credentials.');
        }
        fetchDoctors();
      } else {
        const errorMsg = data.error || data.message || 'Failed to approve doctor';
        console.error('Approve failed:', { status: res.status, error: errorMsg, data });
        
        // Handle specific error cases
        let displayMessage = errorMsg;
        if (errorMsg.includes('already approved')) {
          displayMessage = 'This doctor is already approved. Refreshing the list...';
          // Refresh the list to update the UI
          setTimeout(() => fetchDoctors(), 1000);
        }
        
        try {
          await showAlert({
            type: 'error',
            title: 'Error',
            message: displayMessage,
          });
        } catch (alertError) {
          console.error('Alert error:', alertError);
          alert(`Error: ${displayMessage}`);
        }
      }
    } catch (error: any) {
      console.error('Error in handleApprove:', error);
      const errorMsg = error.message || 'Error approving doctor';
      try {
        await showAlert({
          type: 'error',
          title: 'Error',
          message: errorMsg,
        });
      } catch (alertError) {
        console.error('Alert error:', alertError);
        alert(`Error: ${errorMsg}`);
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (doctorId: string) => {
    const rejectionReason = prompt('Enter rejection reason:');
    if (!rejectionReason || rejectionReason.trim() === '') {
      return;
    }

    setProcessing(doctorId);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
 
      const data = await res.json();

      if (res.ok) {
        try {
          await showAlert({
            type: 'success',
            title: 'Success',
            message: 'Doctor rejected successfully',
          });
        } catch (alertError) {
          alert('Doctor rejected successfully');
        }
        fetchDoctors();
      } else {
        console.error('Reject error:', data);
        try {
          await showAlert({
            type: 'error',
            title: 'Error',
            message: data.error || 'Failed to reject doctor',
          });
        } catch (alertError) {
          alert(`Error: ${data.error || 'Failed to reject doctor'}`);
        }
      }
    } catch (error) {
      console.error('Reject error:', error);
      try {
        await showAlert({
          type: 'error',
          title: 'Error',
          message: 'Error rejecting doctor: ' + (error as Error).message,
        });
      } catch (alertError) {
        alert(`Error: ${(error as Error).message}`);
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDoctor = async (doctorId: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDoctor(data.doctor);
        setShowDoctorModal(true);
      } else {
        await showAlert({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch doctor details',
        });
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      await showAlert({
        type: 'error',
        title: 'Error',
        message: 'Error fetching doctor details',
      });
    }
  };

  const handleSuspend = async () => {
    if (!selectedDoctor) return;

    const action = selectedDoctor.suspended ? 'unsuspend' : 'suspend';
    const confirmMessage = selectedDoctor.suspended
      ? 'Are you sure you want to unsuspend this doctor?'
      : 'Are you sure you want to suspend this doctor? They will not be able to access their account.';

    const confirmed = await showAlert({
      type: 'warning',
      title: 'Confirm Action',
      message: confirmMessage,
      showCancel: true,
      confirmText: selectedDoctor.suspended ? 'Unsuspend' : 'Suspend',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setSuspending(true);
    try {
      const res = await fetch(`/api/admin/doctors/${selectedDoctor._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !selectedDoctor.suspended }),
      });

      if (res.ok) {
        await showAlert({
          type: 'success',
          title: 'Success',
          message: `Doctor ${action === 'suspend' ? 'suspended' : 'unsuspended'} successfully`,
        });
        fetchDoctors();
        // Refresh doctor details
        handleViewDoctor(selectedDoctor._id);
      } else {
        const data = await res.json();
        await showAlert({
          type: 'error',
          title: 'Error',
          message: data.error || `Failed to ${action} doctor`,
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing doctor:`, error);
      await showAlert({
        type: 'error',
        title: 'Error',
        message: `Error ${action}ing doctor`,
      });
    } finally {
      setSuspending(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    const confirmed = await showAlert({
      type: 'warning',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete Dr. ${selectedDoctor.name} permanently? This action cannot be undone and will delete all associated data including consultations.`,
      showCancel: true,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/doctors/${selectedDoctor._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await showAlert({
          type: 'success',
          title: 'Success',
          message: 'Doctor deleted permanently',
        });
        setShowDoctorModal(false);
        setSelectedDoctor(null);
        fetchDoctors();
      } else {
        const data = await res.json();
        await showAlert({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to delete doctor',
        });
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      await showAlert({
        type: 'error',
        title: 'Error',
        message: 'Error deleting doctor',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingDoctors = doctors.filter(d => d.status === 'PENDING');
  const approvedDoctors = doctors.filter(d => d.status === 'APPROVED');
  const rejectedDoctors = doctors.filter(d => d.status === 'REJECTED');

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
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Doctor Management</h1>
                  <p className="text-lg text-gray-600 mt-2">Review and manage doctor registrations</p>
                </div>
                <Link
                  href="/admin/doctors/diagnose"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Diagnose
                </Link>
              </div>
            </div>
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingDoctors.length}</p>
              </div>
              <div className="bg-yellow-200 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Approved Doctors</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{approvedDoctors.length}</p>
              </div>
              <div className="bg-green-200 rounded-full p-3">
                <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Rejected Doctors</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{rejectedDoctors.length}</p>
              </div>
              <div className="bg-red-200 rounded-full p-3">
                <svg className="w-8 h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Doctors Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 rounded-lg p-2">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
                <p className="text-sm text-gray-600">{pendingDoctors.length} doctor{pendingDoctors.length !== 1 ? 's' : ''} awaiting review</p>
              </div>
            </div>
          </div>

          {pendingDoctors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No pending doctor registrations</p>
              <p className="text-gray-400 text-sm mt-2">All doctor requests have been reviewed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-yellow-500 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-yellow-100 rounded-full p-3">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{doctor.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>

                    {/* Doctor Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase">Age</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{doctor.age} years</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase">Experience</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{doctor.professionalExperience} years</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                        <p className="text-xs font-medium text-gray-500 uppercase">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{doctor.phoneNumber}</p>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Applied: {new Date(doctor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {/* Degree Document Link */}
                    <div className="mb-6">
                      <a
                        href={doctor.degreeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Degree Document
                      </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDoctor(doctor._id);
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(doctor._id);
                          }}
                          disabled={processing === doctor._id}
                          className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        >
                          {processing === doctor._id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(doctor._id);
                          }}
                          disabled={processing === doctor._id}
                          className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Doctors Section */}
        {approvedDoctors.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Approved Doctors</h2>
                <p className="text-sm text-gray-600">{approvedDoctors.length} active doctor{approvedDoctors.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-500">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-50 to-green-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedDoctors.map((doctor) => (
                      <tr 
                        key={doctor._id} 
                        className="hover:bg-green-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => handleViewDoctor(doctor._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-green-100 rounded-full p-2 mr-3">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{doctor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doctor.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doctor.professionalExperience} years</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Rejected Doctors Section */}
        {rejectedDoctors.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 rounded-lg p-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rejected Doctors</h2>
                <p className="text-sm text-gray-600">{rejectedDoctors.length} rejected application{rejectedDoctors.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-red-500">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-red-50 to-red-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rejectedDoctors.map((doctor) => (
                      <tr key={doctor._id} className="hover:bg-red-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-red-100 rounded-full p-2 mr-3">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{doctor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doctor.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Rejected
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
          </div>
        </motion.div>
      </main>

      {/* Doctor Details Modal */}
      {showDoctorModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Doctor Details</h3>
                <button
                  onClick={() => {
                    setShowDoctorModal(false);
                    setSelectedDoctor(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  {selectedDoctor.profileImage ? (
                    <img
                      src={selectedDoctor.profileImage}
                      alt={selectedDoctor.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-green-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-600">
                      {selectedDoctor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Dr. {selectedDoctor.name}</h4>
                    <p className="text-sm text-gray-600">{selectedDoctor.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedDoctor.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : selectedDoctor.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedDoctor.status}
                      </span>
                      {selectedDoctor.suspended && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Age</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDoctor.age} years</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDoctor.professionalExperience} years</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDoctor.phoneNumber}</p>
                  </div>
                </div>

                {selectedDoctor.description && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Professional Description</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">{selectedDoctor.description}</p>
                  </div>
                )}

                {selectedDoctor.consultationHours && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Consultation Hours</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Days:</strong> {selectedDoctor.consultationHours.days.join(', ')}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Time:</strong> {selectedDoctor.consultationHours.startTime} - {selectedDoctor.consultationHours.endTime}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Slot Duration:</strong> {selectedDoctor.consultationHours.slotDuration} minutes
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Consultations</p>
                    <p className="text-lg font-bold text-blue-600">{selectedDoctor.consultationsCount}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Pending</p>
                    <p className="text-lg font-bold text-yellow-600">{selectedDoctor.pendingConsultations}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Completed</p>
                    <p className="text-lg font-bold text-green-600">{selectedDoctor.completedConsultations}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 pt-4 border-t">
                  <Link
                    href={selectedDoctor.degreeUrl}
                    target="_blank"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                  >
                    View Degree Document
                  </Link>
                  <div className="flex space-x-3">
                    {selectedDoctor.status === 'APPROVED' && (
                      <button
                        onClick={handleSuspend}
                        disabled={suspending}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                          selectedDoctor.suspended
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        } disabled:opacity-50`}
                      >
                        {suspending
                          ? 'Processing...'
                          : selectedDoctor.suspended
                          ? 'Unsuspend Doctor'
                          : 'Suspend Doctor'}
                      </button>
                    )}
                    <button
                      onClick={handleDeleteDoctor}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete Doctor'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

