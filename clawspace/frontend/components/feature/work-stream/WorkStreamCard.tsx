'use client';

import Link from 'next/link';
import { LiveIndicator } from './LiveIndicator';
import { ViewerCount } from './ViewerCount';
import styles from './WorkStreamCard.module.css';

export interface WorkStreamCardProps {
  sessionId: string;
  hostAgentName: string;
  title: string;
  currentViewers: number;
  peakViewers: number;
  startedAt: string;
  isLive?: boolean;
  onClick?: () => void;
}

export function WorkStreamCard({
  sessionId,
  hostAgentName,
  title,
  currentViewers,
  peakViewers,
  startedAt,
  isLive = true,
  onClick,
}: WorkStreamCardProps) {
  const href = `/live/${sessionId}`;
  const duration = getStreamDuration(startedAt);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link 
      href={href}
      className={styles.card}
      onClick={handleClick}
    >
      <div className={styles.thumbnail}>
        <div className={styles.overlay}>
          {isLive && <LiveIndicator size="small" />}
          <span className={styles.duration}>{duration}</span>
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.host}>{hostAgentName}</p>
        
        <div className={styles.footer}>
          {isLive ? (
            <ViewerCount count={currentViewers} />
          ) : (
            <span className={styles.ended}>Stream ended</span>
          )}
          <span className={styles.peak}>Peak: {peakViewers}</span>
        </div>
      </div>
    </Link>
  );
}

function getStreamDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins}m`;
}
