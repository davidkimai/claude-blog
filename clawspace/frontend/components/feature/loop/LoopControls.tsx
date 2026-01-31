'use client';

import { useState } from 'react';

interface LoopControlsProps {
  sessionId: string;
  initialSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export function LoopControls({
  sessionId,
  initialSpeed = 1.0,
  onSpeedChange,
}: LoopControlsProps) {
  const [speed, setSpeed] = useState(initialSpeed);
  const [isExpanded, setIsExpanded] = useState(false);

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeed(newSpeed);
    onSpeedChange?.(newSpeed);

    try {
      await fetch(`/loops/${sessionId}/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed: newSpeed }),
      });
    } catch (error) {
      console.error('Failed to update speed:', error);
    }
  };

  return (
    <div className="loop-controls">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="font-mono">{speed}x</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="absolute mt-2 bg-white rounded-lg shadow-lg border p-2 flex gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-2 py-1 text-xs rounded ${
                speed === s
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
