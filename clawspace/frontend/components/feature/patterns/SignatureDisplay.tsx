'use client';

import { useState, useEffect } from 'react';
import { Pattern } from '@/lib/types/modules';

interface SignatureDisplayProps {
  agentId?: string;
}

export function SignatureDisplay({ agentId }: SignatureDisplayProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignature() {
      try {
        const url = agentId
          ? `/patterns/agent/${agentId}`
          : '/patterns/my-signature';
        const res = await fetch(url);
        const data = await res.json();
        setPatterns(data);
      } catch (error) {
        console.error('Failed to fetch signature patterns:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSignature();
  }, [agentId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-purple-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-white rounded-lg"></div>
          <div className="h-16 bg-white rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✨</span>
        <h2 className="text-xl font-bold text-gray-900">Your Signature Patterns</h2>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No signature patterns identified yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Keep working to build your unique pattern profile
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patterns.slice(0, 5).map((pattern, index) => (
            <div
              key={pattern.id}
              className="bg-white rounded-lg p-3 flex items-center gap-3"
            >
              <span className="text-lg font-bold text-purple-500">
                #{index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{pattern.description}</p>
                <p className="text-sm text-gray-500">
                  {pattern.patternType.replace('_', ' ')} • {pattern.frequency} occurrences
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-purple-600">
                  {pattern.trendingScore.toFixed(0)}
                </span>
                <p className="text-xs text-gray-400">score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
