'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from './SpotlightCard';
import { Connection, ViewMode } from '../types';
import { Sparkles, ArrowRight, Waypoints, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';

interface ConnectionCardProps {
  connection: Connection;
  mode: ViewMode;
  index?: number;
  onSave?: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

const FIELD_ACCENTS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Science: { bg: 'bg-emerald-50/90', text: 'text-emerald-800', border: 'border-emerald-200', glow: 'from-emerald-500' },
  Mathematics: { bg: 'bg-blue-50/90', text: 'text-blue-800', border: 'border-blue-200', glow: 'from-blue-500' },
  Psychology: { bg: 'bg-purple-50/90', text: 'text-purple-800', border: 'border-purple-200', glow: 'from-purple-500' },
  Philosophy: { bg: 'bg-amber-50/90', text: 'text-amber-800', border: 'border-amber-200', glow: 'from-amber-500' },
  History: { bg: 'bg-orange-50/90', text: 'text-orange-800', border: 'border-orange-200', glow: 'from-orange-500' },
  Art: { bg: 'bg-pink-50/90', text: 'text-pink-800', border: 'border-pink-200', glow: 'from-pink-500' },
  Economics: { bg: 'bg-teal-50/90', text: 'text-teal-800', border: 'border-teal-200', glow: 'from-teal-500' },
  Design: { bg: 'bg-violet-50/90', text: 'text-violet-800', border: 'border-violet-200', glow: 'from-violet-500' },
  Biology: { bg: 'bg-lime-50/90', text: 'text-lime-800', border: 'border-lime-200', glow: 'from-lime-500' },
  Music: { bg: 'bg-indigo-50/90', text: 'text-indigo-800', border: 'border-indigo-200', glow: 'from-indigo-500' },
  Architecture: { bg: 'bg-stone-100/90', text: 'text-stone-800', border: 'border-stone-200', glow: 'from-stone-500' },
  'Game Theory': { bg: 'bg-cyan-50/90', text: 'text-cyan-800', border: 'border-cyan-200', glow: 'from-cyan-500' },
  Sociology: { bg: 'bg-rose-50/90', text: 'text-rose-800', border: 'border-rose-200', glow: 'from-rose-500' },
  Engineering: { bg: 'bg-sky-50/90', text: 'text-sky-800', border: 'border-sky-200', glow: 'from-sky-500' },
  Literature: { bg: 'bg-fuchsia-50/90', text: 'text-fuchsia-800', border: 'border-fuchsia-200', glow: 'from-fuchsia-500' },
  Ecology: { bg: 'bg-emerald-100/90', text: 'text-emerald-900', border: 'border-emerald-300', glow: 'from-emerald-600' },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 90,
      damping: 15,
    },
  },
};

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  mode,
  index = 0,
  onSave,
  isSaved = false,
  isSaving = false,
}) => {
  const accent = FIELD_ACCENTS[connection.field] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
    glow: 'from-indigo-500',
  };

  return (
    <motion.div
      variants={cardVariants}
      className="h-full"
    >
      <SpotlightCard className="glass-node-card rounded-xl p-6 transition-all duration-300 flex flex-col justify-between group h-full relative">
        {/* Top solid outline indicating structural connection */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900 z-10" />

        <div className="flex-grow flex flex-col justify-between h-full">
          <div>
            {/* Field Node Badge */}
            <div className="flex items-center justify-between mb-4 pt-2">
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-900 shadow-[1px_1px_0px_#11161B] ${accent.bg} ${accent.text}`}>
                  {connection.field}
                </span>
              </div>

              <div className="flex items-center gap-2 z-20">
                {mode === 'playful' && connection.emoji && (
                  <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200 mr-0.5" title={connection.field}>
                    {connection.emoji}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSave) onSave();
                  }}
                  disabled={isSaving || isSaved}
                  className={`p-2 rounded-lg border border-slate-900 transition-all cursor-pointer shadow-[1px_1px_0px_#11161B] active:translate-y-0.5 ${
                    isSaved
                      ? 'bg-emerald-50 text-emerald-700'
                      : isSaving
                      ? 'bg-slate-100 text-slate-400 animate-pulse'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600'
                  }`}
                  title={isSaved ? 'Saved to Second Brain' : 'Save to Second Brain'}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="w-3.5 h-3.5 fill-emerald-700" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* One-line Analogy */}
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors font-display leading-snug">
              {connection.analogy}
            </h3>

            {/* Dynamic content rendering based on mode */}
            {mode === 'serious' ? (
              /* SERIOUS MODE: Structural Explanation Leads */
              <div className="space-y-4">
                <p className="text-slate-700 text-xs leading-relaxed font-normal">
                  {connection.explanation}
                </p>
                <div className="pt-3 border-t border-slate-200 flex items-start gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-650 shrink-0">Fun fact:</span>
                  <span className="italic leading-relaxed">{connection.funFact}</span>
                </div>
              </div>
            ) : (
              /* PLAYFUL MODE: Fun Fact Prominent Callout */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-slate-900 text-slate-900 text-xs font-medium leading-relaxed shadow-[2px_2px_0px_#11161B]">
                  <div className="flex items-center gap-1.5 mb-1.5 text-amber-700">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      Screenshot-Worthy Fact
                    </span>
                  </div>
                  {connection.funFact}
                </div>

                <p className="text-slate-700 text-xs leading-relaxed border-t border-slate-200 pt-3">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider mb-1">
                    Structural Mechanism:
                  </span>
                  {connection.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Domain travel footer tag */}
          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Waypoints className="w-3 h-3 text-indigo-500" />
              Cross-Domain Parallel
            </span>
            <span className="group-hover:text-indigo-600 transition-colors flex items-center gap-0.5">
              Read connection <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
};
