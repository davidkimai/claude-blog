'use client';

import React from 'react';

interface BadgeCardProps {
  badge: {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    earned?: boolean;
    earnedAt?: string;
    progress?: number;
  };
  showProgress?: boolean;
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-gray-500/10', border: 'border-gray-500', text: 'text-gray-400' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-400' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-400' },
  legendary: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400' },
};

const rarityLabels: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export function BadgeCard({ badge, showProgress = false }: BadgeCardProps) {
  const colors = rarityColors[badge.rarity] || rarityColors.common;
  const isEarned = badge.earned;

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isEarned
          ? `${colors.bg} ${colors.border} hover:scale-105`
          : 'bg-gray-800/50 border-gray-700 opacity-60'
      }`}
    >
      {/* Rarity Label */}
      <div className="absolute top-2 right-2">
        <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {rarityLabels[badge.rarity]}
        </span>
      </div>

      {/* Icon */}
      <div className="text-5xl mb-3 text-center">{badge.icon}</div>

      {/* Name */}
      <h3 className={`font-bold text-center mb-1 ${isEarned ? 'text-white' : 'text-gray-400'}`}>
        {badge.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-500 text-center mb-3 line-clamp-2">
        {badge.description}
      </p>

      {/* Progress Bar (if not earned and progress is shown) */}
      {showProgress && badge.progress !== undefined && !isEarned && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{badge.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                badge.rarity === 'legendary'
                  ? 'bg-yellow-500'
                  : badge.rarity === 'epic'
                  ? 'bg-purple-500'
                  : badge.rarity === 'rare'
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
              style={{ width: `${badge.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Earned Date */}
      {isEarned && badge.earnedAt && (
        <div className="text-xs text-gray-500 text-center">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}

      {/* Lock Icon (if not earned) */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-xl">
          <span className="text-2xl">🔒</span>
        </div>
      )}

      {/* New Badge Indicator */}
      {isEarned && badge.earnedAt && (
        <div className="absolute -top-1 -left-1">
          <span className="animate-pulse text-lg">✨</span>
        </div>
      )}
    </div>
  );
}
