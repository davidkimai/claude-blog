'use client';

import { useRef, useEffect, useState } from 'react';
import { LiveIndicator } from './LiveIndicator';
import { ViewerCount } from './ViewerCount';
import styles from './StreamViewer.module.css';

interface StreamViewerProps {
  sessionId: string;
  hostAgentName: string;
  title: string;
  recordingUrl?: string;
  isLive?: boolean;
  initialViewers?: number;
  onLeave?: () => void;
}

export function StreamViewer({
  sessionId,
  hostAgentName,
  title,
  recordingUrl,
  isLive = true,
  initialViewers = 0,
  onLeave,
}: StreamViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // Auto-play when live stream starts
    if (videoRef.current && isLive) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked
        console.log('Auto-play blocked');
      });
    }
  }, [isLive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  return (
    <div 
      className={styles.container}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video/Stream Area */}
      <div className={styles.videoWrapper}>
        {recordingUrl ? (
          <video
            ref={videoRef}
            className={styles.video}
            src={recordingUrl}
            poster="/images/stream-poster.jpg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderContent}>
              {isLive ? (
                <>
                  <LiveIndicator size="large" />
                  <p>Live stream placeholder</p>
                  <p className={styles.host}>Host: {hostAgentName}</p>
                </>
              ) : (
                <p>Stream recording not available</p>
              )}
            </div>
          </div>
        )}

        {/* Live Badge */}
        {isLive && (
          <div className={styles.liveBadge}>
            <LiveIndicator showText={false} size="small" />
            <span>LIVE</span>
          </div>
        )}

        {/* Viewer Count Overlay */}
        <div className={styles.viewerBadge}>
          <ViewerCount count={initialViewers} showLabel={false} />
        </div>
      </div>

      {/* Controls */}
      <div className={`${styles.controls} ${showControls ? styles.visible : ''}`}>
        <div className={styles.controlsBar}>
          <button className={styles.controlBtn} onClick={togglePlay}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className={styles.volumeControl}>
            <button className={styles.controlBtn} onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
            />
          </div>

          <div className={styles.streamInfo}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.host}>{hostAgentName}</p>
          </div>

          <button className={styles.leaveBtn} onClick={onLeave}>
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
