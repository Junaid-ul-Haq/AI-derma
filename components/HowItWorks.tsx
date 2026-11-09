'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const steps = [
  {
    title: 'Upload or Take a Photo',
    description:
      'Choose a clear photo from your gallery, or take one instantly with your phone or laptop camera. Good lighting and focus give the most accurate result.',
    image: '/how-it-works/upload-skin-photo.jpg',
    alt: 'Uploading a skin photo for AI analysis',
  },
  {
    title: 'Add Your Symptoms (Optional)',
    description:
      'Tell us where the spot is, how long you have noticed it and any symptoms such as itching, bleeding or changes in size. These details are added to your report for your doctor.',
    image: '/how-it-works/describe-skin-symptoms.jpg',
    alt: 'Describing skin symptoms such as itching or redness',
  },
  {
    title: 'AI Analyzes the Image',
    description:
      'Our VGG19 deep-learning model, trained on 15,444 skin photos, compares your image against 21 skin conditions and healthy skin in seconds.',
    image: '/how-it-works/ai-skin-image-analysis.jpg',
    alt: 'AI deep-learning model analysing a skin image',
  },
  {
    title: 'Get Your Skin Health Report',
    description:
      'See the most likely condition, the top 3 possibilities with confidence scores, a risk level, common signs and recommended next steps.',
    image: '/how-it-works/ai-skin-health-report.jpg',
    alt: 'AI-generated skin health report on screen',
  },
  {
    title: 'Download & Share with a Dermatologist',
    description:
      'Save your report as a PDF or print it, then share it with a dermatologist for a professional diagnosis and treatment plan.',
    image: '/how-it-works/share-report-with-dermatologist.jpg',
    alt: 'Sharing an AI skin report with a dermatologist',
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="py-12 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-14"
        >
          <h2 id="how-heading" className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How AI Skin Analysis Works
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Get a skin health report in under a minute — no account, no waiting room. Just follow these five steps.
          </p>
        </motion.div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white border border-blue-100 rounded-2xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="relative h-44 bg-gradient-to-br from-blue-100 to-purple-100">
                <Image src={s.image} alt={s.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                <span className="absolute top-3 left-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                  {i + 1}
                </span>
              </div>
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-800">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{s.description}</p>
              </div>
            </motion.li>
          ))}
          <li className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 flex flex-col justify-center items-start shadow-lg">
            <p className="text-2xl font-bold mb-2">Ready to check your skin?</p>
            <p className="text-blue-100 mb-6">It is free and takes less than a minute.</p>
            <Link href="/analyze" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Start Skin Analysis
            </Link>
          </li>
        </ol>

        <div className="mt-10 bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded-lg max-w-3xl mx-auto">
          <p className="text-xs md:text-sm text-gray-700">
            <strong className="text-yellow-800">Important:</strong> This tool supports skin health awareness and is not a
            replacement for a professional medical diagnosis. Always consult a qualified dermatologist.
          </p>
        </div>
      </div>
    </section>
  );
}
