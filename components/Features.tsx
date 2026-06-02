'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaBrain, 
  FaEdit, 
  FaFileMedical, 
  FaShieldAlt, 
  FaVideo, 
  FaChartLine 
} from 'react-icons/fa';

const Features: React.FC = () => {
  const features = [
    {
      title: 'AI-Based Skin Image Analysis',
      description: 'Advanced AI algorithms analyze skin images for potential conditions with high accuracy and speed.',
      icon: FaBrain,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Symptom-Based Prompt Input',
      description: 'Describe your symptoms in detail for more accurate analysis and personalized insights.',
      icon: FaEdit,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Automated Health Report Generation',
      description: 'Receive comprehensive reports with possible conditions, recommendations, and next steps.',
      icon: FaFileMedical,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Secure & Private Data Handling',
      description: 'Your health data is encrypted and handled with the highest privacy and security standards.',
      icon: FaShieldAlt,
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Online Consultation',
      description: 'Connect with certified dermatologists for professional advice and personalized treatment plans.',
      icon: FaVideo,
      color: 'from-indigo-500 to-blue-500',
      comingSoon: false,
    },
    {
      title: 'Dermatologist Dashboard',
      description: 'Professional tools for dermatologists to manage consultations, view reports, and provide expert care.',
      icon: FaChartLine,
      color: 'from-teal-500 to-cyan-500',
      comingSoon: false,
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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Key Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful features that make our platform the leading choice for skin health analysis
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
                className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  feature.comingSoon ? 'opacity-60' : ''
                }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                {feature.comingSoon && (
                  <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    Coming Soon
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
