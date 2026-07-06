import React from 'react';
import { Compass, Sparkles, Network } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full pt-8 pb-4 px-4 flex flex-col items-center text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-md">
        <Network className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
        <span>The Polymath Engine</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
          Jack<span className="gradient-brand">&</span>Trades
        </h1>
      </div>

      <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-lg font-normal leading-relaxed">
        Uncover non-obvious, structural similarities connecting any concept across Science, Math, Psychology, Art, Philosophy, and 16+ domains.
      </p>
    </header>
  );
};
