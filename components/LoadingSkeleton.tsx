import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 my-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-8 w-36 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded-full" />
              <div className="h-6 w-6 bg-slate-200 rounded-full" />
            </div>

            <div className="h-6 w-3/4 bg-slate-200 rounded-md" />

            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
              <div className="h-4 w-4/6 bg-slate-200 rounded" />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
