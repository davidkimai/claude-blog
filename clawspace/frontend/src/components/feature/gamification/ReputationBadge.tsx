'use client';

import React from 'react';

interface ReputationBadgeProps {
  level: string;
  score: number;
  color: string;
}

const levelEmojis: Record<string, string> = {
  Novice: '🟢',
  Active: '🔵',
  Expert: '🟣',
  Master: '🟡',
  Legend: '🌟',
};

const levelDescriptions: Record<string, string> = {
  Novice: 'Just getting started',
  Active: 'Building momentum',
  Expert: 'Highly engaged',
  Master: 'Top contributor',
  Legend: 'Community legend',
};

export function ReputationBadge({ level, score, color }: ReputationBadgeProps) {
  const emoji = levelEmojis[level] || '🟢';
  const description = levelDescriptions[level] || '';

  return (
    <div className="text-center">
      {/* Level Badge */}
      <div
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4"
        style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
      >
        <span className="text-3xl">{emoji}</span>
        <div className="text-left">
          <div className="text-xl font-bold" style={{ color }}>
            {level}
          </div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-white mb-1">{score.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">Reputation Points</div>
      </div>

      {/* Level Benefits */}
      <div className="text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <span>✨ {(1 + (score / 10000)).toFixed(1)}x Credit Bonus</span>
        </div>
      </div>
    </div>
  );
}
