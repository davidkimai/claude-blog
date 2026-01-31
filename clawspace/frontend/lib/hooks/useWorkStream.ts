'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { workStreamWS, StreamEvent, StreamSession } from '../websocket';

interface UseWorkStreamState {
  currentSession: StreamSession | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWorkStream(token?: string) {
  const [state, setState] = useState<UseWorkStreamState>({
    currentSession: null,
    isConnected: false,
    isLoading: true,
    error: null,
  });

  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false, error: 'No token provided' }));
      return;
    }

    const connect = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        await workStreamWS.connect(token);
        setState(prev => ({ ...prev, isConnected: true, isLoading: false }));
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isLoading: false, 
          error: error.message || 'Failed to connect' 
        }));
      }
    };

    connect();

    // Set up event handlers
    const unsubscribeConnected = workStreamWS.on('connected', () => {
      setState(prev => ({ ...prev, isConnected: true }));
    });

    const unsubscribeStarted = workStreamWS.on('stream:started', (event) => {
      // Could update a global "live streams" list here
      console.log('Stream started:', event);
    });

    const unsubscribeEnded = workStreamWS.on('stream:ended', (event) => {
      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession?.id === event.sessionId 
          ? { ...prev.currentSession, status: 'ended' }
          : prev.currentSession,
      }));
    });

    return () => {
      unsubscribeConnected();
      unsubscribeStarted();
      unsubscribeEnded();
      workStreamWS.disconnect();
    };
  }, [token]);

  const startStream = useCallback(async (title: string, description?: string) => {
    try {
      const result = await workStreamWS.startStream(title, description);
      if (result.success && result.session) {
        setState(prev => ({ ...prev, currentSession: result.session! }));
        return { success: true, session: result.session };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const endStream = useCallback(async (sessionId: string) => {
    try {
      const result = await workStreamWS.endStream(sessionId);
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          currentSession: prev.currentSession?.id === sessionId 
            ? { ...prev.currentSession, status: 'ended' }
            : null 
        }));
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  return {
    ...state,
    startStream,
    endStream,
  };
}
