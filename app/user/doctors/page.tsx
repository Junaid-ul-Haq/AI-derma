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
  bankDetails?: {
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    iban: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function UserDoctorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const generateTimeSlots = (doctor: Doctor, date: string) => {
    if (!doctor.consultationHours) return [];

    const { startTime, endTime, slotDuration } = doctor.consultationHours;
    const slots: TimeSlot[] = [];
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    const currentTime = start;
    while (currentTime < end) {
      slots.push({
        time: currentTime.toTimeString().slice(0, 5),
        available: Math.random() > 0.3 // Simulate availability (70% available)
      });
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }
    
    return slots;
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    const slots = generateTimeSlots(doctor, today);
    setAvailableSlots(slots);
  };

  const handleBookConsultation = (doctor: Doctor, timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowPaymentModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentFile(file);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedDoctor || !paymentFile || !selectedDate || !selectedTimeSlot) {
      setError('Please select a time slot and upload payment screenshot');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('doctorId', selectedDoctor._id);
      formData.append('slotDate', selectedDate);
      formData.append('slotTime', selectedTimeSlot);
      formData.append('message', 'Consultation request with payment proof');
      formData.append('paymentScreenshot', paymentFile);

      const response = await fetch('/api/consultations/payment', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Success - reset states and show success message
        setShowPaymentModal(false);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTimeSlot('');
        setPaymentFile(null);
        
        // Show success message
        alert('Consultation request submitted successfully! The doctor will verify your payment and confirm the booking.');
        
        // Refresh doctors list
        fetchDoctors();
      } else {
        setError(data.error || 'Failed to submit consultation request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit consultation request');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading doctors...</p>
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
                Available Doctors
              </h1>
              <p className="text-xl text-gray-600">
                Book an online consultation with our expert dermatologists
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading available doctors...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <button
                  onClick={fetchDoctors}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Doctors Grid */}
            {!loading && !error && doctors.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {doctors.map((doctor) => (
                  <motion.div
                    key={doctor._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Doctor Profile */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          {doctor.profileImage ? (
                            <img
                              src={doctor.profileImage}
                              alt={doctor.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">
                            {doctor.professionalExperience} years experience
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {doctor.description || 'Experienced dermatologist providing expert skin care consultations.'}
                      </p>

                      {/* Consultation Hours */}
                      {doctor.consultationHours && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Available Hours:</h4>
                          <div className="text-xs text-gray-600">
                            <p>Days: {doctor.consultationHours.days.join(', ')}</p>
                            <p>Time: {doctor.consultationHours.startTime} - {doctor.consultationHours.endTime}</p>
                            <p>Slot Duration: {doctor.consultationHours.slotDuration} minutes</p>
                          </div>
                        </div>
                      )}

                      {/* Book Button */}
                      <button
                        onClick={() => handleDoctorSelect(doctor)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Available Slots
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Booking Modal */}
            {selectedDoctor && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Book Consultation</h2>
                        <p className="text-gray-600">Dr. {selectedDoctor.name}</p>
                      </div>
                      <button
                        onClick={() => setSelectedDoctor(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setSelectedDate(newDate);
                          const slots = generateTimeSlots(selectedDoctor, newDate);
                          setAvailableSlots(slots);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Available Time Slots</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => slot.available && handleBookConsultation(selectedDoctor, slot.time)}
                            disabled={!slot.available}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              slot.available
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                      {availableSlots.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No available slots for the selected date.
                        </p>
                      )}
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> After selecting a time slot, you'll be taken to the booking page to confirm your consultation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Payment Verification Modal */}
            {showPaymentModal && selectedDoctor && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
                        <p className="text-gray-600">Dr. {selectedDoctor.name} - {selectedDate} at {selectedTimeSlot}</p>
                      </div>
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Bank Details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details for Payment</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        {selectedDoctor.bankDetails ? (
                          <div className="space-y-2">
                            <p><span className="font-medium">Account Title:</span> {selectedDoctor.bankDetails.accountTitle}</p>
                            <p><span className="font-medium">Account Number:</span> {selectedDoctor.bankDetails.accountNumber}</p>
                            <p><span className="font-medium">Bank Name:</span> {selectedDoctor.bankDetails.bankName}</p>
                            {selectedDoctor.bankDetails.iban && (
                              <p><span className="font-medium">IBAN:</span> {selectedDoctor.bankDetails.iban}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">Bank details not available. Please contact the doctor directly.</p>
                        )}
                      </div>
                    </div>

                    {/* Payment Instructions */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Instructions</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                          <li>Transfer the consultation fee to the bank account shown above</li>
                          <li>Take a screenshot of the payment confirmation</li>
                          <li>Upload the screenshot below for verification</li>
                          <li>The doctor will verify your payment and confirm the booking</li>
                        </ol>
                      </div>
                    </div>

                    {/* Payment Screenshot Upload */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Payment Screenshot</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 mb-2">Click to upload payment screenshot</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="payment-screenshot"
                        />
                        <label
                          htmlFor="payment-screenshot"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          Choose File
                        </label>
                        {paymentFile && (
                          <p className="mt-2 text-sm text-green-600">
                            Selected: {paymentFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePaymentSubmit}
                        disabled={!paymentFile || uploading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? 'Submitting...' : 'Submit Payment Proof'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
