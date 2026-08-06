'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const AmbientBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Blob Animation Settings (Staggered, looping, mirror coordinates)
  const blobVariants = {
    animate1: {
      x: shouldReduceMotion ? 0 : [0, 80, -40, 100, 0],
      y: shouldReduceMotion ? 0 : [0, 120, 60, -100, 0],
      scale: shouldReduceMotion ? 1 : [1, 1.1, 0.95, 1.05, 1],
      transition: {
        duration: 25,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      }
    },
    animate2: {
      x: shouldReduceMotion ? 0 : [0, -100, 60, -50, 0],
      y: shouldReduceMotion ? 0 : [0, -80, -120, 90, 0],
      scale: shouldReduceMotion ? 1 : [1, 0.9, 1.15, 1.0, 1],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
        delay: 2,
      }
    },
    animate3: {
      x: shouldReduceMotion ? 0 : [0, 60, -80, 40, 0],
      y: shouldReduceMotion ? 0 : [0, -100, 100, -60, 0],
      scale: shouldReduceMotion ? 1 : [1, 1.1, 0.9, 1.05, 1],
      transition: {
        duration: 22,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
        delay: 4,
      }
    },
    animate4: {
      x: shouldReduceMotion ? 0 : [0, -50, 50, -30, 0],
      y: shouldReduceMotion ? 0 : [0, 80, -60, 70, 0],
      scale: shouldReduceMotion ? 1 : [1, 1.05, 0.95, 1.1, 1],
      transition: {
        duration: 18,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
        delay: 6,
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#FAF9F6]">
      {/* 1. Large Blurred Animated Blobs */}
      <div className="absolute inset-0 filter blur-[100px] opacity-25 mix-blend-multiply">
        {/* Blob 1: Indigo */}
        <motion.div
          variants={blobVariants}
          animate="animate1"
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-300"
        />
        {/* Blob 2: Cyan */}
        <motion.div
          variants={blobVariants}
          animate="animate2"
          className="absolute -bottom-[10%] -right-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-cyan-300"
        />
        {/* Blob 3: Purple */}
        <motion.div
          variants={blobVariants}
          animate="animate3"
          className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-300"
        />
        {/* Blob 4: Emerald */}
        <motion.div
          variants={blobVariants}
          animate="animate4"
          className="absolute top-[50%] left-[5%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-emerald-200"
        />
      </div>

      {/* 2. Abstract Network & Coordinate System SVG Patterns (Low opacity overlay blend) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12] mix-blend-overlay pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#2B4C7E" opacity="0.3" />
          </pattern>
        </defs>
        
        {/* Grid pattern overlay */}
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* Dynamic connection lines (representing math/science links) */}
        <path d="M -100,200 C 300,100 200,600 800,400" stroke="#2B4C7E" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M 200,-50 C 400,300 100,500 900,900" stroke="#3F828E" strokeWidth="1.5" fill="none" opacity="0.3" />
        <path d="M 0,800 C 500,700 300,300 1100,200" stroke="#6B7D73" strokeWidth="1" fill="none" opacity="0.3" />
      </svg>

      {/* 3. Sparse constellation link overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-difference pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* Abstract Polymath Network Node Clusters */}
        <g stroke="#6366F1" strokeWidth="0.75" opacity="0.7">
          <line x1="25%" y1="35%" x2="30%" y2="30%" />
          <line x1="30%" y1="30%" x2="35%" y2="40%" />
          <line x1="35%" y1="40%" x2="25%" y2="35%" />
          <line x1="30%" y1="30%" x2="40%" y2="25%" />
        </g>
        <g fill="#6366F1" opacity="0.8">
          <circle cx="25%" cy="35%" r="3" />
          <circle cx="30%" cy="30%" r="4" />
          <circle cx="35%" cy="40%" r="3" />
          <circle cx="40%" cy="25%" r="2" />
        </g>

        <g stroke="#06B6D4" strokeWidth="0.75" opacity="0.6">
          <line x1="75%" y1="65%" x2="80%" y2="55%" />
          <line x1="80%" y1="55%" x2="70%" y2="50%" />
          <line x1="70%" y1="50%" x2="75%" y2="65%" />
        </g>
        <g fill="#06B6D4" opacity="0.7">
          <circle cx="75%" cy="65%" r="3" />
          <circle cx="80%" cy="55%" r="3" />
          <circle cx="70%" cy="50%" r="4" />
        </g>
      </svg>

      {/* 4. Full-viewport noise/grain overlay to remove clean digital sterility */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};
