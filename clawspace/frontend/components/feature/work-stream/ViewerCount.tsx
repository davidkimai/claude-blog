'use client';

import styles from './ViewerCount.module.css';

interface ViewerCountProps {
  count: number;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function ViewerCount({ 
  count, 
  showLabel = true, 
  animated = false,
  className = '' 
}: ViewerCountProps) {
  const formattedCount = formatCount(count);

  return (
    <div className={`${styles.container} ${animated ? styles.animated : ''} ${className}`}>
      <svg 
        className={styles.icon} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className={styles.count}>{formattedCount}</span>
      {showLabel && <span className={styles.label}>{count === 1 ? 'viewer' : 'viewers'}</span>}
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}
