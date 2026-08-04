'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { track } from '@vercel/analytics';
import { 
  Lightbulb, 
  Sparkles, 
  Plus, 
  X, 
  Loader2, 
  Save, 
  CheckCircle,
  HelpCircle,
  Target,
  ArrowRight,
  GitMerge
} from 'lucide-react';

interface GeneratedIdea {
  title: string;
  description: string;
  whyNonObvious: string;
}

interface SavedTopic {
  id: string;
  title: string;
}

export default function IdeasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Saved topics for selection
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(true);

  // Selected topics list
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');

  // Generation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Saving states
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedIndices, setSavedIndices] = useState<Record<number, boolean>>({});

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch saved topics to reuse
  useEffect(() => {
    const fetchSavedTopics = async () => {
      if (status !== 'authenticated') return;
      setIsLoadingTopics(true);
      try {
        const res = await fetch('/api/topics');
        if (res.ok) {
          const data = await res.json();
          setSavedTopics(data.topics || []);
        }
      } catch (err) {
        console.error('Error loading saved topics:', err);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchSavedTopics();
  }, [status]);

  const toggleTopicSelect = (title: string) => {
    setSelectedTopics(prev => 
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;

    if (!selectedTopics.includes(trimmed)) {
      setSelectedTopics(prev => [...prev, trimmed]);
    }
    setCustomTopicInput('');
  };

  const handleRemoveSelectedTopic = (title: string) => {
    setSelectedTopics(prev => prev.filter(t => t !== title));
  };

  const handleGenerateIdeas = async () => {
    if (selectedTopics.length < 2) {
      setError('Please select or add at least 2 fields/topics to combine.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIdeas([]);
    setSavedIndices({});

    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: selectedTopics }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate cross-disciplinary ideas.');
      }

      const data = await res.json();
      setIdeas(data.ideas || []);
      track('ideas_generated', { topicCount: selectedTopics.length });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveIdea = async (idea: GeneratedIdea, index: number) => {
    setSavingIndex(index);
    setError(null);

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          why_non_obvious: idea.whyNonObvious,
          combined_topics: selectedTopics
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save idea.');
      }

      setSavedIndices(prev => ({ ...prev, [index]: true }));
      track('idea_saved', { title: idea.title });
    } catch (err: any) {
      setError(err.message || 'Failed to save project idea.');
    } finally {
      setSavingIndex(null);
    }
  };

  // Rendering loading skeleton card items
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((num) => (
        <div key={num} className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="h-5 bg-slate-200 rounded w-2/3" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-200 rounded w-4/5" />
          </div>
          <div className="h-20 bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans relative overflow-hidden">
      <NetworkBackground />
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10 flex-grow flex flex-col">
        {/* Header */}
        <div className="py-6 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display flex items-center justify-center md:justify-start gap-2.5">
              <Lightbulb className="w-8 h-8 text-indigo-600 animate-pulse" />
              Idea Intersection Generator
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Select multiple fields to synthesize buildable business concepts or research ideas at their intersection.
            </p>
          </div>
        </div>

        {/* Builder Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Pick field panel */}
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                1. Select Fields to Intersect (Need 2+)
              </h2>
              {isLoadingTopics ? (
                <div className="flex items-center gap-2 py-4 text-xs font-semibold text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  Loading your saved topics...
                </div>
              ) : savedTopics.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-2">
                  No saved topics yet in your Second Brain. You can add custom fields in the box on the right.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {savedTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.title);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopicSelect(topic.title)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer active:scale-[0.98] ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {topic.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected topics visual indicator */}
            {selectedTopics.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Selected Combination
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTopics.map((topic, index) => (
                    <React.Fragment key={topic}>
                      {index > 0 && <span className="text-indigo-400 font-bold text-xs">+</span>}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs">
                        {topic}
                        <button 
                          onClick={() => handleRemoveSelectedTopic(topic)}
                          className="hover:bg-indigo-700 p-0.5 rounded-md transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add custom field panel */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                2. Add Custom Topic
              </h2>
              
              <form onSubmit={handleAddCustomTopic} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Behavioral Economics"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  disabled={!customTopicInput.trim()}
                  className="px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 disabled:opacity-50 cursor-pointer flex items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-6">
              <button
                onClick={handleGenerateIdeas}
                disabled={isGenerating || selectedTopics.length < 2}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-all active:scale-[0.98] shadow-sm shadow-indigo-150"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Intersecting Fields...</span>
                  </>
                ) : (
                  <>
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Generate Intersection Ideas</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {isGenerating ? (
          renderSkeleton()
        ) : ideas.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center py-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
                SOCIETY-GRADE BLUEPRINTS SYNTHESIZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ideas.map((idea, index) => {
                const isSaved = savedIndices[index] === true;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-4">
                      {/* Ribbon of combined topics */}
                      <div className="flex flex-wrap gap-1">
                        {selectedTopics.slice(0, 3).map((topic) => (
                          <span key={topic} className="text-[8px] bg-slate-100 text-slate-500 font-bold uppercase px-2 py-0.5 rounded">
                            {topic}
                          </span>
                        ))}
                        {selectedTopics.length > 3 && (
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-bold uppercase px-2 py-0.5 rounded">
                            +{selectedTopics.length - 3} More
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-base font-extrabold text-slate-900 font-display leading-tight">
                          {idea.title}
                        </h3>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                          {idea.description}
                        </p>
                      </div>

                      {/* Intersection mechanics blueprint (Signature Detail) */}
                      <div className="bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:12px_12px] bg-slate-50 border border-slate-200/60 p-4 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1 bg-indigo-50 border-l border-b border-indigo-100 text-[8px] font-bold uppercase text-indigo-600 tracking-wider rounded-bl-lg">
                          blueprint
                        </div>
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Target className="w-2.5 h-2.5 text-indigo-500" />
                          Intersection Dynamics
                        </h4>
                        <p className="text-slate-700 text-xs leading-relaxed italic">
                          "{idea.whyNonObvious}"
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-5 border-t border-slate-100 mt-5">
                      <button
                        onClick={() => handleSaveIdea(idea, index)}
                        disabled={isSaved || savingIndex === index}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default'
                            : 'bg-slate-50 border border-slate-250 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-650 active:scale-[0.98]'
                        }`}
                      >
                        {savingIndex === index ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isSaved ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>{isSaved ? 'Saved to Second Brain!' : 'Save to Second Brain'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/80 p-12 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="max-w-sm space-y-4">
              <GitMerge className="w-14 h-14 text-indigo-500 mx-auto animate-bounce" />
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                No Intersection Configured
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Select 2 or more fields from your list of saved topics or type custom ones above to explore non-obvious business, research, or system intersections.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
