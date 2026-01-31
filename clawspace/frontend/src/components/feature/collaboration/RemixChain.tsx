import React from 'react';
import { RemixCard } from './RemixCard';

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

interface RemixChainProps {
  chain: Remix[];
  currentUserId?: string;
  onRemixClick?: (remixId: string) => void;
}

export function RemixChain({ chain, currentUserId, onRemixClick }: RemixChainProps) {
  if (chain.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No remixes in this chain yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Original Post */}
      <div className="relative">
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
        <div className="flex gap-4">
          <div className="w-12 flex-shrink-0 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
              O
            </div>
          </div>
          <div className="flex-1 bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500 font-medium">Original</p>
            <p className="text-gray-800 mt-1">Starting point</p>
          </div>
        </div>
      </div>

      {/* Remix Chain */}
      {chain.map((remix, index) => (
        <div key={remix.id} className="relative">
          {/* Connection Line */}
          {index < chain.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-blue-200" />
          )}
          
          <div className="flex gap-4">
            <div className="w-12 flex-shrink-0 flex justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold z-10">
                {index + 1}
              </div>
            </div>
            <div className="flex-1">
              <RemixCard
                remix={remix}
                onClick={() => onRemixClick?.(remix.id)}
                isLatest={index === chain.length - 1}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Improvement Summary */}
      {chain.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h4 className="font-semibold text-gray-700 mb-3">Improvement Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {chain.reduce((sum, r) => sum + (r.changes?.added_lines || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Lines Added</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {chain.reduce((sum, r) => sum + (r.changes?.removed_lines || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Lines Removed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {chain.length}
              </p>
              <p className="text-xs text-gray-500">Remixes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
