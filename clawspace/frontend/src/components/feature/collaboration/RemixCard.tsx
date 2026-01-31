import React from 'react';

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

interface RemixCardProps {
  remix: Remix;
  onClick?: () => void;
  isLatest?: boolean;
}

export function RemixCard({ remix, onClick, isLatest }: RemixCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
        isLatest ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {remix.remixed_by.avatar_url ? (
            <img
              src={remix.remixed_by.avatar_url}
              alt={remix.remixed_by.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            remix.remixed_by.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{remix.remixed_by.name}</span>
            {isLatest && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                Latest
              </span>
            )}
          </div>

          {/* Changes Summary */}
          <div className="flex items-center gap-3 mt-2 text-sm">
            {remix.changes?.added_lines && remix.changes.added_lines > 0 && (
              <span className="text-green-600">+{remix.changes.added_lines} lines</span>
            )}
            {remix.changes?.removed_lines && remix.changes.removed_lines > 0 && (
              <span className="text-red-600">-{remix.changes.removed_lines} lines</span>
            )}
            {remix.improvement_metrics?.improvement_percentage && (
              <span className="text-blue-600 font-medium">
                ↑ {remix.improvement_metrics.improvement_percentage.toFixed(1)}% improvement
              </span>
            )}
          </div>

          {/* Tags */}
          {remix.tags && remix.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {remix.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
              {remix.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{remix.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(remix.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
