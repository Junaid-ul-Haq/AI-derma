'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaDollarSign, FaUserMd, FaRobot } from 'react-icons/fa';

const reasons = [
  {
    title: 'Many Skin Diseases Go Unnoticed',
    description:
      'Skin conditions are often ignored or self-treated without a proper diagnosis, which can lead to complications and delayed treatment.',
    icon: FaExclamationTriangle,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    title: 'Early Detection Saves Time & Money',
    description:
      'Spotting a problem early — especially skin cancers like melanoma — makes treatment simpler, cheaper and far more successful.',
    icon: FaDollarSign,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    title: 'Limited Access to Dermatologists',
    description:
      'Many people, especially in remote or underserved areas, cannot easily see a dermatologist. A quick AI check helps them decide when to seek care.',
    icon: FaUserMd,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    title: 'AI-Powered Skin Awareness',
    description:
      'AI gives an instant first opinion and raises awareness of warning signs, making skin health information accessible to everyone, anywhere.',
    icon: FaRobot,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export default function WhyImportant() {
  return (
    <section aria-labelledby="why-heading" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-14"
        >
          <h2 id="why-heading" className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Early Skin Disease Detection Matters
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Understanding the importance of early detection can make a significant difference in treatment outcomes and quality of life.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`${r.bgColor} border-2 ${r.borderColor} rounded-2xl shadow-lg p-6 md:p-8 flex gap-5 items-start`}
              >
                <div className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">{r.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{r.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
