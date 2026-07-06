import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-8">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">Failed to connect concepts</h4>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
