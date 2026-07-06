import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full pt-8 pb-4 px-4 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>The Polymath Engine</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-200">
          <Compass className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Jack<span className="text-indigo-600">&</span>Trades
        </h1>
      </div>

      <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-lg font-normal">
        Uncover non-obvious, structural similarities connecting any topic across Science, Art, Philosophy, Math, and Economics.
      </p>
    </header>
  );
};
