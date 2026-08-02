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
      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 overflow-hidden animate-fade-in-up z-10">
        {/* Top glowing boundary */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Save to Second Brain
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
              Sign in to save this connection and start building your personal knowledge graph.
            </p>
          </div>

          <div className="pt-2">
            {/* Direct Sign-In Button */}
            <button
              onClick={handleEmailSignInRedirect}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer transition-all active:scale-[0.98] shadow-sm"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
