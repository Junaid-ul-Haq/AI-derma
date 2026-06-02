'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  profileImage?: string;
}

interface DoctorProfile {
  name: string;
  email: string;
  profileImage?: string;
  age: number;
  professionalExperience: number;
  phoneNumber: string;
  degreeUrl: string;
  description?: string;
  consultationHours?: {
    startTime: string;
    endTime: string;
    days: string[];
    slotDuration: number;
  };
  status: string;
}

interface Report {
  _id: string;
  createdAt: string;
  status: string;
  message?: string;
}

interface Consultation {
  _id: string;
  userId: any;
  createdAt: string;
  status: string;
  message?: string;
  doctorResponse?: string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const { data: session, update } = useSession();
  const userRole = (session?.user as any)?.role || 'USER';
  const isDoctor = userRole === 'DOCTOR';
  const isUser = userRole === 'USER';
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    profileImage: '',
  });
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({
    name: '',
    email: '',
    profileImage: '',
    age: 0,
    professionalExperience: 0,
    phoneNumber: '',
    degreeUrl: '',
    status: '',
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && session) {
      const sessionProfileImage = (session.user as any)?.profileImage || '';
      if (isDoctor) {
        setDoctorProfile({
          name: session.user?.name || '',
          email: session.user?.email || '',
          profileImage: sessionProfileImage,
          age: 0,
          professionalExperience: 0,
          phoneNumber: '',
          degreeUrl: '',
          description: '',
          consultationHours: {
            startTime: '17:00',
            endTime: '21:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            slotDuration: 30,
          },
          status: '',
        });
        fetchDoctorProfile();
        fetchDoctorConsultations();
      } else if (isUser) {
        setUserProfile({
          name: session.user?.name || '',
          email: session.user?.email || '',
          profileImage: sessionProfileImage,
        });
        fetchUserProfile();
        fetchUserReports();
      }
    }
  }, [isOpen, session, isDoctor, isUser]);

  // Update local state when session profileImage changes (for real-time updates)
  useEffect(() => {
    if (session && isOpen) {
      const sessionProfileImage = (session.user as any)?.profileImage;
      if (sessionProfileImage) {
        if (isDoctor) {
          setDoctorProfile((prev) => ({
            ...prev,
            profileImage: sessionProfileImage,
          }));
        } else {
          setUserProfile((prev) => ({
            ...prev,
            profileImage: sessionProfileImage,
          }));
        }
      }
    }
  }, [(session?.user as any)?.profileImage, isOpen, isDoctor]);

  const fetchUserProfile = async () => {
    if (!session?.user?.email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/profile?email=${session.user.email}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          name: data.name || session.user.name || '',
          email: data.email || session.user.email || '',
          // Use session image if available, otherwise use API response
          profileImage: (session.user as any)?.profileImage || data.profileImage || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorProfile = async () => {
    if (!session?.user?.email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/doctor/profile?email=${session.user.email}`);
      if (response.ok) {
        const data = await response.json();
          setDoctorProfile({
          name: data.name || session.user.name || '',
          email: data.email || session.user.email || '',
          // Use session image if available, otherwise use API response
          profileImage: (session.user as any)?.profileImage || data.profileImage || '',
          age: data.age || 0,
          professionalExperience: data.professionalExperience || 0,
          phoneNumber: data.phoneNumber || '',
          degreeUrl: data.degreeUrl || '',
          description: data.description || '',
          consultationHours: data.consultationHours || {
            startTime: '17:00',
            endTime: '21:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            slotDuration: 30,
          },
          status: data.status || '',
        });
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReports = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/user/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const fetchDoctorConsultations = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/doctor/consultations');
      if (response.ok) {
        const data = await response.json();
        setConsultations(data.consultations || []);
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imagePath = uploadData.path || uploadData.url;

      console.log('Uploaded image path:', imagePath);

      const apiEndpoint = isDoctor ? '/api/doctor/profile' : '/api/user/profile';
      const updateResponse = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: imagePath,
        }),
      });

      if (updateResponse.ok) {
        const responseData = await updateResponse.json();
        const savedImagePath = responseData.user?.profileImage || responseData.doctor?.profileImage || imagePath;
        
        console.log('Saved image path:', savedImagePath);
        
        if (isDoctor) {
          setDoctorProfile((prev) => ({ ...prev, profileImage: savedImagePath }));
        } else {
          setUserProfile((prev) => ({ ...prev, profileImage: savedImagePath }));
        }
        
        // Update session with new profileImage
        await update({
          profileImage: savedImagePath,
        });
        
        setSuccess('Profile image updated successfully');
        
        // Force session refresh and page reload to update navbar
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const errorData = await updateResponse.json();
        console.error('Update error:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isDoctor) {
        if (!doctorProfile.name.trim()) {
          setError('Name is required');
          setIsSaving(false);
          return;
        }
        if (!doctorProfile.age || doctorProfile.age < 18) {
          setError('Age must be at least 18');
          setIsSaving(false);
          return;
        }
        if (doctorProfile.professionalExperience < 0) {
          setError('Professional experience cannot be negative');
          setIsSaving(false);
          return;
        }
        if (!doctorProfile.phoneNumber.trim()) {
          setError('Phone number is required');
          setIsSaving(false);
          return;
        }

        // Ensure consultation hours are properly structured
        const consultationHours = doctorProfile.consultationHours || {
          startTime: '17:00',
          endTime: '21:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          slotDuration: 30,
        };

        // Ensure days array is not empty
        if (!consultationHours.days || consultationHours.days.length === 0) {
          consultationHours.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        }

        const response = await fetch('/api/doctor/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: doctorProfile.name,
            profileImage: doctorProfile.profileImage || null,
            age: doctorProfile.age,
            professionalExperience: doctorProfile.professionalExperience,
            phoneNumber: doctorProfile.phoneNumber,
            description: doctorProfile.description || '',
            consultationHours: consultationHours,
          }),
        });

        if (response.ok) {
          await update();
          setSuccess('Profile updated successfully');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update profile');
        }
      } else {
        if (!userProfile.name.trim()) {
          setError('Name is required');
          setIsSaving(false);
          return;
        }

        const response = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userProfile.name,
            profileImage: userProfile.profileImage || null,
          }),
        });

        if (response.ok) {
          await update();
          setSuccess('Profile updated successfully');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
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

  const getProfileImage = () => {
    // First check session (most up-to-date)
    const sessionImage = (session?.user as any)?.profileImage;
    if (sessionImage) return sessionImage;
    
    // Fallback to local state
    if (isDoctor) return doctorProfile.profileImage;
    return userProfile.profileImage;
  };

  const getProfileName = () => {
    if (isDoctor) return doctorProfile.name;
    return userProfile.name;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar with slide and scale animation */}
          <motion.div
            initial={{ x: '100%', scale: 0.95, opacity: 0 }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            exit={{ x: '100%', scale: 0.95, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
              {isDoctor && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  Doctor
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    {getProfileImage() ? (
                      <img
                        src={getProfileImage()}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {getInitials(getProfileName() || session?.user?.name || 'U')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Messages */}
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

              {/* Profile Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={isDoctor ? doctorProfile.name : userProfile.name}
                    onChange={(e) => {
                      if (isDoctor) {
                        setDoctorProfile({ ...doctorProfile, name: e.target.value });
                      } else {
                        setUserProfile({ ...userProfile, name: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={isDoctor ? doctorProfile.email : userProfile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Doctor-specific fields */}
                {isDoctor && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={doctorProfile.age || ''}
                        onChange={(e) => setDoctorProfile({ ...doctorProfile, age: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter your age"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Experience (years)
                      </label>
                      <input
                        type="number"
                        value={doctorProfile.professionalExperience || ''}
                        onChange={(e) => setDoctorProfile({ ...doctorProfile, professionalExperience: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Years of experience"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={doctorProfile.phoneNumber}
                        onChange={(e) => setDoctorProfile({ ...doctorProfile, phoneNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Professional Description
                        </label>
                        {!isEditingDescription && (
                          <button
                            onClick={() => {
                              setTempDescription(doctorProfile.description || '');
                              setIsEditingDescription(true);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={doctorProfile.description ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                            </svg>
                            {doctorProfile.description ? 'Edit' : 'Add'}
                          </button>
                        )}
                      </div>
                      
                      {isEditingDescription ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempDescription}
                            onChange={(e) => setTempDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Describe your expertise, specializations, and approach to patient care..."
                            rows={4}
                            maxLength={1000}
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {tempDescription.length}/1000 characters
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setIsEditingDescription(false);
                                  setTempDescription('');
                                }}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async () => {
                                  setDoctorProfile({ ...doctorProfile, description: tempDescription });
                                  setIsEditingDescription(false);
                                  // Auto-save the description
                                  setIsSaving(true);
                                  try {
                                    const response = await fetch('/api/doctor/profile', {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        description: tempDescription,
                                      }),
                                    });
                                    if (response.ok) {
                                      setSuccess('Description updated successfully');
                                      setTimeout(() => setSuccess(''), 3000);
                                    } else {
                                      const data = await response.json();
                                      setError(data.error || 'Failed to update description');
                                      setTimeout(() => setError(''), 3000);
                                    }
                                  } catch (err: any) {
                                    setError(err.message || 'Failed to update description');
                                    setTimeout(() => setError(''), 3000);
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }}
                                className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {doctorProfile.description ? (
                            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {doctorProfile.description}
                              </p>
                            </div>
                          ) : (
                            <div className="w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                              <p className="text-gray-400 italic text-sm">
                                No description added yet. Click "Add" to create your professional description.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Hours
                      </label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={doctorProfile.consultationHours?.startTime || '17:00'}
                              onChange={(e) => setDoctorProfile({
                                ...doctorProfile,
                                consultationHours: {
                                  ...doctorProfile.consultationHours!,
                                  startTime: e.target.value,
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">End Time</label>
                            <input
                              type="time"
                              value={doctorProfile.consultationHours?.endTime || '21:00'}
                              onChange={(e) => setDoctorProfile({
                                ...doctorProfile,
                                consultationHours: {
                                  ...doctorProfile.consultationHours!,
                                  endTime: e.target.value,
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-2">Available Days</label>
                          <div className="flex flex-wrap gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                              <label key={day} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={doctorProfile.consultationHours?.days?.includes(day) || false}
                                  onChange={(e) => {
                                    const currentDays = doctorProfile.consultationHours?.days || [];
                                    const newDays = e.target.checked
                                      ? [...currentDays, day]
                                      : currentDays.filter(d => d !== day);
                                    setDoctorProfile({
                                      ...doctorProfile,
                                      consultationHours: {
                                        ...doctorProfile.consultationHours!,
                                        days: newDays,
                                      }
                                    });
                                  }}
                                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{day.slice(0, 3)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Slot Duration (minutes)</label>
                          <input
                            type="number"
                            value={doctorProfile.consultationHours?.slotDuration || 30}
                            onChange={(e) => setDoctorProfile({
                              ...doctorProfile,
                              consultationHours: {
                                ...doctorProfile.consultationHours!,
                                slotDuration: parseInt(e.target.value) || 30,
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            min="15"
                            max="60"
                            step="15"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doctorProfile.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800'
                            : doctorProfile.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doctorProfile.status}
                        </span>
                      </div>
                    </div>

                    {doctorProfile.degreeUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree Certificate
                        </label>
                        <a
                          href={doctorProfile.degreeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          View Degree Certificate
                        </a>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {/* Reports/Consultations Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isDoctor ? 'Your Consultations' : 'Your Reports'}
                </h3>
                {isDoctor ? (
                  consultations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No consultations yet</p>
                      <p className="text-sm mt-2">Consultations assigned to you will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consultations.map((consultation) => (
                        <div
                          key={consultation._id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Consultation #{consultation._id.slice(-6)}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                consultation.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : consultation.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {consultation.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(consultation.createdAt).toLocaleDateString()}
                          </p>
                          {consultation.message && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {consultation.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  reports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No reports yet</p>
                      <p className="text-sm mt-2">Your AI-generated reports will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((report) => (
                        <div
                          key={report._id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Report #{report._id.slice(-6)}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                report.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : report.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                          {report.message && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {report.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Sign Out Button at the end */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    onClose();
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-semibold">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileSidebar;
