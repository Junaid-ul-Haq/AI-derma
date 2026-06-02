'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  description?: string;
  consultationHours?: {
    startTime: string;
    endTime: string;
    days: string[];
    slotDuration: number;
  };
  professionalExperience: number;
  age: number;
}

interface BookedSlot {
  date: string;
  time: string;
}

export default function DoctorDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Handle URL parameters for pre-filled booking
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    
    if (dateParam) {
      setSelectedDate(dateParam);
    }
    if (timeParam) {
      setSelectedSlot(timeParam);
    }
  }, [searchParams]);

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
      } else if (userRole === 'USER') {
        fetchDoctor();
      }
    }
  }, [session, status, router, doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setDoctor(data.doctor);
        setBookedSlots(data.bookedSlots || []);
      } else {
        setError('Doctor not found');
      }
    } catch (err) {
      setError('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeStr);
      
      currentMin += duration;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  const getAvailableDates = () => {
    const dates: string[] = [];
    const today = new Date();
    const consultationDays = doctor?.consultationHours?.days || [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayName = dayNames[date.getDay()];
      
      if (consultationDays.includes(dayName)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const isSlotBooked = (date: string, time: string) => {
    return bookedSlots.some(slot => slot.date === date && slot.time === time);
  };

  const handleBookSlot = async () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and time slot');
      return;
    }

    setBooking(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctorId,
          slotDate: selectedDate,
          slotTime: selectedSlot,
          message: message || 'Consultation request',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Consultation booked successfully! The doctor will review your request.');
        setSelectedDate('');
        setSelectedSlot('');
        setMessage('');
        fetchDoctor();
      } else {
        setError(data.error || 'Failed to book consultation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book consultation');
    } finally {
      setBooking(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !doctor) {
    return null;
  }

  const availableDates = getAvailableDates();
  const timeSlots = doctor.consultationHours
    ? generateTimeSlots(
        doctor.consultationHours.startTime,
        doctor.consultationHours.endTime,
        doctor.consultationHours.slotDuration
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Doctors
        </button>

        {/* Doctor Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg flex-shrink-0">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {getInitials(doctor.name)}
                </span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dr. {doctor.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {doctor.professionalExperience} years of experience
              </p>
              {doctor.description && (
                <p className="text-gray-700 leading-relaxed">
                  {doctor.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Consultation</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const isSelected = selectedDate === date;
                return (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot('');
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time Slot ({doctor.consultationHours?.slotDuration || 30} minutes)
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {timeSlots.map((time) => {
                  const isBooked = isSlotBooked(selectedDate, time);
                  const isSelected = selectedSlot === time;
                  return (
                    <button
                      key={time}
                      onClick={() => !isBooked && setSelectedSlot(time)}
                      disabled={isBooked}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isBooked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              {timeSlots.length === 0 && (
                <p className="text-sm text-gray-500">No time slots available for this date</p>
              )}
            </div>
          )}

          {/* Message */}
          {selectedDate && selectedSlot && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Describe your concern or question..."
                rows={4}
              />
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBookSlot}
            disabled={!selectedDate || !selectedSlot || booking}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {booking ? 'Booking...' : 'Book Consultation'}
          </button>

        </div>
      </div>
    </div>
  );
}

