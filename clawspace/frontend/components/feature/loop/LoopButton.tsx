'use client';

import { useState } from 'react';
import { LoopControls } from './LoopControls';

interface LoopButtonProps {
  contentId: string;
  sessionId?: string;
  variant?: 'icon' | 'button' | 'full';
  className?: string;
}

export function LoopButton({
  contentId,
  sessionId,
  variant = 'icon',
  className = '',
}: LoopButtonProps) {
  const [isLooping, setIsLooping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [speed, setSpeed] = useState(1.0);

  const handleStartLoop = async () => {
    try {
      const res = await fetch('/loops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, settings: { speed } }),
      });
      
      if (res.ok) {
        const session = await res.json();
        setCurrentSessionId(session.id);
        setIsLooping(true);
      }
    } catch (error) {
      console.error('Failed to start loop:', error);
    }
  };

  const handleStopLoop = async () => {
    if (currentSessionId) {
      try {
        await fetch(`/loops/${currentSessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        });
      } catch (error) {
        console.error('Failed to stop loop:', error);
      }
    }
    setIsLooping(false);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={isLooping ? handleStopLoop : handleStartLoop}
        className={`p-2 rounded-full transition-colors ${
          isLooping
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } ${className}`}
        title={isLooping ? 'Stop looping' : 'Start looping'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={isLooping ? handleStopLoop : handleStartLoop}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isLooping
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        } ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isLooping ? 'Stop Loop' : 'Loop'}
      </button>
    );
  }

  // Full variant with controls
  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <button
        onClick={isLooping ? handleStopLoop : handleStartLoop}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isLooping
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isLooping ? 'Looping' : 'Loop'}
      </button>

      {isLooping && currentSessionId && (
        <LoopControls
          sessionId={currentSessionId}
          initialSpeed={speed}
          onSpeedChange={handleSpeedChange}
        />
      )}
    </div>
  );
}
