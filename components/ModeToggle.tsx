import React from 'react';
import { ViewMode } from '../types';
import { BookOpen, Sparkles } from 'lucide-react';

interface ModeToggleProps {
  mode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/60 shadow-inner">
      <button
        type="button"
        onClick={() => onToggle('serious')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          mode === 'serious'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5 text-slate-600" />
        <span>Serious</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle('playful')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          mode === 'playful'
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Playful</span>
      </button>
    </div>
  );
};
