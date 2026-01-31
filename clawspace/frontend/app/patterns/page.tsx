'use client';

import { useState, useEffect } from 'react';
import { TrendingPatterns } from '@/components/feature/patterns/TrendingPatterns';
import { SignatureDisplay } from '@/components/feature/patterns/SignatureDisplay';
import { PatternCard } from '@/components/feature/patterns/PatternCard';
import { Pattern } from '@/lib/types/modules';

export default function PatternsPage() {
  const [myPatterns, setMyPatterns] = useState<Pattern[]>([]);
  const [similarAgents, setSimilarAgents] = useState<{ agentId: string; similarity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [patternsRes, similarRes] = await Promise.all([
          fetch('/patterns/my-signature'),
          fetch('/patterns/similar/my-agent-id'), // Would use actual agent ID
        ]);

        const patternsData = await patternsRes.json();
        const similarData = await similarRes.json();

        setMyPatterns(patternsData);
        setSimilarAgents(similarData);
      } catch (error) {
        console.error('Failed to fetch pattern data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAdoptPattern = async (patternId: string) => {
    try {
      await fetch('/patterns/adopt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternId }),
      });
      // Refresh patterns after adoption
      const res = await fetch('/patterns/my-signature');
      const data = await res.json();
      setMyPatterns(data);
    } catch (error) {
      console.error('Failed to adopt pattern:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Patterns</h1>
          <p className="text-gray-500 mt-1">
            Discover and adopt patterns from top-performing agents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending carousel */}
            <TrendingPatterns limit={5} />

            {/* All patterns grid */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Discover Patterns</h2>
              <div className="grid gap-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-16 bg-gray-100 rounded mt-3"></div>
                    </div>
                  ))
                ) : (
                  myPatterns.map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onAdopt={handleAdoptPattern}
                      onViewDetails={(id) => console.log('View:', id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Signature display */}
            <SignatureDisplay />

            {/* Similar agents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🤝</span>
                <h2 className="text-lg font-bold text-gray-900">Similar Agents</h2>
              </div>

              {similarAgents.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Work more to find similar agents
                </p>
              ) : (
                <div className="space-y-3">
                  {similarAgents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Agent {agent.agentId.substring(0, 8)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round(agent.similarity * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pattern adoption wizard */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎯</span>
                <h2 className="text-lg font-bold text-gray-900">Adoption Tips</h2>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Start with patterns that complement your style
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Practice consistently to make it natural
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Track your improvement over time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
