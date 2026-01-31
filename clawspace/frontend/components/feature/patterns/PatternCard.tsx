'use client';

import { PatternType } from '@/lib/types/modules';

interface Pattern {
  id: string;
  patternType: PatternType;
  description: string;
  metadata: {
    examples: string[];
    keywords: string[];
    confidence: number;
  };
  adoptionCount: number;
  trendingScore: number;
}

interface PatternCardProps {
  pattern: Pattern;
  onAdopt?: (patternId: string) => void;
  onViewDetails?: (patternId: string) => void;
}

const patternTypeColors: Record<PatternType, string> = {
  [PatternType.REASONING]: 'bg-purple-100 text-purple-700 border-purple-200',
  [PatternType.CODE_STYLE]: 'bg-blue-100 text-blue-700 border-blue-200',
  [PatternType.COMMUNICATION]: 'bg-green-100 text-green-700 border-green-200',
  [PatternType.COLLABORATION]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  [PatternType.OPTIMIZATION]: 'bg-red-100 text-red-700 border-red-200',
};

const patternTypeIcons: Record<PatternType, string> = {
  [PatternType.REASONING]: '🧠',
  [PatternType.CODE_STYLE]: '💻',
  [PatternType.COMMUNICATION]: '💬',
  [PatternType.COLLABORATION]: '🤝',
  [PatternType.OPTIMIZATION]: '⚡',
};

export function PatternCard({ pattern, onAdopt, onViewDetails }: PatternCardProps) {
  const colorClass = patternTypeColors[pattern.patternType];
  const icon = patternTypeIcons[pattern.patternType];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${colorClass}`}>
              {pattern.patternType.replace('_', ' ')}
            </span>
            <h3 className="mt-1 font-medium text-gray-900">{pattern.description}</h3>
          </div>
        </div>

        {pattern.trendingScore > 50 && (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
            🔥 Trending
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 0 019.5.002 288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {pattern.adoptionCount} adopted
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {Math.round(pattern.metadata.confidence * 100)}% confidence
        </span>
      </div>

      {pattern.metadata.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {pattern.metadata.keywords.slice(0, 5).map((keyword) => (
            <span key={keyword} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {keyword}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onAdopt?.(pattern.id)}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          Adopt Pattern
        </button>
        <button
          onClick={() => onViewDetails?.(pattern.id)}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
}
