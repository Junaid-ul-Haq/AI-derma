
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Hero from '../components/Hero';
import WhyImportant from '../components/WhyImportant';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import AIReport from '../components/AIReport';
import TrustSafety from '../components/TrustSafety';
import Footer from '../components/Footer';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If authenticated, redirect to appropriate dashboard
    if (status === 'authenticated' && session) {
      const userRole = (session.user as any)?.role;
      if (userRole === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else if (userRole === 'DOCTOR') {
        router.replace('/doctor/dashboard');
      } else if (userRole === 'USER') {
        router.replace('/user/dashboard');
      }
    }
  }, [status, session, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (status === 'authenticated' && session) {
    const userRole = (session.user as any)?.role;
    if (userRole === 'ADMIN' || userRole === 'DOCTOR' || userRole === 'USER') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      );
    }
  }

  // Regular landing page for non-admin users
  return (
    <main className="min-h-screen">
      <Hero />
      <WhyImportant />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="features">
        <Features />
      </div>
      <AIReport />
      <div id="about">
        <TrustSafety />
      </div>
      <Footer />
    </main>
  );
}
