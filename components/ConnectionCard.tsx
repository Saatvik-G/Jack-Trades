import React from 'react';
import { Connection, ViewMode } from '../types';
import { Sparkles, ArrowRight, Waypoints } from 'lucide-react';

interface ConnectionCardProps {
  connection: Connection;
  mode: ViewMode;
  index?: number;
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

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, mode, index = 0 }) => {
  const accent = FIELD_ACCENTS[connection.field] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
    glow: 'from-indigo-500',
  };

  const staggerClass = `stagger-${(index % 6) + 1}`;

  return (
    <div className={`glass-node-card rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden animate-fade-in-up opacity-0 ${staggerClass}`}>
      {/* Top glowing gradient line indicating structural connection */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accent.glow} to-slate-200 opacity-90`} />

      <div>
        {/* Field Node Badge */}
        <div className="flex items-center justify-between mb-4 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${accent.bg} ${accent.text} ${accent.border}`}>
              {connection.field}
            </span>
          </div>
          {mode === 'playful' && connection.emoji && (
            <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200" title={connection.field}>
              {connection.emoji}
            </span>
          )}
        </div>

        {/* One-line Analogy */}
        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors font-display leading-snug">
          {connection.analogy}
        </h3>

        {/* Dynamic content rendering based on mode */}
        {mode === 'serious' ? (
          /* SERIOUS MODE: Structural Explanation Leads */
          <div className="space-y-4">
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              {connection.explanation}
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600 shrink-0">Fun fact:</span>
              <span className="italic">{connection.funFact}</span>
            </div>
          </div>
        ) : (
          /* PLAYFUL MODE: Fun Fact Prominent Callout */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-violet-50/80 border border-indigo-100 text-indigo-950 text-sm font-medium leading-relaxed shadow-inner">
              <div className="flex items-center gap-1.5 mb-1 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs uppercase tracking-wider">
                  Screenshot-Worthy Fact
                </span>
              </div>
              {connection.funFact}
            </div>

            <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-700 block text-xs uppercase tracking-wider mb-1">
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
  );
};
