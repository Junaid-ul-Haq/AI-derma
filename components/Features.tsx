'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaCamera, FaFileMedical, FaFileDownload, FaShieldAlt, FaBolt } from 'react-icons/fa';

const Features: React.FC = () => {
  const features = [
    {
      title: 'AI Skin Image Analysis',
      description: 'A VGG19 deep-learning model trained on 15,444 skin photos checks your image against 21 skin conditions in seconds.',
      icon: FaBrain,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Gallery Upload or Live Camera',
      description: 'Pick an existing photo from your gallery or take a new one with your phone or laptop camera — both work in the browser.',
      icon: FaCamera,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Instant Skin Health Report',
      description: 'Get the most likely condition, confidence score, risk level, common signs and recommended next steps in one report.',
      icon: FaFileMedical,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Download as PDF',
      description: 'Save or print your report with one click and share it with your dermatologist for a professional opinion.',
      icon: FaFileDownload,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Private by Design',
      description: 'Your photo is analysed in memory and never stored. No account, no database, no tracking of your health data.',
      icon: FaShieldAlt,
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Free & No Sign-up',
      description: 'Anyone can use it, on any device, at any time. Open the analyzer and get your report in under a minute.',
      icon: FaBolt,
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section aria-labelledby="features-heading" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="features-heading" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Key Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to check a skin concern quickly, privately and for free
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
