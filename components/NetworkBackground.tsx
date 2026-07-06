import React from 'react';

export const NetworkBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
          <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.6" />
          </pattern>
        </defs>

        {/* Subtle grid background */}
        <rect width="100%" height="100%" fill="url(#dotGrid)" />

        {/* Floating animated network lines & nodes */}
        <g className="animate-float" style={{ animationDuration: '14s' }}>
          <line x1="10%" y1="20%" x2="25%" y2="40%" stroke="#c7d2fe" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="25%" y1="40%" x2="45%" y2="25%" stroke="#c7d2fe" strokeWidth="1" />
          <line x1="45%" y1="25%" x2="70%" y2="40%" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="70%" y1="40%" x2="88%" y2="20%" stroke="#c7d2fe" strokeWidth="1" />
          
          <circle cx="10%" cy="20%" r="4" fill="#818cf8" />
          <circle cx="25%" cy="40%" r="6" fill="#6366f1" />
          <circle cx="45%" cy="25%" r="5" fill="#4f46e5" />
          <circle cx="70%" cy="40%" r="7" fill="#06b6d4" />
          <circle cx="88%" cy="20%" r="4" fill="#a855f7" />
        </g>

        <g className="animate-float" style={{ animationDuration: '18s', animationDelay: '2s' }}>
          <line x1="15%" y1="75%" x2="35%" y2="60%" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="35%" y1="60%" x2="60%" y2="80%" stroke="#c7d2fe" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="60%" y1="80%" x2="85%" y2="70%" stroke="#a5b4fc" strokeWidth="1" />

          <circle cx="15%" cy="75%" r="5" fill="#94a3b8" />
          <circle cx="35%" cy="60%" r="6" fill="#6366f1" />
          <circle cx="60%" cy="80%" r="8" fill="#8b5cf6" />
          <circle cx="85%" cy="70%" r="5" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
};
