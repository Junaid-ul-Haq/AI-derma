'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    '/hero/female-patient-visits-cosmetology-doctor.jpg',
    '/hero/accompaniment-abortion-process.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleUploadClick = () => {
    router.push('/upload');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Images with Fade Transition */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image}')`
          }}
        >
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-blue-700 drop-shadow-2xl">
          AI-Powered Dermatology
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl mb-10 text-blue-600 drop-shadow-lg max-w-3xl mx-auto">
          An integrated AI and tele-medicine system for fast, reliable, and accessible dermatological care.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleUploadClick}
            className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Skin Scan
          </button>
          <button
            className="bg-transparent border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-xl"
          >
            Book Consultation
          </button>
        </div>
      </div>

      {/* Decorative bottom wave or gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white"></div>
    </section>
  );
};

export default Hero;

