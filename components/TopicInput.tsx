import React, { useState } from 'react';
import { Search, ArrowRight, Lightbulb } from 'lucide-react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

const EXAMPLE_TOPICS = [
  'Gradient Descent',
  'Supply and Demand',
  'Recursion',
  'Photosynthesis',
  'Game Theory',
  'Entropy',
];

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  const handleChipClick = (example: string) => {
    setTopic(example);
    if (!isLoading) {
      onSubmit(example);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:shadow-md">
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type any topic, concept, or skill (e.g. 'recursion', 'supply & demand')..."
            className="w-full py-4 pl-3 pr-28 text-slate-800 placeholder-slate-400 bg-transparent outline-none text-base sm:text-lg"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="absolute right-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
          >
            <span>Explore</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick sample chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-400">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Try:
        </span>
        {EXAMPLE_TOPICS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleChipClick(item)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};
