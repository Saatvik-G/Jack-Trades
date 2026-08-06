import React from 'react';
import { Compass, Sparkles, Network } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 my-8 relative z-10">
      {/* Node Connection Radar Banner */}
      <div className="w-full mb-8 p-6 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-900 shadow-[3px_3px_0px_#11161B]">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-950 text-indigo-400 border border-slate-800 animate-spin" style={{ animationDuration: '4s' }}>
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <span>Mapping Cross-Discipline Web</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Traversing Science, Philosophy, Math, Art, and Economics to extract mechanism-level similarities...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-950 px-3 py-1.5 rounded-lg border border-slate-800 shadow-[1px_1px_0px_#11161B]">
          <Network className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>SAMPLING CANDIDATES...</span>
        </div>
      </div>

      {/* Shimmer skeleton grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-slate-50 rounded-xl p-6 border border-slate-900 shadow-[3px_3px_0px_#11161B] space-y-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-6 w-28 bg-slate-200 rounded-md border border-slate-900/10 shadow-[1px_1px_0px_#11161B]" />
              <div className="h-6 w-6 bg-slate-200 rounded-md border border-slate-900/10 shadow-[1px_1px_0px_#11161B]" />
            </div>

            <div className="h-6 w-5/6 bg-slate-200 rounded-md" />

            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded-sm" />
              <div className="h-4 w-11/12 bg-slate-200 rounded-sm" />
              <div className="h-4 w-4/6 bg-slate-200 rounded-sm" />
            </div>

            <div className="pt-3 border-t border-slate-200">
              <div className="h-10 w-full bg-slate-100 rounded-lg border border-slate-900/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
