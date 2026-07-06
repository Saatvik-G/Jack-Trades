'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TopicInput } from '@/components/TopicInput';
import { ModeToggle } from '@/components/ModeToggle';
import { ConnectionCard } from '@/components/ConnectionCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ConnectionResponse, ViewMode } from '@/types';
import { RotateCw, Compass, Layers } from 'lucide-react';

export default function Home() {
  const [topic, setTopic] = useState<string>('');
  const [data, setData] = useState<ConnectionResponse | null>(null);
  const [mode, setMode] = useState<ViewMode>('serious');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async (selectedTopic: string) => {
    setIsLoading(true);
    setError(null);
    setTopic(selectedTopic);

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
    if (topic && !isLoading) {
      fetchConnections(topic);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <main className="w-full max-w-7xl mx-auto px-4 pb-16">
        {/* Top Header */}
        <Header />

        {/* Search / Topic Input Box */}
        <TopicInput onSubmit={fetchConnections} isLoading={isLoading} />

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
          <div className="w-full max-w-6xl mx-auto mt-8 px-4">
            {/* Control Bar above results */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize">
                    "{data.topic}"
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {data.connections.length} Connections
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cross-disciplinary mechanisms discovered across distinct domains.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Serious / Playful Toggle */}
                <ModeToggle mode={mode} onToggle={setMode} />

                {/* Regenerate Button */}
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Generate a fresh set of connections for this topic"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Connection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.connections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  mode={mode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Initial Empty State guidance */}
        {!data && !isLoading && !error && (
          <div className="w-full max-w-2xl mx-auto my-12 text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Ready to Explore Cross-Disciplinary Knowledge
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              Enter any concept or skill above to reveal mechanism-level parallels across Science, Math, Philosophy, History, Art, and Economics.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-6 px-4 bg-white text-center text-slate-500 text-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="italic text-slate-600">
            "A jack of all trades is a master of none, but oftentimes better than a master of one."
          </p>
          <p className="text-slate-400">
            Powered by Gemini API • Polymath Engine
          </p>
        </div>
      </footer>
    </div>
  );
}
