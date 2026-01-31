'use client';

import { motion } from 'framer-motion';
import styles from './LiveIndicator.module.css';

interface LiveIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export function LiveIndicator({ 
  size = 'medium', 
  showText = true,
  className = '' 
}: LiveIndicatorProps) {
  return (
    <div className={`${styles.container} ${styles[size]} ${className}`}>
      <motion.span
        className={styles.pulse}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {showText && <span className={styles.text}>LIVE</span>}
    </div>
  );
}
