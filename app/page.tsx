'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { TopicInput } from '@/components/TopicInput';
import { ModeToggle } from '@/components/ModeToggle';
import { ConnectionCard } from '@/components/ConnectionCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { NetworkBackground } from '@/components/NetworkBackground';
import { SplashAnimation } from '@/components/SplashAnimation';
import { AuthModal } from '@/components/AuthModal';
import { MagneticButton } from '@/components/MagneticButton';
import { ConnectionResponse, ViewMode } from '@/types';
import { RotateCw, Compass, Network, Sparkles, Loader2 } from 'lucide-react';
import { track } from '@vercel/analytics';

function ExplorerContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [topic, setTopic] = useState<string>('');
  const [data, setData] = useState<ConnectionResponse | null>(null);
  const [mode, setMode] = useState<ViewMode>('serious');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedConnectionIds, setSavedConnectionIds] = useState<string[]>([]);
  const [savingConnectionIds, setSavingConnectionIds] = useState<string[]>([]);

  // Inline auth prompt state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Save Nudge Banner state
  const [showNudge, setShowNudge] = useState<boolean>(false);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Nudge Visibility
  useEffect(() => {
    const hasSaved = localStorage.getItem('hasSavedBefore') === 'true';
    const hasDismissed = localStorage.getItem('hasDismissedNudge') === 'true';
    if (!hasSaved && !hasDismissed) {
      setShowNudge(true);
    }
  }, []);

  // Load search from URL query parameter (e.g. after login redirect)
  useEffect(() => {
    const urlTopic = searchParams.get('topic');
    if (urlTopic && urlTopic.trim() && urlTopic !== topic) {
      fetchConnections(urlTopic.trim());
    }
  }, [searchParams]);

  const fetchConnections = async (selectedTopic: string) => {
    if (isLoading || isDebouncing) return;

    track('topic_search', { topic: selectedTopic });

    setIsLoading(true);
    setIsDebouncing(true);
    setError(null);
    setTopic(selectedTopic);
    setSavedConnectionIds([]); // Reset saved status for new searches
    setSavingConnectionIds([]);

    // 500ms debounce to prevent accidental double-submits
    const debounceTimeout = setTimeout(() => {
      setIsDebouncing(false);
    }, 500);

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: selectedTopic }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch connections');
      }

      setData(json);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err?.message || 'Something went wrong while generating connections.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (topic && !isLoading && !isDebouncing) {
      track('regenerate_clicked', { topic });
      fetchConnections(topic);
    }
  };

  const handleModeToggle = (newMode: ViewMode) => {
    setMode(newMode);
    track('mode_toggled', { page: 'home', mode: newMode });
  };

  const handleSaveConnection = async (connection: any) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (!data || savedConnectionIds.includes(connection.id) || savingConnectionIds.includes(connection.id)) return;

    // Add to saving
    setSavingConnectionIds((prev) => [...prev, connection.id]);

    try {
      const res = await fetch('/api/topics/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: data.topic,
          connections: [connection], // Save ONLY this connection
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to save connection.');
      }

      // Add to saved
      setSavedConnectionIds((prev) => [...prev, connection.id]);

      // Success feedback toast & nudge dismissal
      const isFirstSave = localStorage.getItem('hasSavedBefore') !== 'true';
      if (isFirstSave) {
        localStorage.setItem('hasSavedBefore', 'true');
        setShowNudge(false);
        track('first_save_completed');
      }
      setToastMessage('Saved! View it in your Second Brain');
      setTimeout(() => setToastMessage(null), 3500);

    } catch (err: any) {
      console.error('Failed to save connection:', err);
      setError(err.message || 'Failed to save to Second Brain.');
    } finally {
      // Remove from saving
      setSavingConnectionIds((prev) => prev.filter((id) => id !== connection.id));
    }
  };

  const handleDismissNudge = () => {
    setShowNudge(false);
    localStorage.setItem('hasDismissedNudge', 'true');
  };

  const isInteractionDisabled = isLoading || isDebouncing;

  return (
    <>
      {/* 2-second Splash Animation on First Load */}
      {showSplash && <SplashAnimation onComplete={() => setShowSplash(false)} />}

      <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] text-slate-900 font-sans relative overflow-hidden">
        {/* Subtle SVG constellation background pattern */}
        <NetworkBackground />

        <main className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10">
          {/* Global Navbar */}
          <Navbar />

          {/* Top Header */}
          <Header />

          {/* Search / Topic Input Box */}
          <TopicInput onSubmit={fetchConnections} isLoading={isInteractionDisabled} />

          {/* Loading State */}
          {isLoading && <LoadingSkeleton />}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorMessage
              message={error}
              onRetry={() => topic && fetchConnections(topic)}
            />
          )}

          {/* Results View */}
          {data && !isLoading && (
            <div className="w-full max-w-6xl mx-auto mt-8 px-4 animate-fade-in-up">
              {/* Control Bar above results */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display capitalize">
                      "{data.topic}"
                    </h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100/90 text-indigo-800 border border-indigo-200">
                      {data.connections.length} Domain Connections
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Network className="w-3.5 h-3.5 text-indigo-500" />
                    Structural mechanisms discovered across distinct knowledge domains.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Serious / Playful Toggle */}
                  <ModeToggle mode={mode} onToggle={handleModeToggle} />

                  {/* Regenerate Button */}
                  <MagneticButton
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isInteractionDisabled}
                    className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-xs hover:bg-slate-100 text-slate-700 border border-slate-200/90 font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                    title="Generate a fresh set of connections with randomized fields"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Regenerate</span>
                  </MagneticButton>
                </div>
              </div>

              {/* Value Proposition Save Nudge Banner */}
              {showNudge && (
                <div className="mb-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-indigo-900 text-sm animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Save connections below to start building your personal knowledge graph!</span>
                  </div>
                  <button
                    onClick={handleDismissNudge}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Connection Cards Grid */}
              <motion.div
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.06
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {data.connections.map((connection, idx) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    mode={mode}
                    index={idx}
                    onSave={() => handleSaveConnection(connection)}
                    isSaved={savedConnectionIds.includes(connection.id)}
                    isSaving={savingConnectionIds.includes(connection.id)}
                  />
                ))}
              </motion.div>
            </div>
          )}

          {/* Initial Empty State guidance */}
          {!data && !isLoading && !error && (
            <div className="w-full max-w-2xl mx-auto my-12 text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                Ready to Explore Cross-Disciplinary Knowledge
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                Enter any concept, topic, or experience above to reveal mechanism-level parallels across 16 distinct fields of human thought.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/80 py-6 px-4 bg-white/80 backdrop-blur-md text-center text-slate-500 text-xs relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="italic text-slate-600 font-medium">
              "A jack of all trades is a master of none, but oftentimes better than a master of one."
            </p>
            <p className="text-slate-400 font-mono">
              Powered by Gemini API • Polymath Engine
            </p>
          </div>
        </footer>
      </div>

      {/* Lightweight Auth Modal Dialog */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          currentTopic={topic}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in-up font-medium text-sm border border-indigo-500">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    }>
      <ExplorerContent />
    </Suspense>
  );
}
