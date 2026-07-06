import React from 'react';
import { ViewMode } from '../types';
import { BookOpen, Sparkles } from 'lucide-react';

interface ModeToggleProps {
  mode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <div className="relative inline-flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/70 shadow-inner">
      {/* Sliding background pill */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-all duration-300 ease-out ${
          mode === 'serious' ? 'left-1' : 'left-[calc(50%+2px)] bg-indigo-600'
        }`}
      />

      <button
        type="button"
        onClick={() => onToggle('serious')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 min-w-[85px] cursor-pointer ${
          mode === 'serious' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Serious</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle('playful')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 min-w-[85px] cursor-pointer ${
          mode === 'playful' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Playful</span>
      </button>
    </div>
  );
};
