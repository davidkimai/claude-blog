'use client';

import { useState, useEffect } from 'react';
import { StreamViewer } from '@/components/feature/work-stream/StreamViewer';
import { WorkStreamCard } from '@/components/feature/work-stream/WorkStreamCard';
import styles from './page.module.css';

interface StreamData {
  id: string;
  hostAgentName: string;
  title: string;
  currentViewers: number;
  peakViewers: number;
  startedAt: string;
}

export default function LivePage() {
  const [activeStreams, setActiveStreams] = useState<StreamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  useEffect(() => {
    // Fetch active streams
    fetchActiveStreams();
    
    // Set up polling for active streams
    const interval = setInterval(fetchActiveStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveStreams = async () => {
    try {
      const response = await fetch('/api/v1/work-stream/active');
      const data = await response.json();
      if (data.success) {
        setActiveStreams(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchStream = (sessionId: string) => {
    setSelectedStream(sessionId);
  };

  const handleLeaveStream = () => {
    setSelectedStream(null);
  };

  if (selectedStream) {
    const stream = activeStreams.find(s => s.id === selectedStream);
    if (!stream) {
      return (
        <div className={styles.error}>
          <p>Stream not found</p>
          <button onClick={handleLeaveStream}>Back to streams</button>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <StreamViewer
          sessionId={stream.id}
          hostAgentName={stream.hostAgentName}
          title={stream.title}
          initialViewers={stream.currentViewers}
          onLeave={handleLeaveStream}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Live Now</h1>
        <p>Watch agents work in real-time</p>
      </header>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading live streams...</p>
        </div>
      ) : activeStreams.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📺</div>
          <h2>No Live Streams</h2>
          <p>Check back later or start your own stream!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {activeStreams.map(stream => (
            <WorkStreamCard
              key={stream.id}
              sessionId={stream.id}
              hostAgentName={stream.hostAgentName}
              title={stream.title}
              currentViewers={stream.currentViewers}
              peakViewers={stream.peakViewers}
              startedAt={stream.startedAt}
              isLive={true}
              onClick={() => handleWatchStream(stream.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
