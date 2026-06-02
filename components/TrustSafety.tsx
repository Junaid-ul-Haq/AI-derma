'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaLock, 
  FaShieldAlt, 
  FaExclamationCircle 
} from 'react-icons/fa';

const TrustSafety: React.FC = () => {
  const trustPoints = [
    {
      title: 'Data Privacy',
      description: 'Your personal and health data is encrypted and stored securely. We follow HIPAA-style privacy standards to protect your information.',
      icon: FaLock,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Security First',
      description: 'We use industry-standard security measures to ensure your data remains confidential and protected from unauthorized access.',
      icon: FaShieldAlt,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Medical Disclaimer',
      description: 'This platform provides AI-assisted analysis only. Results are not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers.',
      icon: FaExclamationCircle,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trust & Safety
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy and security are our top priorities. We're committed to protecting your data and providing transparent, reliable services.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {trustPoints.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${point.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-gray-800">{point.title}</h3>
                <p className="text-gray-600 leading-relaxed">{point.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSafety;
