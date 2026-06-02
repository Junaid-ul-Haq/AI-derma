'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'user' | 'doctor'>(searchParams.get('type') === 'doctor' ? 'doctor' : 'user');

  // User signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Doctor signup state
  const [doctorName, setDoctorName] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [age, setAge] = useState('');
  const [experience, setExperience] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [degreeUrl, setDegreeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'doctor') {
      setActiveTab('doctor');
    }
  }, [searchParams]);

  const handleUserSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Signup: Sending request...', { name, email });
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('Signup: Response received', { status: response.status, data });

      if (!response.ok) {
        console.error('Signup: Error response', data);
        setError(data.error || 'An error occurred');
        setLoading(false);
        return;
      }

      // Success - redirect to login page
      console.log('Signup: Success, redirecting to login');
      alert('Account created successfully! Please login to continue.');
      router.replace('/auth/signin');
    } catch (error) {
      console.error('Signup: Exception occurred', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to upload file');
        return;
      }

      setDegreeUrl(data.url);
    } catch (error) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDoctorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!degreeFile) {
      setError('Please upload your degree document');
      setLoading(false);
      return;
    }

    if (!degreeUrl) {
      setError('Please wait for file upload to complete');
      setLoading(false);
      return;
    }

    if (parseInt(age) < 18 || parseInt(age) > 100) {
      setError('Age must be between 18 and 100');
      setLoading(false);
      return;
    }

    if (parseInt(experience) < 0) {
      setError('Professional experience cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/doctors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: doctorName,
          email: doctorEmail,
          age: parseInt(age),
          professionalExperience: parseInt(experience),
          phoneNumber,
          degreeUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
        setLoading(false);
        return;
      }

      alert('Registration submitted successfully! Your request is pending admin approval. You will receive an email with login credentials once approved.');
      router.replace('/auth/signin?type=doctor');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center"
      style={{ backgroundImage: `url('/login signup.jpg')` }}
    >
      {/* Light overlay */}
      <div className="absolute inset-0 bg-blue-900/40"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-blue-200 transition-colors duration-200 drop-shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/30">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Create Account</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
          {/* Tabs */}
          <div className="flex border-b border-white/20">
            <button
              onClick={() => {
                setActiveTab('user');
                setError('');
              }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'user'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              User Signup
            </button>
            <button
              onClick={() => {
                setActiveTab('doctor');
                setError('');
              }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'doctor'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Doctor Signup
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'user' ? (
              <form onSubmit={handleUserSignup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {error && <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-white/90 disabled:opacity-50 font-semibold transition-all"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleDoctorSignup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={doctorEmail}
                    onChange={(e) => setDoctorEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Enter your age"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Professional Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Years of experience"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Upload Degree Document</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDegreeFile(file);
                        handleFileUpload(file);
                      }
                    }}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/30 file:text-white hover:file:bg-white/40 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    required
                  />
                  {uploading && <p className="text-sm text-white/80 mt-2">Uploading...</p>}
                  {degreeUrl && (
                    <p className="text-sm text-white mt-2">✓ File uploaded successfully</p>
                  )}
                </div>
                {error && <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || uploading || !degreeUrl}
                  className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-white/90 disabled:opacity-50 font-semibold transition-all"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
                <p className="text-xs text-white/70 text-center">
                  Your registration will be reviewed by an administrator. You will receive an email with login credentials once approved.
                </p>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-white/80">
                Already have an account?{' '}
                <Link
                  href={`/auth/signin?type=${activeTab}`}
                  className="font-medium text-white hover:text-white/80 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
