import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Lightbulb } from 'lucide-react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  isHero?: boolean;
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

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isLoading, isHero = false }) => {
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
    <div className={`w-full ${isHero ? 'max-w-4xl mx-auto my-8 px-0' : 'max-w-3xl mx-auto my-6 px-4'}`}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`relative flex items-center bg-slate-50 border border-slate-900 rounded-xl transition-all duration-200 focus-within:-translate-y-0.5 ${
          isHero 
            ? 'p-2 pl-5 shadow-[4px_4px_0px_#11161B] focus-within:shadow-[6px_6px_0px_#11161B]' 
            : 'p-1.5 pl-4 shadow-[2px_2px_0px_#11161B] focus-within:shadow-[4px_4px_0px_#11161B]'
        }`}>
          <div className="text-slate-500 shrink-0">
            <Search size={isHero ? 22 : 18} />
          </div>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={isHero ? "Type any topic, skill, or concept (e.g. 'recursion', 'placebo effect')..." : "Try 'jealousy', 'recursion', 'entropy'..."}
            className={`flex-grow bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium w-full min-w-0 truncate ${
              isHero ? 'py-4 pl-4 pr-4 text-sm sm:text-base' : 'py-3 pl-3 pr-3 text-xs sm:text-sm'
            }`}
            disabled={isLoading}
          />

          <motion.button
            type="submit"
            disabled={!topic.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`shrink-0 rounded-lg bg-indigo-600 border border-slate-900 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              isHero 
                ? 'px-6 py-3.5 text-xs sm:text-sm shadow-[3px_3px_0px_#11161B] hover:shadow-[4.5px_4.5px_0px_#11161B]' 
                : 'px-4.5 py-2.5 text-xs shadow-[2px_2px_0px_#11161B] hover:shadow-[3px_3px_0px_#11161B]'
            }`}
          >
            <span>Explore</span>
            <ArrowRight className={isHero ? "w-4.5 h-4.5" : "w-4 h-4"} />
          </motion.button>
        </div>
      </form>

      {/* Quick sample chips */}
      <div className={`mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 ${
        isHero ? 'justify-start' : 'justify-center'
      }`}>
        <span className="flex items-center gap-1 font-bold text-slate-450 mr-1 uppercase text-[10px] tracking-wider">
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
