'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const steps = [
  {
    step: 1, icon: '📸',
    title: 'Upload Skin Image',
    description: 'Capture or upload a clear, well-lit image of the affected skin area. Ensure good lighting and focus for the most accurate AI analysis. Our system supports multiple image formats and automatically optimizes them for processing.',
    image: '/how it works/upload.png.jpg',
  },
  {
    step: 2, icon: '✍️',
    title: 'Describe Your Symptoms',
    description: 'Provide detailed information about your symptoms such as itching, redness, pain, swelling, or duration. The more information you share, the better our AI can understand and analyze your condition accurately.',
    image: '/how it works/describe.jpg',
  },
  {
    step: 3, icon: '🤖',
    title: 'AI-Powered Analysis',
    description: 'Our advanced artificial intelligence model processes both the image and symptom data using deep learning algorithms. The AI identifies patterns, compares with medical databases, and generates preliminary insights.',
    image: '/how it works/AI analysis.jpg',
  },
  {
    step: 4, icon: '📋',
    title: 'Review Your Health Report',
    description: 'Receive a comprehensive AI-generated health report that includes possible conditions, severity assessment, recommended precautions, and suggested next steps.',
    image: '/how it works/view your AI report.jpg',
  },
  {
    step: 5, icon: '👨‍⚕️',
    title: 'Consult with Dermatologist',
    description: 'If needed, book an online consultation with our certified dermatologists. Share your AI report with the doctor for a more informed discussion and get professional medical advice.',
    image: '/how it works/doctor-offering-medical-teleconsultation.jpg',
  },
];

const slide = {
  enter:  { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -50 },
};

export default function HowItWorks() {
  const [idx, setIdx] = useState(0);

  // 4 500 ms — staggered from WhyImportant (5 000 ms) to avoid simultaneous re-renders
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % steps.length), 4500);
    return () => clearInterval(id);
  }, []);

  const s = steps[idx];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Our platform uses cutting-edge AI to provide early insights into potential skin conditions. Follow these simple steps.
          </p>
        </motion.div>

        <div className="relative h-[460px] md:h-[500px] overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-xl h-full flex flex-col md:flex-row overflow-hidden">
                {/* Image — priority only on first slide */}
                <div className="flex-shrink-0 w-full md:w-2/5 h-52 md:h-full relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority={idx === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent md:bg-gradient-to-r" />

                  {/* Step badge */}
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-xl">
                    {s.step}
                  </div>

                  {/* Faded icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-20 pointer-events-none">
                    {s.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center p-6 md:p-10">
                  <h3 className="text-2xl md:text-4xl font-bold mb-4 text-gray-800">{s.title}</h3>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">{s.description}</p>

                  {/* Progress */}
                  <div className="mt-6 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">Step {idx + 1} / {steps.length}</span>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        key={idx}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4.5, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === idx
                  ? 'w-10 bg-gradient-to-r from-blue-600 to-purple-600 shadow'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="hidden md:flex justify-between mt-4 px-1">
          <button
            onClick={() => setIdx(i => (i - 1 + steps.length) % steps.length)}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % steps.length)}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded-lg max-w-3xl mx-auto">
            <p className="text-xs md:text-sm text-gray-700">
              <strong className="text-yellow-800">Important:</strong> This system is designed to support awareness and is not a replacement for professional medical diagnosis. Always consult a qualified healthcare provider for accurate diagnosis and treatment.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
