'use client';

import { useEffect, useCallback, useRef } from 'react';
import { workStreamWS, StreamEvent, StreamSession } from '../websocket';

interface UseStreamEventsOptions {
  onStreamStarted?: (event: StreamEvent & { type: 'stream:started' }) => void;
  onStreamEnded?: (event: StreamEvent & { type: 'stream:ended' }) => void;
  onViewerCount?: (count: number) => void;
  onError?: (error: any) => void;
}

export function useStreamEvents(options: UseStreamEventsOptions = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Stream started event
    unsubscribers.push(
      workStreamWS.on('stream:started', (event) => {
        optionsRef.current.onStreamStarted?.(event as any);
      })
    );

    // Stream ended event
    unsubscribers.push(
      workStreamWS.on('stream:ended', (event) => {
        optionsRef.current.onStreamEnded?.(event as any);
      })
    );

    // Viewer count updates (convenience handler)
    unsubscribers.push(
      workStreamWS.on('stream:viewer_count', (event: any) => {
        optionsRef.current.onViewerCount?.(event.data.count);
      })
    );

    // Error handler
    unsubscribers.push(
      workStreamWS.on('error', (event: any) => {
        optionsRef.current.onError?.(event);
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const getActiveStreams = useCallback(async () => {
    try {
      const result = await workStreamWS.getActiveStreams();
      return result.sessions || [];
    } catch (error: any) {
      options.onError?.(error);
      return [];
    }
  }, [options]);

  const getStream = useCallback(async (sessionId: string) => {
    try {
      const result = await workStreamWS.getStream(sessionId);
      if (result.success) {
        return result.session;
      }
      return null;
    } catch (error: any) {
      options.onError?.(error);
      return null;
    }
  }, [options]);

  return {
    getActiveStreams,
    getStream,
  };
}
