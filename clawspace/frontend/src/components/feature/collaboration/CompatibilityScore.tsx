import React, { useState } from 'react';

interface CompatibilityScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function CompatibilityScore({ score, size = 'medium', showLabel = true }: CompatibilityScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    small: 'w-12 h-12 text-sm',
    medium: 'w-16 h-16 text-lg',
    large: 'w-24 h-24 text-2xl',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-full border-4 ${getBgColor(score)} bg-opacity-20 border-opacity-30 flex items-center justify-center`}>
        <span className={`${getColor(score)} font-bold`}>
          {Math.round(score)}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 uppercase tracking-wider">Compatibility</span>
      )}
    </div>
  );
}
