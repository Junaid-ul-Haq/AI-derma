'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Doctor {
  _id: string;
  name: string;
  description?: string;
  professionalExperience: number;
  profileImage?: string;
  consultationHours?: {
    startTime: string;
    endTime: string;
    days: string[];
    slotDuration: number;
  };
  bankDetails?: {
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    iban: string;
  };
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function generateTimeSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += duration;
  }
  return slots;
}

export default function BookConsultationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [doctors,       setDoctors]       = useState<Doctor[]>([]);
  const [selectedDoc,   setSelectedDoc]   = useState<Doctor | null>(null);
  const [slotDate,      setSlotDate]      = useState('');
  const [slotTime,      setSlotTime]      = useState('');
  const [message,       setMessage]       = useState('');
  const [paymentFile,   setPaymentFile]   = useState<File | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [fetchingDocs,  setFetchingDocs]  = useState(true);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/signin');
  }, [status]);

  useEffect(() => {
    fetch('/api/doctors/list')
      .then(r => r.json())
      .then(d => setDoctors(d.doctors ?? []))
      .finally(() => setFetchingDocs(false));
  }, []);

  const availableDays   = selectedDoc?.consultationHours?.days ?? DAYS_ORDER;
  const availableSlots  = selectedDoc?.consultationHours
    ? generateTimeSlots(
        selectedDoc.consultationHours.startTime,
        selectedDoc.consultationHours.endTime,
        selectedDoc.consultationHours.slotDuration
      )
    : [];

  const isDayAvailable = (dateStr: string) => {
    if (!dateStr) return true;
    const day = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    return availableDays.includes(day);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDoc) return setError('Please select a doctor.');
    if (!slotDate || !slotTime) return setError('Please select a date and time.');
    if (!paymentFile) return setError('Please upload a payment screenshot.');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('doctorId',         selectedDoc._id);
      fd.append('slotDate',         slotDate);
      fd.append('slotTime',         slotTime);
      fd.append('message',          message);
      fd.append('paymentScreenshot', paymentFile);

      const res = await fetch('/api/consultations/payment', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setSuccess('Consultation booked! Waiting for doctor to accept.');
      setTimeout(() => router.push('/user/consultations'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetchingDocs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/user/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Book a Consultation</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Doctor selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor</label>
              <div className="grid gap-3">
                {doctors.map(doc => (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => { setSelectedDoc(doc); setSlotDate(''); setSlotTime(''); }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDoc?._id === doc._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {doc.profileImage
                        ? <img src={doc.profileImage} alt={doc.name} className="h-12 w-12 object-cover rounded-full" />
                        : <span className="text-blue-600 font-bold text-lg">{doc.name[0]}</span>
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Dr. {doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.professionalExperience} yrs experience</p>
                      {doc.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{doc.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bank details for payment */}
            {selectedDoc?.bankDetails?.accountNumber && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">Payment Details</p>
                <div className="text-sm text-amber-700 space-y-1">
                  <p><span className="font-medium">Bank:</span> {selectedDoc.bankDetails.bankName}</p>
                  <p><span className="font-medium">Account:</span> {selectedDoc.bankDetails.accountTitle}</p>
                  <p><span className="font-medium">Number:</span> {selectedDoc.bankDetails.accountNumber}</p>
                  {selectedDoc.bankDetails.iban && <p><span className="font-medium">IBAN:</span> {selectedDoc.bankDetails.iban}</p>}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
              <input
                type="date"
                value={slotDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => { setSlotDate(e.target.value); setSlotTime(''); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
              {slotDate && !isDayAvailable(slotDate) && (
                <p className="text-red-500 text-xs mt-1">
                  Doctor is not available on {new Date(slotDate).toLocaleDateString('en-US', { weekday: 'long' })}s.
                  Available days: {availableDays.join(', ')}
                </p>
              )}
            </div>

            {/* Time slot */}
            {slotDate && isDayAvailable(slotDate) && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSlotTime(slot)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        slotTime === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason/message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Symptoms</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Describe your symptoms or reason for consultation..."
              />
            </div>

            {/* Payment screenshot */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Screenshot</label>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                {paymentFile
                  ? <p className="text-sm text-green-600 font-medium">✓ {paymentFile.name}</p>
                  : <>
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload payment proof</p>
                    </>
                }
                <input type="file" accept="image/*" className="hidden" onChange={e => setPaymentFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            {error   && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-green-600 text-sm bg-green-50 border border-green-200 px-4 py-2 rounded-lg">{success}</p>}

            <button
              type="submit"
              disabled={loading || !selectedDoc || !slotDate || !slotTime || !paymentFile}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Booking...' : 'Book Consultation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
