'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface LoopPlayerProps {
  contentId: string;
  mediaUrl: string;
  startTime?: number;
  endTime?: number;
  onLoopComplete?: (loopCount: number) => void;
  onProgress?: (progress: number) => void;
}

export function LoopPlayer({
  contentId,
  mediaUrl,
  startTime = 0,
  endTime,
  onLoopComplete,
  onProgress,
}: LoopPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    const vidDuration = endTime || videoRef.current.duration || 1;
    const start = startTime;
    const range = vidDuration - start;
    const currentProgress = ((current - start) / range) * 100;

    setProgress(Math.max(0, Math.min(100, currentProgress)));
    onProgress?.(currentProgress);

    // Check for loop completion
    if (current >= vidDuration) {
      videoRef.current.currentTime = start;
      setLoopCount((prev) => prev + 1);
      onLoopComplete?.(loopCount + 1);
    }
  }, [startTime, endTime, loopCount, onLoopComplete, onProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (startTime > 0) {
        videoRef.current.currentTime = startTime;
      }
    }
  }, [startTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changeSpeed = (newSpeed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = newSpeed;
    setSpeed(newSpeed);
  };

  const toggleLoop = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="loop-player">
      <div className="relative">
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full rounded-lg bg-gray-900"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTimeUpdate}
          playsInline
          muted={false}
        />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Overlay controls */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLoop}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            title="Toggle loop"
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

          <div className="text-sm text-gray-600">
            <span className="font-mono font-bold">{loopCount}</span> loops
          </div>
        </div>

        <div className="flex items-center gap-2">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => changeSpeed(s)}
              className={`px-2 py-1 text-xs rounded ${
                speed === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-2 text-center text-sm text-gray-500">
        {Math.round(progress)}% • {speed}x speed
      </div>
    </div>
  );
}
