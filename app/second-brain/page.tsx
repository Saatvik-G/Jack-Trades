'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { ConnectionCard } from '@/components/ConnectionCard';
import { ModeToggle } from '@/components/ModeToggle';
import { ViewMode } from '@/types';
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
  ChevronRight
} from 'lucide-react';

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

export default function SecondBrainPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<SavedTopic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Search, filter, and sorting state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('All Fields');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [mode, setMode] = useState<ViewMode>('serious');

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load saved topics
  const fetchTopics = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTopics();
    }
  }, [status]);

  // Delete handler
  const handleDeleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    if (!confirm('Are you sure you want to delete this topic from your Second Brain?')) {
      return;
    }

    setIsDeleting(topicId);
    try {
      const res = await fetch(`/api/topics?id=${topicId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete.');

      // Remove from list
      const updatedTopics = topics.filter((t) => t.id !== topicId);
      setTopics(updatedTopics);

      // Adjust selected topic if it was deleted
      if (selectedTopic?.id === topicId) {
        setSelectedTopic(updatedTopics.length > 0 ? updatedTopics[0] : null);
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('Failed to delete topic. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Get unique fields list for filters
  const allFields = Array.from(
    new Set(
      topics.flatMap((t) => t.connections.map((c) => c.field))
    )
  ).sort();

  // Filter and sort logic
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative overflow-hidden">
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative overflow-hidden">
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
              Browse, filter, and review your collected cross-disciplinary connections.
            </p>
          </div>

          {topics.length > 0 && selectedTopic && (
            <ModeToggle mode={mode} onToggle={setMode} />
          )}
        </div>

        {topics.length === 0 ? (
          /* Empty state */
          <div className="flex-grow flex items-center justify-center py-12">
            <div className="w-full max-w-md text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                Your Second Brain is Empty
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                You haven't saved any cross-disciplinary topics yet. Go to the Explorer and save your first topic!
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Go to Explorer
              </button>
            </div>
          </div>
        ) : (
          /* Dashboard Layout */
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Topics List, Search, & Filters (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Search & Filter Controls Panel */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topics..."
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  {/* Field Filter */}
                  <div className="flex-1 relative">
                    <Filter className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-white font-semibold text-slate-600 appearance-none"
                    >
                      <option value="All Fields">All Fields</option>
                      {allFields.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="flex-1 relative">
                    <ArrowUpDown className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-white font-semibold text-slate-600 appearance-none"
                    >
                      <option value="newest">Newest Saved</option>
                      <option value="oldest">Oldest Saved</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
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
                      <div
                        key={item.id}
                        onClick={() => setSelectedTopic(item)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-xs'
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
                            disabled={isDeleting === item.id}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'text-indigo-200 hover:text-white hover:bg-indigo-700/60'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete topic"
                          >
                            {isDeleting === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                            isSelected ? 'translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                          }`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Column: Connection Cards (7 cols) */}
            <div className="lg:col-span-7">
              {selectedTopic ? (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex justify-between items-center">
                    <h2 className="font-display font-bold text-lg text-slate-900 capitalize">
                      {selectedTopic.title} Connections
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                      {selectedTopic.connections.length} Saved Parallel{selectedTopic.connections.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedTopic.connections.map((c, idx) => {
                      // Adapt schema connection to fit ConnectionCard interface expects { funFact, emoji }
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
                          isSaved={true} // It is already saved!
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white/50">
                  Select a topic from the left to view connections.
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
