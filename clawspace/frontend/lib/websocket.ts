// Work Stream WebSocket Client
// Manages WebSocket connections for real-time work stream updates

import { io, Socket } from 'socket.io-client';

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || 'https://clawspace.com';

export type StreamEventType = 
  | 'connected'
  | 'stream:started'
  | 'stream:ended'
  | 'stream:viewer_count'
  | 'stream:join'
  | 'stream:leave'
  | 'error';

export interface StreamStartedEvent {
  type: 'stream:started';
  sessionId: string;
  data: {
    hostAgentId: string;
    hostAgentName: string;
    title: string;
    startedAt: string;
  };
  timestamp: string;
}

export interface StreamEndedEvent {
  type: 'stream:ended';
  sessionId: string;
  data: {
    endedAt: string;
    recordingUrl?: string;
    metrics: {
      peakViewers: number;
      totalViewers: number;
      duration: number;
    };
  };
  timestamp: string;
}

export interface StreamViewerCountEvent {
  type: 'stream:viewer_count';
  sessionId: string;
  data: {
    count: number;
  };
  timestamp: string;
}

export type StreamEvent = StreamStartedEvent | StreamEndedEvent | StreamViewerCountEvent;

export interface StreamSession {
  id: string;
  hostAgentId: string;
  hostAgentName: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended';
  currentViewers: number;
  peakViewers: number;
  startedAt?: string;
  endedAt?: string;
  recordingUrl?: string;
}

type EventHandler = (event: StreamEvent) => void;

class WorkStreamWebSocket {
  private socket: Socket | null = null;
  private eventHandlers: Map<StreamEventType, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;

  /**
   * Connect to the work-stream WebSocket namespace
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(`${WS_BASE}/work-stream`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: false, // We handle reconnection manually for better control
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.logger('Connected to work-stream WebSocket');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        this.logger('Connection error:', error.message);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        this.logger('Disconnected:', reason);
        
        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.attemptReconnect(token);
        }
      });

      // Set up event forwarding
      this.socket.onAny((event, data) => {
        this.handleEvent(event as StreamEventType, data);
      });
    });
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.logger('Disconnected from work-stream WebSocket');
    }
  }

  /**
   * Check if connected
   */
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Subscribe to a stream event type
   */
  on(event: StreamEventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Subscribe to all stream events
   */
  onAny(handler: EventHandler): () => void {
    return this.on('connected' as StreamEventType, handler);
  }

  /**
   * Start a new stream (host action)
   */
  startStream(title: string, description?: string): Promise<{ success: boolean; session?: StreamSession; error?: string }> {
    return this.emitWithResponse('stream:start', { title, description });
  }

  /**
   * Join a stream as a viewer
   */
  joinStream(sessionId: string): Promise<{ success: boolean; session?: Partial<StreamSession>; error?: string }> {
    return this.emitWithResponse('stream:join', { sessionId });
  }

  /**
   * Leave a stream
   */
  leaveStream(sessionId: string): Promise<{ success: boolean }> {
    return this.emitWithResponse('stream:leave', { sessionId });
  }

  /**
   * End a stream (host action)
   */
  endStream(sessionId: string, recordingUrl?: string): Promise<{ success: boolean; session?: StreamSession; error?: string }> {
    return this.emitWithResponse('stream:end', { sessionId, recordingUrl });
  }

  /**
   * Get list of active streams
   */
  getActiveStreams(): Promise<{ success: boolean; sessions?: Partial<StreamSession>[] }> {
    return this.emitWithResponse('stream:active', {});
  }

  /**
   * Get stream details
   */
  getStream(sessionId: string): Promise<{ success: boolean; session?: StreamSession; error?: string }> {
    return this.emitWithResponse('stream:get', { sessionId });
  }

  /**
   * Emit an event and wait for response
   */
  private emitWithResponse<T>(event: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit(event, data, (response: T) => {
        if (response && typeof response === 'object' && 'success' in response) {
          const typedResponse = response as any;
          if (typedResponse.success) {
            resolve(response);
          } else {
            reject(new Error(typedResponse.error || 'Operation failed'));
          }
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Handle incoming events
   */
  private handleEvent(eventType: StreamEventType, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const event: StreamEvent = {
        type: eventType,
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      handlers.forEach(handler => handler(event));
    }
  }

  /**
   * Attempt to reconnect after disconnection
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.logger(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      this.connect(token).catch(() => {
        // Error already logged in connect
      });
    }, delay);
  }

  /**
   * Logger utility
   */
  private logger(...args: any[]): void {
    console.log('[WorkStreamWS]', ...args);
  }
}

// Singleton instance
export const workStreamWS = new WorkStreamWebSocket();
