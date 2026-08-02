'use client';

import React, { useEffect, useState } from 'react';

export const AmbientBlobs: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blob 1: Indigo top left */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-200/20 blur-[100px] mix-blend-multiply animate-drift-slow"
        style={{ animationDelay: '0s' }}
      />
      {/* Blob 2: Cyan bottom right */}
      <div 
        className="absolute -bottom-[10%] -right-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-cyan-200/25 blur-[120px] mix-blend-multiply animate-drift-slow"
        style={{ animationDelay: '4s' }}
      />
      {/* Blob 3: Violet middle right */}
      <div 
        className="absolute top-[35%] right-[5%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-purple-200/15 blur-[90px] mix-blend-multiply animate-drift-slow"
        style={{ animationDelay: '8s' }}
      />
    </div>
  );
};
