import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, X } from 'lucide-react';

interface SplashAnimationProps {
  onComplete: () => void;
}

const FEATURED_NODES = [
  { name: 'Biology', angle: 0, color: 'bg-lime-500', label: '🧬 Biology' },
  { name: 'Philosophy', angle: 60, color: 'bg-amber-500', label: '🦉 Philosophy' },
  { name: 'Music', angle: 120, color: 'bg-indigo-500', label: '🎷 Music' },
  { name: 'Economics', angle: 180, color: 'bg-teal-500', label: '📈 Economics' },
  { name: 'Art', angle: 240, color: 'bg-pink-500', label: '🎨 Art' },
  { name: 'Architecture', angle: 300, color: 'bg-stone-500', label: '🏛️ Architecture' },
];

export const SplashAnimation: React.FC<SplashAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'converging' | 'nexus' | 'resolving'>('converging');

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    // Sequence timing
    const timer1 = setTimeout(() => setStage('nexus'), 1000);
    const timer2 = setTimeout(() => setStage('resolving'), 1800);
    const timer3 = setTimeout(() => onComplete(), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19] text-white transition-opacity duration-500 ${
      stage === 'resolving' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Skip button */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
      >
        <span>Skip intro</span>
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Center Nexus Container */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* SVG Connector Web Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
          {FEATURED_NODES.map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const r = stage === 'converging' ? 120 : 35;
            const x = 160 + r * Math.cos(rad);
            const y = 160 + r * Math.sin(rad);

            return (
              <line
                key={i}
                x1="160"
                y1="160"
                x2={x}
                y2={y}
                stroke="#6366F1"
                strokeWidth={stage === 'nexus' ? '2.5' : '1.5'}
                strokeOpacity={stage === 'nexus' ? '0.9' : '0.4'}
                className="transition-all duration-700 ease-out"
              />
            );
          })}
        </svg>

        {/* Orbiting Field Nodes */}
        {FEATURED_NODES.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const r = stage === 'converging' ? 120 : 20;
          const x = 160 + r * Math.cos(rad) - 160;
          const y = 160 + r * Math.sin(rad) - 160;

          return (
            <div
              key={i}
              className="absolute transition-all duration-700 ease-out flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-semibold shadow-lg"
              style={{
                transform: `translate(${x}px, ${y}px) scale(${stage === 'converging' ? 1 : 0.4})`,
                opacity: stage === 'converging' ? 1 : 0.2,
              }}
            >
              <span className={`w-2 h-2 rounded-full ${node.color}`} />
              <span>{node.name}</span>
            </div>
          );
        })}

        {/* Core Nexus Pulse */}
        <div className={`relative z-10 p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 shadow-2xl shadow-indigo-500/40 flex flex-col items-center justify-center transition-all duration-500 ${
          stage === 'nexus' ? 'scale-110 shadow-indigo-500/80 ring-4 ring-indigo-400/40' : 'scale-100'
        }`}>
          <Compass className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '6s' }} />
          <div className="mt-2 text-center">
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Jack<span className="text-cyan-400">&</span>Trades
            </h2>
            <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold mt-0.5">
              Connecting Knowledge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
