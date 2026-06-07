'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';

interface Profile {
  name: string;
  email: string;
  profileImage: string | null;
  age: number;
  professionalExperience: number;
  phoneNumber: string;
  description: string;
  consultationHours: {
    startTime: string;
    endTime: string;
    days: string[];
    slotDuration: number;
  };
  bankDetails: {
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    iban: string;
  };
  status: string;
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'hours' | 'bank'>('info');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'DOCTOR') {
      router.replace('/auth/signin');
      return;
    }
    fetchProfile();
  }, [session, status]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/profile');
      const data = await res.json();
      if (res.ok) setProfile(data);
      else setError(data.error || 'Failed to load profile');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:                   profile.name,
          age:                    profile.age,
          professionalExperience: profile.professionalExperience,
          phoneNumber:            profile.phoneNumber,
          description:            profile.description,
          consultationHours:      profile.consultationHours,
          bankDetails:            profile.bankDetails,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Profile saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    if (!profile) return;
    const days = profile.consultationHours.days.includes(day)
      ? profile.consultationHours.days.filter(d => d !== day)
      : [...profile.consultationHours.days, day];
    setProfile({ ...profile, consultationHours: { ...profile.consultationHours, days } });
  };

  const set = (field: string, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const setBank = (field: string, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, bankDetails: { ...profile.bankDetails, [field]: value } });
  };

  const setHours = (field: string, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, consultationHours: { ...profile.consultationHours, [field]: value } });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar role="DOCTOR" />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white";

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar role="DOCTOR" />

      <main className="md:ml-64 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-1">Manage your information, schedule and payment details</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {error   && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">✓ {success}</div>}

            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden flex-shrink-0">
                {profile.profileImage
                  ? <img src={profile.profileImage} alt={profile.name} className="h-16 w-16 object-cover rounded-full" />
                  : profile.name?.[0]?.toUpperCase()
                }
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">Dr. {profile.name}</p>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${profile.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {profile.status}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {([
                { key: 'info',  label: '👤 Personal Info' },
                { key: 'hours', label: '🕐 Consultation Hours' },
                { key: 'bank',  label: '🏦 Bank Details' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Personal Info ── */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg">Personal Information</h2>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input type="text" value={profile.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Dr. Full Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input type="text" value={profile.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} className={inputCls} placeholder="+92 300 0000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input type="number" value={profile.age} onChange={e => set('age', Number(e.target.value))} className={inputCls} min={18} max={100} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" value={profile.professionalExperience} onChange={e => set('professionalExperience', Number(e.target.value))} className={inputCls} min={0} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Description</label>
                  <textarea
                    value={profile.description}
                    onChange={e => set('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                    placeholder="Brief description about your specialization, expertise and services..."
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{profile.description.length}/1000</p>
                </div>
              </div>
            )}

            {/* ── Tab: Consultation Hours ── */}
            {activeTab === 'hours' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg">Consultation Schedule</h2>

                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input type="time" value={profile.consultationHours.startTime} onChange={e => setHours('startTime', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input type="time" value={profile.consultationHours.endTime} onChange={e => setHours('endTime', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Slot Duration (min)</label>
                    <select value={profile.consultationHours.slotDuration} onChange={e => setHours('slotDuration', Number(e.target.value))} className={inputCls}>
                      {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} minutes</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          profile.consultationHours.days.includes(day)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Preview for patients:</p>
                  <p>{profile.consultationHours.days.join(', ')} · {profile.consultationHours.startTime} – {profile.consultationHours.endTime} · {profile.consultationHours.slotDuration} min slots</p>
                </div>
              </div>
            )}

            {/* ── Tab: Bank Details ── */}
            {activeTab === 'bank' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Bank / Payment Details</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      These details are shown to patients when booking a consultation so they can make payment before the appointment.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Title <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={profile.bankDetails.accountTitle}
                        onChange={e => setBank('accountTitle', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Dr. Muhammad Ali"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={profile.bankDetails.bankName}
                        onChange={e => setBank('bankName', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. HBL, Meezan Bank, JazzCash"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={profile.bankDetails.accountNumber}
                        onChange={e => setBank('accountNumber', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. 0312-1234567 or account number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">IBAN <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input
                        type="text"
                        value={profile.bankDetails.iban}
                        onChange={e => setBank('iban', e.target.value)}
                        className={inputCls}
                        placeholder="PK00XXXX0000000000000000"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-semibold mb-1">⚠️ Important</p>
                    <p>Make sure your bank details are correct. Patients will send payment to these details and upload a screenshot for verification. Incorrect details will delay or prevent payments.</p>
                  </div>
                </div>

                {/* Preview what patient sees */}
                {profile.bankDetails.accountNumber && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-semibold text-gray-500 mb-3">Preview — what patients see when booking:</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-amber-800 mb-2">💳 Payment Details</p>
                      <div className="text-sm text-amber-700 space-y-1">
                        <p><span className="font-medium">Bank:</span> {profile.bankDetails.bankName || '—'}</p>
                        <p><span className="font-medium">Account Title:</span> {profile.bankDetails.accountTitle || '—'}</p>
                        <p><span className="font-medium">Account Number:</span> {profile.bankDetails.accountNumber}</p>
                        {profile.bankDetails.iban && <p><span className="font-medium">IBAN:</span> {profile.bankDetails.iban}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Patient transfers money here, then uploads a screenshot as proof during booking.</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom save button */}
            <div className="flex justify-end pb-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
