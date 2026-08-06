import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Lightbulb } from 'lucide-react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

const EXAMPLE_TOPICS = [
  'Recursion',
  'Supply and Demand',
  'Jealousy',
  'A Good First Date',
  'Why Traffic Jams Happen',
  'Muscle Memory',
  'Compound Interest',
  'The Placebo Effect',
  'Gradient Descent',
  'Entropy',
  'Procrastination',
  'Pareto Principle',
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
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-slate-50 border border-slate-900 rounded-xl transition-all duration-200 shadow-[2px_2px_0px_#11161B] focus-within:shadow-[4px_4px_0px_#11161B] focus-within:-translate-y-0.5 p-1.5 pl-4">
          <div className="text-slate-500 shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Try 'jealousy', 'recursion', 'entropy'..."
            className="flex-grow py-3 pl-3 pr-3 text-slate-900 placeholder-slate-400 bg-transparent outline-none text-xs sm:text-sm font-medium w-full min-w-0 truncate"
            disabled={isLoading}
          />

          <motion.button
            type="submit"
            disabled={!topic.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 px-4.5 py-2.5 rounded-lg bg-indigo-600 border border-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_#11161B] cursor-pointer"
          >
            <span>Explore</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </form>

      {/* Quick sample chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-400 mr-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Try exploring:
        </span>
        {EXAMPLE_TOPICS.map((item) => (
          <motion.button
            key={item}
            type="button"
            onClick={() => handleChipClick(item)}
            disabled={isLoading}
            whileHover={{ y: -1, x: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-900 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-[1px_1px_0px_#11161B] hover:shadow-[2.5px_2.5px_0px_#11161B]"
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
