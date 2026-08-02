'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ViewMode } from '../types';
import { BookOpen, Sparkles } from 'lucide-react';

interface ModeToggleProps {
  mode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <div className="relative inline-flex items-center p-1 rounded-xl bg-slate-200/50 backdrop-blur-sm border border-slate-300/40 shadow-inner z-10">
      <button
        type="button"
        onClick={() => onToggle('serious')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold min-w-[85px] cursor-pointer transition-colors duration-200 ${
          mode === 'serious' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        {mode === 'serious' && (
          <motion.div
            layoutId="active-mode-pill"
            className="absolute inset-0 bg-white rounded-lg shadow-xs z-[-1]"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <BookOpen className="w-3.5 h-3.5" />
        <span>Serious</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle('playful')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold min-w-[85px] cursor-pointer transition-colors duration-200 ${
          mode === 'playful' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        {mode === 'playful' && (
          <motion.div
            layoutId="active-mode-pill"
            className="absolute inset-0 bg-indigo-600 rounded-lg shadow-xs z-[-1]"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <Sparkles className="w-3.5 h-3.5" />
        <span>Playful</span>
      </button>
    </div>
  );
};
