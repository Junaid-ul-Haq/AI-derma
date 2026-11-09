'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const images = [
  { src: '/hero/ai-skin-analysis-dermatology.jpg', alt: 'Patient discussing skin health with a dermatologist in a skin clinic' },
  { src: '/hero/dermatology-skin-consultation.jpg', alt: 'Doctor examining the skin on a patient\'s arm during a consultation' },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent(i => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section aria-labelledby="hero-heading" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background images — Next.js Image for automatic WebP + optimisation */}
      {images.map((img, i) => (
        <div
          key={img.src}
          aria-hidden={i !== current}
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
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <p className="inline-block mb-5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-xs sm:text-sm font-semibold uppercase tracking-widest">
          Free · No sign-up · Results in seconds
        </p>
        <h1 id="hero-heading" className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl max-w-5xl mx-auto leading-tight">
          AI Skin Disease Detection &amp; Instant Skin Health Reports
        </h1>
        <p className="text-lg md:text-2xl mb-10 text-white/90 drop-shadow-lg max-w-3xl mx-auto">
          Upload a photo from your gallery or take one with your camera. Our AI checks it for 21 skin conditions —
          from acne and eczema to skin cancer — and gives you a report you can download and share with your dermatologist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/analyze"
            className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
          >
            Analyze My Skin — Free
          </Link>
          <Link
            href="/#sample-report"
            className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all hover:scale-105 shadow-xl text-center"
          >
            See a Sample Report
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
            aria-label={`Show background image ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};

export default Hero;
