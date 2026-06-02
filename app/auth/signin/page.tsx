'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'user' | 'doctor'>(searchParams.get('type') === 'doctor' ? 'doctor' : 'user');
  
  // User login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Doctor login state
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'doctor') {
      setActiveTab('doctor');
    }
  }, [searchParams]);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        // Use replace instead of push to avoid back button issues
        const session = await getSession();
        if (session) {
          const userRole = (session.user as any)?.role;
          if (userRole === 'ADMIN') {
            router.replace('/admin/dashboard');
          } else if (userRole === 'DOCTOR') {
            router.replace('/doctor/dashboard');
          } else {
            router.replace('/user/dashboard');
          }
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First check if password setup is needed
      const checkRes = await fetch('/api/doctors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: doctorEmail,
          password: doctorPassword || undefined,
          temporaryPassword: temporaryPassword || undefined,
        }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setError(checkData.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (checkData.needsPasswordSetup) {
        setNeedsPasswordSetup(true);
        setLoading(false);
        return;
      }

      // If password is set, authenticate with NextAuth
      const result = await signIn('credentials', {
        email: doctorEmail,
        password: doctorPassword || temporaryPassword,
        isDoctor: true,
        temporaryPassword: temporaryPassword || undefined,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        const session = await getSession();
        if (session) {
          const userRole = (session.user as any)?.role;
          if (userRole === 'DOCTOR') {
            router.replace('/doctor/dashboard');
          } else {
            setError('Invalid credentials');
          }
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/doctors/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: doctorEmail,
          password: newPassword,
          temporaryPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to set password');
      } else {
        // After setting password, automatically log in
        const result = await signIn('credentials', {
          email: doctorEmail,
          password: newPassword,
          isDoctor: true,
          redirect: false,
        });

        if (result?.error) {
          setError('Password set but login failed. Please try logging in.');
          setNeedsPasswordSetup(false);
        } else {
          const session = await getSession();
          if (session) {
            const userRole = (session.user as any)?.role;
            if (userRole === 'DOCTOR') {
              router.replace('/doctor/dashboard');
            }
          }
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          type: activeTab,
        }),
      });

      if (res.ok) {
        setOtpSent(true);
        alert('OTP sent to your email');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp,
          type: activeTab,
        }),
      });

      if (res.ok) {
        // OTP verified, now show reset password form
        setResetPassword('show');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid OTP');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetPassword !== confirmResetPassword) {
      setError('Passwords do not match');
      return;
    }
    if (resetPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp,
          newPassword: resetPassword,
          type: activeTab,
        }),
      });

      if (res.ok) {
        alert('Password reset successfully! Please login.');
        setShowForgotPassword(false);
        setForgotEmail('');
        setOtp('');
        setOtpSent(false);
        setResetPassword('');
        setConfirmResetPassword('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (needsPasswordSetup) {
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
            <button
              onClick={() => setNeedsPasswordSetup(false)}
              className="inline-flex items-center text-white hover:text-blue-200 transition-colors duration-200 drop-shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back to Login</span>
            </button>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h2>
              <p className="text-gray-600 text-sm">Welcome! Please set a secure password for your doctor account.</p>
            </div>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter new password (min. 6 characters)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Re-enter your new password"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-sm"
            >
              {loading ? 'Setting Password...' : 'Set Password & Sign In'}
            </button>
          </form>
          </div>
        </div>
      </div>
    );
  }

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Welcome Back</h2>
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
              User Login
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
              Doctor Login
            </button>
          </div>

          <div className="p-8">
            {!showForgotPassword ? (
              <>
                {activeTab === 'user' ? (
                  <form onSubmit={handleUserLogin} className="space-y-6">
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
                    {error && <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-white/90 disabled:opacity-50 font-semibold transition-all"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="w-full text-sm text-white/80 hover:text-white transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleDoctorLogin} className="space-y-6">
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
                      <label className="block text-sm font-medium text-white mb-2">
                        {temporaryPassword ? 'Temporary Password (from email)' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={temporaryPassword || doctorPassword}
                        onChange={(e) => {
                          if (temporaryPassword) {
                            setTemporaryPassword(e.target.value);
                          } else {
                            setDoctorPassword(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                        required
                        placeholder={temporaryPassword ? 'Enter temporary password from approval email' : 'Enter your password'}
                      />
                      {!temporaryPassword ? (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setTemporaryPassword('temp')}
                            className="text-sm text-white/80 hover:text-white transition-colors underline"
                          >
                            First time? Use temporary password from email
                          </button>
                          <p className="text-xs text-white/70 mt-1">
                            New doctors: Check your email for the temporary password sent after approval
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded text-xs text-yellow-100">
                          <p className="font-medium">First Login Instructions:</p>
                          <p className="mt-1">1. Enter the temporary password from your approval email</p>
                          <p>2. You'll be asked to set your own password after login</p>
                        </div>
                      )}
                    </div>
                    {error && <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-white/90 disabled:opacity-50 font-semibold transition-all"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="w-full text-sm text-white/80 hover:text-white transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-white/80">
                    Don't have an account?{' '}
                    <Link
                      href={`/auth/signup?type=${activeTab}`}
                      className="font-medium text-white hover:text-white/80 transition-colors"
                    >
                      {activeTab === 'user' ? 'Sign up as User' : 'Sign up as Doctor'}
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
                {!otpSent ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    {error && <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-white/90 font-semibold transition-all"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {resetPassword === 'show' ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Enter OTP</label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 text-center text-lg tracking-widest"
                            placeholder="000000"
                            required
                            maxLength={6}
                          />
                        </div>
                        {error && <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded">{error}</p>}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-white/90 font-semibold transition-all"
                        >
                          {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-4">
                        <div className="relative">
                          <label className="block text-sm font-medium text-white mb-2">New Password</label>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                            placeholder="Enter new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-200 focus:outline-none"
                          >
                            {showNewPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmResetPassword}
                            onChange={(e) => setConfirmResetPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                            placeholder="Confirm new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-200 focus:outline-none"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {error && <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded">{error}</p>}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-white/90 font-semibold transition-all"
                        >
                          {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setOtpSent(false);
                    setError('');
                    setResetPassword('');
                    setConfirmResetPassword('');
                  }}
                  className="w-full text-sm text-white/80 hover:text-white transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
