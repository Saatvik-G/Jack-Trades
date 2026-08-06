'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { ConnectionCard } from '@/components/ConnectionCard';
import { ModeToggle } from '@/components/ModeToggle';
import { ViewMode } from '@/types';
import { track } from '@vercel/analytics';
import { 
  Search, 
  Trash2, 
  Calendar, 
  Filter, 
  Clock, 
  ArrowUpDown, 
  Compass, 
  Loader2, 
  Brain,
  ChevronRight,
  Lightbulb,
  Target,
  ArrowRight,
  GitMerge,
  BookOpen
} from 'lucide-react';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

interface SavedConnection {
  id: string;
  field: string;
  analogy: string;
  explanation: string;
  fun_fact: string;
  emoji: string;
}

interface SavedTopic {
  id: string;
  title: string;
  created_at: string;
  connections: SavedConnection[];
}

interface SavedIdea {
  id: string;
  title: string;
  description: string;
  why_non_obvious: string;
  combined_topics: string[];
  created_at: string;
}

export default function SecondBrainPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'connections' | 'ideas'>('connections');

  // Connections Data
  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<SavedTopic | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(true);
  const [isDeletingTopic, setIsDeletingTopic] = useState<string | null>(null);

  // Ideas Data
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(true);
  const [isDeletingIdea, setIsDeletingIdea] = useState<string | null>(null);
  
  // Search, filter, and sorting state for connections
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('All Fields');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [mode, setMode] = useState<ViewMode>('serious');

  const handleModeToggle = (newMode: ViewMode) => {
    setMode(newMode);
    track('mode_toggled', { page: 'second-brain', mode: newMode });
  };

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load saved topics
  const fetchTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error('Failed to load topics.');
      const data = await res.json();
      setTopics(data.topics || []);
      if (data.topics && data.topics.length > 0) {
        setSelectedTopic(data.topics[0]);
      } else {
        setSelectedTopic(null);
      }
    } catch (err) {
      console.error('Error fetching saved topics:', err);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Load saved ideas
  const fetchIdeas = async () => {
    setIsLoadingIdeas(true);
    try {
      const res = await fetch('/api/ideas');
      if (!res.ok) throw new Error('Failed to load ideas.');
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch (err) {
      console.error('Error fetching saved ideas:', err);
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTopics();
      fetchIdeas();
    }
  }, [status]);

  // Delete topic handler
  const handleDeleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeletingTopic) return;

    if (!confirm('Are you sure you want to delete this topic from your Second Brain?')) {
      return;
    }

    setIsDeletingTopic(topicId);
    try {
      const res = await fetch(`/api/topics?id=${topicId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete.');

      const updatedTopics = topics.filter((t) => t.id !== topicId);
      setTopics(updatedTopics);

      if (selectedTopic?.id === topicId) {
        setSelectedTopic(updatedTopics.length > 0 ? updatedTopics[0] : null);
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('Failed to delete topic. Please try again.');
    } finally {
      setIsDeletingTopic(null);
    }
  };

  // Delete idea handler
  const handleDeleteIdea = async (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeletingIdea) return;

    if (!confirm('Are you sure you want to delete this project idea from your Second Brain?')) {
      return;
    }

    setIsDeletingIdea(ideaId);
    try {
      const res = await fetch(`/api/ideas?id=${ideaId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete idea.');

      setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete idea.');
    } finally {
      setIsDeletingIdea(null);
    }
  };

  // Get unique fields list for filters
  const allFields = Array.from(
    new Set(
      topics.flatMap((t) => t.connections.map((c) => c.field))
    )
  ).sort();

  // Filter and sort logic for topics
  const filteredTopics = topics
    .filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesField = selectedField === 'All Fields' 
        || t.connections.some((c) => c.field === selectedField);
      return matchesSearch && matchesField;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const isGlobalLoading = status === 'loading' || (activeTab === 'connections' ? isLoadingTopics : isLoadingIdeas);

  if (isGlobalLoading) {
    return (
      <div className="min-h-screen flex flex-col text-slate-900 font-sans relative overflow-hidden">
        <NetworkBackground />
        <main className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10 flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest font-heading">
                Syncing Second Brain...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans relative overflow-hidden">
      <NetworkBackground />

      <main className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10 flex-grow flex flex-col">
        <Navbar />

        {/* Header */}
        <div className="py-6 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display flex items-center justify-center md:justify-start gap-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              My Second Brain
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Browse, filter, and review your collected cross-disciplinary connections and project blueprints.
            </p>
          </div>

          {activeTab === 'connections' && topics.length > 0 && selectedTopic && (
            <ModeToggle mode={mode} onToggle={handleModeToggle} />
          )}
        </div>

        {/* Tab Buttons Toggle */}
        <div className="flex gap-3 border-b border-slate-200 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'connections'
                ? 'bg-indigo-600 border border-slate-900 text-white shadow-[2px_2px_0px_#11161B]'
                : 'bg-slate-50 border border-slate-900 hover:bg-slate-100 text-slate-700 shadow-[1px_1px_0px_#11161B]'
            }`}
          >
            Saved Connections ({topics.length})
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ideas'
                ? 'bg-indigo-600 border border-slate-900 text-white shadow-[2px_2px_0px_#11161B]'
                : 'bg-slate-50 border border-slate-900 hover:bg-slate-100 text-slate-700 shadow-[1px_1px_0px_#11161B]'
            }`}
          >
            Saved Project Ideas ({ideas.length})
          </button>
        </div>

        {/* Connections Tab Content */}
        {activeTab === 'connections' && (
          topics.length === 0 ? (
            /* Connections Empty state */
            <div className="flex-grow flex items-center justify-center py-12">
              <div className="w-full max-w-md text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                  No connections saved yet
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Try exploring a topic in the Explorer and bookmarking connection cards to build your brain.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Try exploring a topic
                </button>
              </div>
            </div>
          ) : (
            /* Connections Dashboard Layout */
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Topics List, Search, & Filters */}
              <div className="lg:col-span-5 space-y-4">
                {/* Search & Filter Controls Panel */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-900 shadow-[2px_2px_0px_#11161B] space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search topics..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-900 rounded-lg focus:outline-none focus:shadow-[2px_2px_0px_#11161B] text-sm font-medium"
                    />
                  </div>

                  <div className="flex gap-2">
                    {/* Field Filter */}
                    <div className="flex-1 relative">
                      <Filter className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 bg-white border border-slate-900 rounded-lg text-xs focus:outline-none focus:shadow-[2px_2px_0px_#11161B] font-bold text-slate-700 appearance-none"
                      >
                        <option value="All Fields">All Fields</option>
                        {allFields.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="flex-1 relative">
                      <ArrowUpDown className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="w-full pl-8 pr-2 py-2 bg-white border border-slate-900 rounded-lg text-xs focus:outline-none focus:shadow-[2px_2px_0px_#11161B] font-bold text-slate-700 appearance-none"
                      >
                        <option value="newest">Newest Saved</option>
                        <option value="oldest">Oldest Saved</option>
                        <option value="alphabetical">Alphabetical</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Topics List */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-2 max-h-[60vh] overflow-y-auto pr-1"
                >
                  {filteredTopics.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-200 rounded-2xl bg-white/50">
                      No matching topics found.
                    </div>
                  ) : (
                    filteredTopics.map((item) => {
                      const isSelected = selectedTopic?.id === item.id;
                      const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });

                      return (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          onClick={() => setSelectedTopic(item)}
                          className={`w-full text-left p-4 rounded-xl border border-slate-900 transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-[3px_3px_0px_#11161B] translate-x-[-1px] translate-y-[-1px]'
                              : 'bg-slate-50 text-slate-800 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#11161B] shadow-[1.5px_1.5px_0px_#11161B]'
                          }`}
                        >
                          <div className="space-y-1">
                            <h3 className="font-display font-bold text-base capitalize">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-3 text-[11px] font-medium opacity-80">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formattedDate}
                              </span>
                              <span>•</span>
                              <span>{item.connections.length} fields</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDeleteTopic(item.id, e)}
                              disabled={isDeletingTopic === item.id}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isSelected
                                  ? 'text-indigo-200 hover:text-white hover:bg-indigo-700/60'
                                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title="Delete topic"
                            >
                              {isDeletingTopic === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                            
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                              isSelected ? 'translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                            }`} />
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              </div>

              {/* Right Column: Connection Cards */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {selectedTopic ? (
                    <motion.div
                      key={selectedTopic.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-900 shadow-[2px_2px_0px_#11161B] flex justify-between items-center">
                        <h2 className="font-display font-bold text-lg text-slate-900 capitalize">
                          {selectedTopic.title} Connections
                        </h2>
                        <span className="text-xs font-bold px-3 py-1 rounded-md bg-white border border-slate-900 text-slate-700 shadow-[1px_1px_0px_#11161B]">
                          {selectedTopic.connections.length} Saved Parallel{selectedTopic.connections.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        {selectedTopic.connections.map((c, idx) => {
                          const formattedConn = {
                            id: c.id,
                            field: c.field as any,
                            analogy: c.analogy,
                            explanation: c.explanation,
                            funFact: c.fun_fact,
                            emoji: c.emoji,
                          };

                          return (
                            <ConnectionCard
                              key={c.id}
                              connection={formattedConn}
                              mode={mode}
                              index={idx}
                              isSaved={true}
                            />
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white/50"
                    >
                      Select a topic from the left to view connections.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        )}

        {/* Ideas Tab Content */}
        {activeTab === 'ideas' && (
          ideas.length === 0 ? (
            /* Ideas Empty state */
            <div className="flex-grow flex items-center justify-center py-12">
              <div className="w-full max-w-md text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                  <Lightbulb className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                  No project blueprints saved yet
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Select and intersect different topics using the Idea Generator to synthesize multi-disciplinary buildable blueprints.
                </p>
                <button
                  onClick={() => router.push('/ideas')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Generate new ideas
                </button>
              </div>
            </div>
          ) : (
            /* Ideas List Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ideas.map((idea, idx) => {
                const formattedDate = new Date(idea.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 100 }}
                    className="bg-slate-50 border border-slate-900 rounded-xl p-6 shadow-[3px_3px_0px_#11161B] hover:shadow-[5px_5px_0px_#11161B] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-300 flex flex-col justify-between relative"
                  >
                    <div className="space-y-4">
                      {/* Ribbon of combined topics */}
                      <div className="flex flex-wrap gap-1">
                        {idea.combined_topics.map((topic) => (
                          <span key={topic} className="text-[9px] bg-white border border-slate-900 text-slate-700 font-bold uppercase px-2 py-0.5 rounded shadow-[1px_1px_0px_#11161B]">
                            {topic}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-900 font-display leading-tight">
                          {idea.title}
                        </h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {idea.description}
                        </p>
                      </div>

                      {/* Blueprint Box */}
                      <div className="bg-[linear-gradient(to_right,#cac7bd_1px,transparent_1px),linear-gradient(to_bottom,#cac7bd_1px,transparent_1px)] bg-[size:12px_12px] bg-white border border-slate-900 p-4 rounded-lg relative overflow-hidden shadow-[1px_1px_0px_#11161B]">
                        <div className="absolute top-0 right-0 p-1 bg-indigo-50 border-l border-b border-slate-900 text-[8px] font-bold uppercase text-indigo-650 tracking-wider rounded-bl">
                          blueprint
                        </div>
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Target className="w-2.5 h-2.5 text-indigo-500" />
                          Intersection Dynamics
                        </h4>
                        <p className="text-slate-700 text-xs leading-relaxed italic">
                          "{idea.why_non_obvious}"
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>

                      <button
                        onClick={(e) => handleDeleteIdea(idea.id, e)}
                        disabled={isDeletingIdea === idea.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                        title="Delete Idea"
                      >
                        {isDeletingIdea === idea.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
}
