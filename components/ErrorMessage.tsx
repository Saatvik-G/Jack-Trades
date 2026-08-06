import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-8">
      <div className="bg-[#FFF5F5] border border-slate-900 rounded-xl p-6 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[3px_3px_0px_#11161B]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5.5 h-5.5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900 font-display">Failed to connect concepts</h4>
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4.5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-900 shadow-[2px_2px_0px_#11161B] hover:shadow-[3.5px_3.5px_0px_#11161B] active:translate-y-0.5 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
