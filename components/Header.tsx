'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProfileSidebar from './ProfileSidebar';

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  
  const isUserDashboard = pathname === '/user/dashboard';
  const isDoctorDashboard = pathname?.startsWith('/doctor/');
  const isUserDashboardPage = pathname?.startsWith('/user/');
  const isDashboardPage = isUserDashboardPage || isDoctorDashboard || pathname?.startsWith('/admin/');

  // Handle smooth scroll for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  if (status === 'loading') {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {process.env.NEXT_PUBLIC_APP_NAME || 'AI Dermatology'}
              </h1>
              <p className="text-xs text-gray-500 -mt-1">AI-Powered Healthcare</p>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on dashboard pages */}
          {!isDashboardPage && (
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium relative group"
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              {session && ((session.user as any)?.role === 'USER') && (
                <Link 
                  href="/doctors"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium relative group"
                >
                  Doctors
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
                </Link>
              )}
              <Link 
                href="#features" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium relative group"
                onClick={(e) => handleAnchorClick(e, '#features')}
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium relative group"
                onClick={(e) => handleAnchorClick(e, '#how-it-works')}
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link 
                href="#about" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium relative group"
                onClick={(e) => handleAnchorClick(e, '#about')}
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
            </nav>
          )}

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {session ? (
              <>
                {((session.user as any)?.role === 'ADMIN') ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Panel
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsProfileSidebarOpen(true)}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <div className="text-right hidden lg:block">
                        <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                        {((session.user as any)?.role === 'DOCTOR') && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Doctor
                          </span>
                        )}
                      </div>
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                        {(session.user as any)?.profileImage ? (
                          <img
                            src={(session.user as any).profileImage}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                        <span className="text-sm font-bold text-white">
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </span>
                        )}
                      </div>
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 lg:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - Hidden on dashboard pages */}
        {isMobileMenuOpen && !isDashboardPage && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (window.location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                Home
              </Link>
              {session && ((session.user as any)?.role === 'USER') && (
                <Link
                  href="/doctors"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Doctors
                </Link>
              )}
              <Link
                href="#features"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={(e) => {
                  handleAnchorClick(e, '#features');
                  setIsMobileMenuOpen(false);
                }}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={(e) => {
                  handleAnchorClick(e, '#how-it-works');
                  setIsMobileMenuOpen(false);
                }}
              >
                How It Works
              </Link>
              <Link
                href="#about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={(e) => {
                  handleAnchorClick(e, '#about');
                  setIsMobileMenuOpen(false);
                }}
              >
                About
              </Link>
            </div>

            <div className="pt-4 pb-3 border-t border-gray-200">
              {session ? (
                <div className="px-2 space-y-1">
                  {((session.user as any)?.role === 'ADMIN') ? (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="block px-3 py-2 text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' });
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsProfileSidebarOpen(true);
                        }}
                        className="flex items-center w-full px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          {(session.user as any)?.profileImage ? (
                            <img
                              src={(session.user as any).profileImage}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                          <span className="text-sm font-bold text-white">
                            {session.user?.name?.charAt(0).toUpperCase()}
                          </span>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                          {((session.user as any)?.role === 'DOCTOR') && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Doctor
                            </span>
                          )}
                        </div>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ProfileSidebar
        isOpen={isProfileSidebarOpen}
        onClose={() => setIsProfileSidebarOpen(false)}
      />
    </header>
  );
};

export default Header;
