// Server Component — no 'use client' needed.
// Session redirect happens server-side; no spinner, no blank screen for visitors.
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import Hero from '../components/Hero';

// Below-fold components are code-split and only load when scrolled into view
const WhyImportant = dynamic(() => import('../components/WhyImportant'));
const HowItWorks   = dynamic(() => import('../components/HowItWorks'));
const Features     = dynamic(() => import('../components/Features'));
const AIReport     = dynamic(() => import('../components/AIReport'));
const TrustSafety  = dynamic(() => import('../components/TrustSafety'));
const Footer       = dynamic(() => import('../components/Footer'));

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = (session.user as any)?.role;
    if (role === 'ADMIN')  redirect('/admin/dashboard');
    if (role === 'DOCTOR') redirect('/doctor/dashboard');
    if (role === 'USER')   redirect('/user/dashboard');
  }

  return (
    <main className="min-h-screen">
      <Hero />
      <WhyImportant />
      <div id="how-it-works"><HowItWorks /></div>
      <div id="features"><Features /></div>
      <AIReport />
      <div id="about"><TrustSafety /></div>
      <Footer />
    </main>
  );
}
