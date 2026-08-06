'use client';

import React from 'react';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  currentTopic: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, currentTopic }) => {
  const getCallbackUrl = () => {
    if (typeof window !== 'undefined') {
      const topicParam = currentTopic ? `?topic=${encodeURIComponent(currentTopic)}` : '';
      return `${window.location.origin}${topicParam}`;
    }
    return '/';
  };

  const handleEmailSignInRedirect = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(getCallbackUrl())}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-slate-50 rounded-xl border border-slate-900 shadow-[4px_4px_0px_#11161B] p-8 overflow-hidden animate-fade-in-up z-10">
        {/* Top solid boundary */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-900 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-[1px_1px_0px_#11161B] hover:shadow-[2px_2px_0px_#11161B]"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="text-center space-y-5">
          <div className="w-12 h-12 rounded-lg bg-white text-indigo-650 flex items-center justify-center mx-auto border border-slate-900 shadow-[1.5px_1.5px_0px_#11161B]">
            <Lock className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Save to Second Brain
            </h3>
            <p className="text-slate-650 text-xs leading-relaxed max-w-xs mx-auto">
              Sign in to save this connection and start building your personal knowledge graph.
            </p>
          </div>

          <div className="pt-2">
            {/* Direct Sign-In Button */}
            <button
              onClick={handleEmailSignInRedirect}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 border border-slate-900 hover:bg-indigo-750 focus:outline-none focus:shadow-[2px_2px_0px_#11161B] cursor-pointer shadow-[2px_2px_0px_#11161B] hover:shadow-[3px_3px_0px_#11161B] active:translate-y-0.5 transition-all"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
