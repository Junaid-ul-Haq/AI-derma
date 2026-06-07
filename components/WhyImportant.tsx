'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaDollarSign, FaUserMd, FaRobot } from 'react-icons/fa';

const reasons = [
  {
    title:       'Many Diseases Ignored',
    description: 'Skin conditions are often overlooked or self-treated without proper diagnosis, leading to complications and delayed treatment.',
    icon:        FaExclamationTriangle,
    color:       'from-red-500 to-pink-500',
    bgColor:     'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    title:       'Save Time & Money',
    description: 'Early detection prevents costly treatments and complications, saving both time and financial resources while improving outcomes.',
    icon:        FaDollarSign,
    color:       'from-green-500 to-emerald-500',
    bgColor:     'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    title:       'Limited Access',
    description: 'Not everyone has easy access to qualified dermatologists, especially in remote or underserved areas where healthcare is scarce.',
    icon:        FaUserMd,
    color:       'from-blue-500 to-cyan-500',
    bgColor:     'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    title:       'AI-Powered Awareness',
    description: 'AI helps in initial analysis and increases health awareness, making healthcare more accessible to everyone regardless of location.',
    icon:        FaRobot,
    color:       'from-purple-500 to-indigo-500',
    bgColor:     'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

// Simple fade slide — no 3D transforms, no spring physics
const slide = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit:  { opacity: 0, x: -50 },
};

export default function WhyImportant() {
  const [idx, setIdx] = useState(0);

  // Staggered to 5 000 ms so it doesn't fire at the same tick as HowItWorks
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % reasons.length), 5000);
    return () => clearInterval(id);
  }, []);

  const r = reasons[idx];
  const Icon = r.icon;

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Early Skin Disease Detection Matters
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Understanding the importance of early detection can make a significant difference in treatment outcomes and quality of life
          </p>
        </motion.div>

        <div className="relative h-[340px] md:h-[380px] overflow-hidden rounded-2xl">
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
              <div className={`${r.bgColor} border-2 ${r.borderColor} rounded-2xl shadow-xl h-full flex flex-col md:flex-row overflow-hidden`}>
                {/* Icon */}
                <div className="flex-shrink-0 w-full md:w-1/3 h-40 md:h-full flex items-center justify-center p-8 bg-white/30">
                  <div className={`w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-xl`}>
                    <Icon className="w-14 h-14 md:w-18 md:h-18 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center p-6 md:p-10">
                  <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-5 text-gray-800">{r.title}</h3>
                  <p className="text-base md:text-xl text-gray-600 leading-relaxed">{r.description}</p>

                  {/* Progress bar */}
                  <div className="mt-6 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">{idx + 1} / {reasons.length}</span>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        key={idx}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className={`h-full bg-gradient-to-r ${r.color} rounded-full`}
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
          {reasons.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === idx
                  ? `w-10 bg-gradient-to-r ${reasons[i].color} shadow`
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to ${reasons[i].title}`}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="hidden md:flex justify-between mt-4 px-1">
          <button
            onClick={() => setIdx(i => (i - 1 + reasons.length) % reasons.length)}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % reasons.length)}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-md transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
