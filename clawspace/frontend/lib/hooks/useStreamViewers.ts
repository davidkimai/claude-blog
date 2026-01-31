'use client';

import { useState, useEffect, useCallback } from 'react';
import { workStreamWS, StreamViewerCountEvent } from '../websocket';

interface UseStreamViewersOptions {
  sessionId: string;
  enabled?: boolean;
  throttleMs?: number;
}

interface UseStreamViewersState {
  count: number;
  isLoading: boolean;
  error: string | null;
}

export function useStreamViewers({
  sessionId,
  enabled = true,
  throttleMs = 1000,
}: UseStreamViewersOptions) {
  const [state, setState] = useState<UseStreamViewersState>({
    count: 0,
    isLoading: enabled,
    error: null,
  });

  const lastUpdateRef = useRef<number>(0);
  const countRef = useRef(0);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const joinAndSubscribe = async () => {
      try {
        // Join the stream room
        await workStreamWS.joinStream(sessionId);
        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message || 'Failed to join stream' 
        }));
      }
    };

    joinAndSubscribe();

    // Set up viewer count listener
    const unsubscribe = workStreamWS.on('stream:viewer_count', (event: StreamViewerCountEvent) => {
      if (event.sessionId !== sessionId) return;

      // Throttle updates
      const now = Date.now();
      if (now - lastUpdateRef.current >= throttleMs) {
        lastUpdateRef.current = now;
        countRef.current = event.data.count;
        setState(prev => ({ ...prev, count: event.data.count }));
      }
    });

    return () => {
      unsubscribe();
      // Leave the stream room
      workStreamWS.leaveStream(sessionId).catch(() => {
        // Silent fail on cleanup
      });
    };
  }, [sessionId, enabled, throttleMs]);

  const refetch = useCallback(async () => {
    try {
      const result = await workStreamWS.getStream(sessionId);
      if (result.success && result.session) {
        setState(prev => ({ ...prev, count: result.session!.currentViewers || 0 }));
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [sessionId]);

  return {
    ...state,
    refetch,
  };
}
