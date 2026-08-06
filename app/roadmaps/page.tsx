'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { track } from '@vercel/analytics';
import { 
  Milestone, 
  Map, 
  Plus, 
  Loader2, 
  ArrowRight, 
  Save, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles,
  GitCommit,
  BookOpen
} from 'lucide-react';

interface RoadmapStep {
  stepNumber: number;
  concept: string;
  buildsOn: string;
  borrowedIntuition: string;
  details: string;
}

interface SavedRoadmap {
  id: string;
  goal: string;
  steps: RoadmapStep[];
  created_at: string;
}

interface SavedTopic {
  id: string;
  title: string;
}

export default function RoadmapsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Saved data states
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<SavedRoadmap | null>(null);

  // Form states
  const [goalInput, setGoalInput] = useState<string>('');
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string>('');

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<{ goal: string; steps: RoadmapStep[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rmRes, topicRes] = await Promise.all([
        fetch('/api/roadmaps'),
        fetch('/api/topics')
      ]);

      if (rmRes.ok) {
        const rmData = await rmRes.json();
        setSavedRoadmaps(rmData.roadmaps || []);
        if (rmData.roadmaps && rmData.roadmaps.length > 0) {
          setSelectedRoadmap(rmData.roadmaps[0]);
        }
      }

      if (topicRes.ok) {
        const topicData = await topicRes.json();
        setSavedTopics(topicData.topics || []);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  // Expand all steps by default when a new roadmap is loaded
  useEffect(() => {
    const defaultExpanded: Record<number, boolean> = {};
    const stepsToUse = selectedRoadmap?.steps || generatedRoadmap?.steps;
    if (stepsToUse) {
      stepsToUse.forEach(step => {
        defaultExpanded[step.stepNumber] = true;
      });
      setExpandedSteps(defaultExpanded);
      setCompletedSteps({}); // Reset progress tracker
    }
  }, [selectedRoadmap, generatedRoadmap]);

  const toggleStepExpand = (stepNumber: number) => {
    setExpandedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const toggleStepCompleted = (stepNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalGoal = selectedTopicTitle || goalInput;

    if (!finalGoal || !finalGoal.trim()) {
      setError('Please provide a learning goal topic.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedRoadmap(null);
    setSelectedRoadmap(null);

    try {
      const res = await fetch('/api/roadmaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: finalGoal }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate learning path.');
      }

      const roadmapData = await res.json();
      setGeneratedRoadmap(roadmapData);
      track('roadmap_generated', { goal: finalGoal });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmap = async () => {
    const dataToSave = generatedRoadmap;
    if (!dataToSave) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: dataToSave.goal,
          steps: dataToSave.steps
        }),
      });

      if (!res.ok) throw new Error('Failed to save learning roadmap.');

      const savedData = await res.json();
      const newSavedRoadmap: SavedRoadmap = savedData.roadmap;

      setSavedRoadmaps(prev => [newSavedRoadmap, ...prev]);
      setSelectedRoadmap(newSavedRoadmap);
      setGeneratedRoadmap(null);
      track('roadmap_saved', { goal: dataToSave.goal });
    } catch (err: any) {
      setError(err.message || 'Failed to save roadmap.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this learning roadmap?')) return;

    try {
      const res = await fetch(`/api/roadmaps?id=${roadmapId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete roadmap.');

      const updated = savedRoadmaps.filter(r => r.id !== roadmapId);
      setSavedRoadmaps(updated);
      
      if (selectedRoadmap?.id === roadmapId) {
        setSelectedRoadmap(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error('Delete roadmap error:', err);
      alert('Failed to delete roadmap.');
    }
  };

  const activeRoadmap = selectedRoadmap || generatedRoadmap;

  // Loading skeleton UI
  const renderSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((num) => (
        <div key={num} className="relative flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-100 flex items-center justify-center text-slate-400 font-bold" />
            <div className="w-0.5 h-32 bg-slate-200 border-dashed" />
          </div>
          <div className="flex-grow bg-white/70 backdrop-blur-md rounded-3xl border border-slate-250 p-6 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>
          </div>
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
              <Milestone className="w-8 h-8 text-indigo-600 animate-pulse" />
              Learning Roadmaps
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Generate structured, sequenced, cross-disciplinary paths to master any complex field.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
          {/* Left panel: goal creation and saved roadmap lists */}
          <div className="lg:col-span-4 space-y-6">
            {/* Form Box */}
            <div className="bg-slate-50 border border-slate-900 rounded-xl p-6 shadow-[2px_2px_0px_#11161B] relative">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-650" />
                Define Your Goal
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Saved Topic Pick option */}
                {savedTopics.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Pick from saved topics
                    </label>
                    <select
                      value={selectedTopicTitle}
                      onChange={(e) => {
                        setSelectedTopicTitle(e.target.value);
                        if (e.target.value) setGoalInput('');
                      }}
                      className="w-full bg-white border border-slate-900 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:shadow-[2px_2px_0px_#11161B]"
                    >
                      <option value="">-- Type new goal below --</option>
                      {savedTopics.map((topic) => (
                        <option key={topic.id} value={`master ${topic.title} deeply`}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Text Goal Input */}
                {!selectedTopicTitle && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Or type a custom goal
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. understand quantum computing..."
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-full bg-white border border-slate-900 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:shadow-[2px_2px_0px_#11161B]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating || (!goalInput.trim() && !selectedTopicTitle)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 border border-slate-900 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-[0.98] shadow-[2px_2px_0px_#11161B]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing roadmap...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Path</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List of saved roadmaps */}
            <div className="bg-slate-50 border border-slate-900 rounded-xl p-6 shadow-[2px_2px_0px_#11161B]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Saved Roadmaps ({savedRoadmaps.length})
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : savedRoadmaps.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Map className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">
                    No roadmaps saved yet. Generate one above to begin!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {savedRoadmaps.map((rm) => (
                    <button
                      key={rm.id}
                      onClick={() => {
                        setSelectedRoadmap(rm);
                        setGeneratedRoadmap(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border border-slate-900 flex items-center justify-between gap-3 group transition-all ${
                        selectedRoadmap?.id === rm.id
                          ? 'bg-indigo-600 text-white font-bold shadow-[2px_2px_0px_#11161B] translate-x-[-1px] translate-y-[-1px]'
                          : 'bg-white hover:-translate-y-0.5 text-slate-700 shadow-[1px_1px_0px_#11161B] hover:shadow-[2px_2px_0px_#11161B]'
                      }`}
                    >
                      <span className="truncate text-xs font-semibold uppercase tracking-wide">
                        {rm.goal}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] bg-white border border-slate-900 text-slate-800 px-2 py-0.5 rounded font-bold shadow-[1px_1px_0px_#11161B]">
                          {rm.steps.length} Steps
                        </span>
                        <button
                          onClick={(e) => handleDeleteRoadmap(rm.id, e)}
                          className="p-1 rounded-md border border-transparent hover:border-red-100 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer text-slate-400"
                          title="Delete roadmap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: roadmap display */}
          <div className="lg:col-span-8 flex flex-col">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold">
                {error}
              </div>
            )}

            {isGenerating ? (
              <div className="flex-grow bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-xs">
                <div className="max-w-md mx-auto text-center py-12 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                  <h3 className="font-display font-extrabold text-xl text-slate-900">
                    Plotting Cross-Discipline Logic
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Analyzing mechanism correlations to structure your steps. Gemini is parsing shared analogies across sciences, game theory, and engineering...
                  </p>
                </div>
                {renderSkeleton()}
              </div>
            ) : activeRoadmap ? (
              <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs flex-grow flex flex-col">
                {/* Roadmap Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      Cross-Disciplinary Pathway
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-display mt-2 capitalize">
                      {activeRoadmap.goal}
                    </h2>
                  </div>

                  {/* Save Button for generated roadmaps */}
                  {generatedRoadmap && (
                    <button
                      onClick={handleSaveRoadmap}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 border border-slate-900 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#11161B]"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Roadmap</span>
                    </button>
                  )}
                </div>

                {/* Timeline content */}
                <div className="relative flex-grow pl-4 md:pl-8 space-y-8">
                  {/* Dotted tracer connection line (Signature Detail) */}
                  <div className="absolute left-[20px] md:left-[36px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-indigo-200 pointer-events-none" />

                  {activeRoadmap.steps.map((step) => {
                    const isExpanded = expandedSteps[step.stepNumber] !== false;
                    const isCompleted = completedSteps[step.stepNumber] === true;

                    return (
                      <div key={step.stepNumber} className="relative flex gap-4 md:gap-6">
                        {/* Step Marker Button (Interactive progression tracker) */}
                        <div className="flex flex-col items-center relative z-10">
                          <button
                            onClick={(e) => toggleStepCompleted(step.stepNumber, e)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-900 flex items-center justify-center font-bold text-xs md:text-sm cursor-pointer transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-[1px_1px_0px_#11161B] scale-105'
                                : 'bg-slate-50 hover:bg-indigo-600 hover:text-white shadow-[2px_2px_0px_#11161B]'
                            }`}
                            title={isCompleted ? "Mark incomplete" : "Mark step as complete"}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                            ) : (
                              <span>{step.stepNumber}</span>
                            )}
                          </button>
                        </div>

                        {/* Step Detail Card */}
                        <div 
                          onClick={() => toggleStepExpand(step.stepNumber)}
                          className={`flex-grow rounded-xl border border-slate-900 cursor-pointer p-5 md:p-6 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-slate-100 opacity-60 shadow-[1px_1px_0px_#11161B]'
                              : 'bg-slate-50 shadow-[3px_3px_0px_#11161B] hover:shadow-[5px_5px_0px_#11161B] hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h3 className={`text-base md:text-lg font-bold font-display ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {step.concept}
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-2 pt-2">
                                {step.buildsOn && step.buildsOn !== 'None' && (
                                  <span className="text-[10px] bg-white border border-slate-900 text-slate-700 px-2 py-0.5 rounded font-bold uppercase shadow-[1px_1px_0px_#11161B]">
                                    Builds on: {step.buildsOn}
                                  </span>
                                )}
                                <span className="text-[10px] bg-indigo-50 border border-slate-900 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 shadow-[1px_1px_0px_#11161B]">
                                  <BookOpen className="w-2.5 h-2.5" />
                                  Intuition: {step.borrowedIntuition}
                                </span>
                              </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 p-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mt-3"
                              >
                                <p className="text-slate-650 text-xs md:text-sm leading-relaxed pt-2 border-t border-slate-100">
                                  {step.details}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-grow bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/80 p-12 shadow-xs flex flex-col items-center justify-center text-center">
                <div className="max-w-sm space-y-4">
                  <Map className="w-14 h-14 text-indigo-500 mx-auto animate-bounce" />
                  <h3 className="font-display font-extrabold text-xl text-slate-900">
                    No Pathway Selected
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Input a custom learning goal (like "deep learning") or choose one of your saved topics to generate a structured timeline mapping dependencies and cross-disciplinary intuition.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
