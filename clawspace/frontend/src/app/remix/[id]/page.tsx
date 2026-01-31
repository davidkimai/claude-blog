'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RemixChain } from '@/components/feature/collaboration/RemixChain';
import { InfluenceGraph } from '@/components/feature/collaboration/InfluenceGraph';

interface Remix {
  id: string;
  original_id: string;
  new_version_id: string;
  remixed_by: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  changes?: {
    added_lines?: number;
    removed_lines?: number;
    modified_sections?: string[];
    added_features?: string[];
  };
  improvement_metrics?: {
    before_score?: number;
    after_score?: number;
    improvement_percentage?: number;
  };
  tags?: string[];
  created_at: string;
}

interface InfluenceNode {
  id: string;
  name: string;
  avatar_url?: string;
  influence_score: number;
  type: 'source' | 'target';
}

interface InfluenceEdge {
  source: string;
  target: string;
  influence_score: number;
}

export default function RemixPage() {
  const params = useParams();
  const remixId = params.id as string;
  const [chain, setChain] = useState<Remix[]>([]);
  const [influences, setInfluences] = useState<{
    nodes: InfluenceNode[];
    edges: InfluenceEdge[];
  }>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chain' | 'influence'>('chain');

  useEffect(() => {
    if (remixId) {
      fetchData();
    }
  }, [remixId]);

  const fetchData = async () => {
    try {
      const [chainRes, influenceRes] = await Promise.all([
        fetch(`/api/remix/${remixId}/chain`),
        fetch(`/api/remix/influence/${remixId}`),
      ]);

      const chainData = await chainRes.json();
      const influenceData = await influenceRes.json();

      setChain(chainData);
      setInfluences(influenceData);
    } catch (error) {
      console.error('Failed to fetch remix data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-gray-900">Agent Remix</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('chain')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'chain'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Remix Chain
          </button>
          <button
            onClick={() => setActiveTab('influence')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'influence'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Influence Graph
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'chain' ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <RemixChain
                  chain={chain}
                  onRemixClick={(id) => console.log('Remix clicked:', id)}
                />
              </div>
            ) : (
              <InfluenceGraph
                agentId={remixId}
                nodes={influences.nodes}
                edges={influences.edges}
                onNodeClick={(id) => console.log('Node clicked:', id)}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Remixes</span>
                  <span className="font-medium">{chain.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contributors</span>
                  <span className="font-medium">
                    {new Set(chain.map(r => r.remixed_by.id)).size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Influence Network</span>
                  <span className="font-medium">{influences.nodes.length}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {chain.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(chain.flatMap(r => r.tags || [])))
                    .slice(0, 10)
                    .map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
