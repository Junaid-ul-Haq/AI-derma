'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaDollarSign, 
  FaUserMd, 
  FaRobot 
} from 'react-icons/fa';

const WhyImportant: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reasons = [
    {
      title: 'Many Diseases Ignored',
      description: 'Skin conditions are often overlooked or self-treated without proper diagnosis, leading to complications and delayed treatment.',
      icon: FaExclamationTriangle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Save Time & Money',
      description: 'Early detection prevents costly treatments and complications, saving both time and financial resources while improving outcomes.',
      icon: FaDollarSign,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Limited Access',
      description: 'Not everyone has easy access to qualified dermatologists, especially in remote or underserved areas where healthcare is scarce.',
      icon: FaUserMd,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'AI-Powered Awareness',
      description: 'AI helps in initial analysis and increases health awareness, making healthcare more accessible to everyone regardless of location.',
      icon: FaRobot,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reasons.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [reasons.length]);

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
    <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Early Skin Disease Detection Matters
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Understanding the importance of early detection can make a significant difference in treatment outcomes and quality of life
          </p>
        </motion.div>

        {/* Carousel Container - Works on both mobile and desktop */}
        <div className="relative">
          <div className="relative h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden rounded-2xl">
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
                <div className={`${reasons[currentIndex].bgColor} border-2 ${reasons[currentIndex].borderColor} rounded-2xl shadow-2xl h-full flex flex-col md:flex-row overflow-hidden`}>
                  {/* Icon Section */}
                  <div className="flex-shrink-0 w-full md:w-1/3 h-48 md:h-full bg-gradient-to-br from-white/50 to-transparent flex items-center justify-center p-8">
                    <motion.div
                      key={currentIndex}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 200, 
                        damping: 15,
                        delay: 0.2 
                      }}
                      className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${reasons[currentIndex].color} flex items-center justify-center shadow-2xl`}
                    >
                      {React.createElement(reasons[currentIndex].icon, {
                        className: 'w-16 h-16 md:w-20 md:h-20 text-white'
                      })}
                    </motion.div>
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
                        {reasons[currentIndex].title}
                      </h3>
                    </motion.div>
                    
                    <motion.p
                      key={`desc-${currentIndex}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed"
                    >
                      {reasons[currentIndex].description}
                    </motion.p>

                    {/* Step Indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 md:mt-8 flex items-center gap-2"
                    >
                      <span className="text-sm md:text-base font-semibold text-gray-500">
                        {currentIndex + 1} / {reasons.length}
                      </span>
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 4, ease: 'linear' }}
                          className={`h-full bg-gradient-to-r ${reasons[currentIndex].color} rounded-full`}
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
            {reasons.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? `w-8 md:w-12 bg-gradient-to-r ${reasons[index].color} shadow-lg`
                    : 'w-2 md:w-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to ${reasons[index].title}`}
              />
            ))}
          </div>

          {/* Previous/Next Buttons (Desktop only) */}
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between px-4 pointer-events-none">
            <button
              onClick={() => goToSlide((currentIndex - 1 + reasons.length) % reasons.length)}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all hover:scale-110"
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goToSlide((currentIndex + 1) % reasons.length)}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all hover:scale-110"
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyImportant;
