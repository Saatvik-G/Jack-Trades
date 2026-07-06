import React from 'react';
import { Connection, ViewMode } from '../types';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface ConnectionCardProps {
  connection: Connection;
  mode: ViewMode;
}

const FIELD_ACCENTS: Record<string, { bg: string; text: string; border: string }> = {
  Science: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Mathematics: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Psychology: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Philosophy: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  History: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Art: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  Economics: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  Design: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Biology: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  Music: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Architecture: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
  'Game Theory': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, mode }) => {
  const accent = FIELD_ACCENTS[connection.field] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      {/* Top subtle accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${accent.bg} border-b ${accent.border}`} />

      <div>
        {/* Field Badge & One-liner Header */}
        <div className="flex items-center justify-between mb-3 pt-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${accent.bg} ${accent.text} ${accent.border}`}>
            {connection.field}
          </span>
          {mode === 'playful' && connection.emoji && (
            <span className="text-xl animate-bounce-short" title={connection.field}>
              {connection.emoji}
            </span>
          )}
        </div>

        {/* One-line Analogy (Bold) */}
        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors flex items-start gap-1">
          <span>{connection.analogy}</span>
        </h3>

        {/* Dynamic content rendering based on mode */}
        {mode === 'serious' ? (
          /* SERIOUS MODE: Structural Explanation Leads */
          <div className="space-y-4">
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
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
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-sm font-medium leading-snug flex items-start gap-2 shadow-inner">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-700 block text-xs uppercase tracking-wider mb-0.5">
                  Screenshot-Worthy Fact
                </span>
                {connection.funFact}
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
              <span className="font-medium text-slate-700 block text-xs uppercase tracking-wider mb-1">
                Structural Mechanism:
              </span>
              {connection.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
