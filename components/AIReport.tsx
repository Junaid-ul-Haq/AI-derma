'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaFileMedical, FaCheckCircle, FaExclamationTriangle, FaUserMd } from 'react-icons/fa';

const AIReport: React.FC = () => {
  const reportFeatures = [
    {
      title: 'AI Result',
      items: ['Most likely condition, e.g. Eczema', 'Top 3 possibilities with AI confidence scores', 'Risk level: Low, See a Doctor or See a Dermatologist Soon'],
      icon: FaFileMedical,
    },
    {
      title: 'Recommended Actions',
      items: ['Condition-specific next steps', 'Common signs to watch for (e.g. the ABCDE rule)', 'When to see a dermatologist'],
      icon: FaCheckCircle,
    },
    {
      title: 'Your Details & Records',
      items: ['Your body area, duration and symptoms', 'Report ID and date for your records', 'Clear medical disclaimer'],
      icon: FaExclamationTriangle,
    },
  ];

  return (
    <section id="sample-report" aria-labelledby="sample-report-heading" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="sample-report-heading" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sample AI Skin Health Report
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Here is what your free report includes. Download it as a PDF and share it with your dermatologist.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <FaFileMedical className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center">AI Skin Health Report</h3>
            <p className="text-center text-blue-100 mt-2">Comprehensive Analysis & Recommendations</p>
          </div>

          {/* Report Content */}
          <div className="p-8">
            <div className="space-y-8">
              {reportFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-l-4 border-blue-500 pl-6"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 rounded-lg p-3 mr-4">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">{feature.title}</h4>
                    </div>
                    <ul className="space-y-2 ml-16">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start text-gray-600">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg"
            >
              <div className="flex items-start">
                <FaExclamationTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-yellow-800 mb-2">Important Medical Disclaimer</h5>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    This AI-generated report is for informational purposes only and is not a substitute for professional medical diagnosis, 
                    treatment, or advice. Always consult with a qualified healthcare provider or dermatologist for accurate diagnosis and 
                    appropriate treatment. The AI model is designed to support awareness and should not be used as the sole basis for medical decisions.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center justify-center mb-3">
                  <FaUserMd className="w-6 h-6 text-blue-600 mr-2" />
                  <p className="font-semibold text-gray-800">Ready to get started?</p>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Upload or take a photo of your skin to receive your personalised AI skin health report
                </p>
                <Link href="/analyze" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all">
                  Generate My Free Report
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIReport;
