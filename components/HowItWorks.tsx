'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const HowItWorks: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const steps = [
    {
      step: 1,
      title: 'Upload Skin Image',
      description:
        'Capture or upload a clear, well-lit image of the affected skin area. Ensure good lighting and focus for the most accurate AI analysis. Our system supports multiple image formats and automatically optimizes them for processing.',
      image: '/how it works/upload.png.jpg',
      icon: '📸',
    },
    {
      step: 2,
      title: 'Describe Your Symptoms',
      description:
        'Provide detailed information about your symptoms such as itching, redness, pain, swelling, or duration. The more information you share, the better our AI can understand and analyze your condition accurately.',
      image: '/how it works/describe.jpg',
      icon: '✍️',
    },
    {
      step: 3,
      title: 'AI-Powered Analysis',
      description:
        'Our advanced artificial intelligence model processes both the image and symptom data using deep learning algorithms. The AI identifies patterns, compares with medical databases, and generates preliminary insights about potential skin conditions.',
      image: '/how it works/AI analysis.jpg',
      icon: '🤖',
    },
    {
      step: 4,
      title: 'Review Your Health Report',
      description:
        'Receive a comprehensive AI-generated health report that includes possible conditions, severity assessment, recommended precautions, and suggested next steps. The report is designed to increase awareness and guide you toward appropriate medical consultation.',
      image: '/how it works/view your AI report.jpg',
      icon: '📋',
    },
    {
      step: 5,
      title: 'Consult with Dermatologist',
      description:
        'If needed, book an online consultation with our certified dermatologists. Share your AI report with the doctor for a more informed discussion. Get professional medical advice, treatment recommendations, and peace of mind from qualified healthcare providers.',
      image: '/how it works/doctor-offering-medical-teleconsultation.jpg',
      icon: '👨‍⚕️',
    },
  ];

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Our platform uses cutting-edge artificial intelligence to provide early insights into potential skin conditions.
            Follow these simple steps to get started with your health analysis.
          </p>
        </motion.div>

        {/* Carousel Container - Works on both mobile and desktop */}
        <div className="relative">
          <div className="relative h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={currentIndex}
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.4 },
                }}
                className="absolute inset-0"
              >
                <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-2xl h-full flex flex-col md:flex-row overflow-hidden">
                  {/* Image Section */}
                  <div className="flex-shrink-0 w-full md:w-2/5 h-64 md:h-full bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    <Image
                      src={steps[currentIndex].image}
                      alt={steps[currentIndex].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r md:from-black/20 md:to-transparent" />
                    
                    {/* Step Number Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <motion.div
                        key={`badge-${currentIndex}`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 200, 
                          damping: 15,
                          delay: 0.2 
                        }}
                        className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center font-bold text-xl md:text-2xl shadow-2xl"
                      >
                        {steps[currentIndex].step}
                      </motion.div>
                    </div>

                    {/* Icon Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl md:text-8xl opacity-20">
                      {steps[currentIndex].icon}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col justify-center p-6 md:p-10 lg:p-12">
                    <motion.div
                      key={`title-${currentIndex}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-gray-800">
                        {steps[currentIndex].title}
                      </h3>
                    </motion.div>
                    
                    <motion.p
                      key={`desc-${currentIndex}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed"
                    >
                      {steps[currentIndex].description}
                    </motion.p>

                    {/* Step Indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 md:mt-8 flex items-center gap-2"
                    >
                      <span className="text-sm md:text-base font-semibold text-gray-500">
                        Step {currentIndex + 1} / {steps.length}
                      </span>
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 4, ease: 'linear' }}
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                          key={currentIndex}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 md:gap-3 mt-6 md:mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 md:w-12 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'w-2 md:w-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Previous/Next Buttons (Desktop only) */}
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between px-4 pointer-events-none">
            <button
              onClick={() => goToSlide((currentIndex - 1 + steps.length) % steps.length)}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all hover:scale-110"
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goToSlide((currentIndex + 1) % steps.length)}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all hover:scale-110"
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 md:mt-12 text-center"
        >
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded-lg max-w-3xl mx-auto">
            <p className="text-xs md:text-sm text-gray-700">
              <strong className="text-yellow-800">Important:</strong> This system is designed to support awareness and is not a replacement for professional medical diagnosis. Always consult with a qualified healthcare provider for accurate diagnosis and treatment.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
