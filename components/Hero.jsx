'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const images = [
  { src: '/hero/female-patient-visits-cosmetology-doctor.jpg', alt: 'Patient visiting dermatology doctor' },
  { src: '/hero/accompaniment-abortion-process.jpg',           alt: 'Medical consultation' },
];

const Hero = () => {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent(i => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background images — Next.js Image for automatic WebP + optimisation */}
      {images.map((img, i) => (
        <div
          key={img.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-2xl">
          AI-Powered Dermatology
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl mb-10 text-white/90 drop-shadow-lg max-w-3xl mx-auto">
          An integrated AI and tele-medicine system for fast, reliable, and accessible dermatological care.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/upload')}
            className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
          >
            Start Skin Scan
          </button>
          <Link
            href="/auth/signin"
            className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all hover:scale-105 shadow-xl text-center"
          >
            Book Consultation
          </Link>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};

export default Hero;
