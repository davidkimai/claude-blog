/**
 * ClawSpace Frontend Analytics Library
 * Track engagement events from all frontend features
 */

import { io, Socket } from 'socket.io-client';

// Feature types matching backend
export type FeatureType =
  | 'workstream'
  | 'pair'
  | 'remix'
  | 'loop'
  | 'discovery'
  | 'skill'
  | 'post'
  | 'comment'
  | 'community'
  | 'agent';

// Event types matching backend
export type EngagementEventType =
  | 'view'
  | 'view_detail'
  | 'like'
  | 'unlike'
  | 'bookmark'
  | 'unbookmark'
  | 'create'
  | 'update'
  | 'delete'
  | 'start_collaboration'
  | 'end_collaboration'
  | 'invite'
  | 'accept_invite'
  | 'reject_invite'
  | 'share'
  | 'remix'
  | 'fork'
  | 'adopt_pattern'
  | 'complete_tutorial'
  | 'achieve_milestone'
  | 'discover'
  | 'click'
  | 'follow'
  | 'unfollow'
  | 'agent_propose'
  | 'agent_accept'
  | 'agent_reject'
  | 'agent_message'
  | 'loop_create'
  | 'loop_complete'
  | 'loop_iterate';

// Analytics event payload
export interface AnalyticsEvent {
  user_id: string;
  session_id?: string;
  feature_type: FeatureType;
  feature_id: string;
  parent_feature_type?: FeatureType;
  parent_feature_id?: string;
  event_type: EngagementEventType;
  duration_ms?: number;
  target_user_id?: string;
  agent_id?: string;
  metadata?: Record<string, any>;
  referrer_type?: string;
  referrer_id?: string;
}

// Real-time stats from dashboard
export interface RealtimeStats {
  activeUsersLast5Min: number;
  totalEventsLast5Min: number;
  eventsPerSecond: number;
  featureBreakdown: Record<string, number>;
  topFeatures: Array<{ feature: string; count: number }>;
  topEventTypes: Array<{ eventType: string; count: number }>;
  lastUpdated: string;
}

// Analytics tracking configuration
interface AnalyticsConfig {
  apiUrl?: string;
  batchSize?: number;
  batchTimeout?: number;
  debug?: boolean;
}

// Batch queue item
interface BatchItem {
  event: AnalyticsEvent;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class Analytics {
  private socket: Socket | null = null;
  private eventQueue: BatchItem[] = [];
  private sessionId: string;
  private userId: string | null = null;
  private config: Required<AnalyticsConfig>;
  private batchTimer: NodeJS.Timeout | null = null;
  private viewTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      batchSize: 10,
      batchTimeout: 1000, // 1 second
      debug: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * Initialize analytics with user context
   */
  init(userId: string, config?: Partial<AnalyticsConfig>): void {
    this.userId = userId;
    this.config = { ...this.config, ...config };
    
    if (this.config.debug) {
      console.log('[Analytics] Initialized for user:', userId);
    }

    // Connect to real-time updates
    this.connectSocket();
  }

  /**
   * Connect to real-time dashboard updates
   */
  private connectSocket(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${this.config.apiUrl}/analytics`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      if (this.config.debug) {
        console.log('[Analytics] Socket connected');
      }
    });

    this.socket.on('disconnect', () => {
      if (this.config.debug) {
        console.log('[Analytics] Socket disconnected');
      }
    });

    this.socket.on('stats:update', (stats: RealtimeStats) => {
      // Emit event for subscribers
      window.dispatchEvent(new CustomEvent('analytics:stats-update', { detail: stats }));
    });
  }

  /**
   * Track a single event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'user_id'>): Promise<void> {
    if (!this.userId) {
      console.warn('[Analytics] User not initialized');
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      user_id: this.userId,
      session_id: this.sessionId,
    };

    return new Promise((resolve, reject) => {
      this.eventQueue.push({ event: fullEvent, resolve, reject });
      this.scheduleBatch();
    });
  }

  /**
   * Schedule batch processing
   */
  private scheduleBatch(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flushBatch();
    }, this.config.batchTimeout);
  }

  /**
   * Flush event batch to backend
   */
  private async flushBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.eventQueue.length === 0) return;

    // Take up to batchSize events
    const batch = this.eventQueue.splice(0, this.config.batchSize);

    if (batch.length === 0) return;

    const events = batch.map(item => item.event);

    try {
      const response = await fetch(`${this.config.apiUrl}/analytics/ingest/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`Batch upload failed: ${response.status}`);
      }

      // Resolve all promises in batch
      batch.forEach(item => item.resolve(undefined));
    } catch (error) {
      // Reject all promises and re-queue events
      batch.forEach(item => item.reject(error));
      
      // Re-queue failed events at the front
      this.eventQueue.unshift(...batch);
    }
  }

  /**
   * Track workstream view with duration
   */
  trackWorkStreamView(sessionId: string, duration: number): void {
    this.trackEvent({
      feature_type: 'workstream',
      feature_id: sessionId,
      event_type: 'view',
      duration_ms: duration,
    });
  }

  /**
   * Track pair proposal
   */
  trackPairProposal(agentA: string, agentB: string, proposedBy: string): void {
    this.trackEvent({
      feature_type: 'pair',
      feature_id: `${agentA}-${agentB}`,
      event_type: 'agent_propose',
      target_user_id: proposedBy,
      agent_id: agentB,
      metadata: {
        agent_a: agentA,
        agent_b: agentB,
      },
    });
  }

  /**
   * Track remix action
   */
  trackRemix(originalId: string, remixId: string, remixType: string): void {
    this.trackEvent({
      feature_type: 'remix',
      feature_id: remixId,
      parent_feature_type: 'post',
      parent_feature_id: originalId,
      event_type: 'remix',
      metadata: {
        remix_type: remixType,
      },
    });
  }

  /**
   * Track pattern adoption
   */
  trackPatternAdoption(patternId: string, sourceFeature: FeatureType): void {
    this.trackEvent({
      feature_type: 'skill',
      feature_id: patternId,
      parent_feature_type: sourceFeature,
      event_type: 'adopt_pattern',
    });
  }

  /**
   * Track loop creation
   */
  trackLoopCreate(loopId: string, templateId?: string): void {
    this.trackEvent({
      feature_type: 'loop',
      feature_id: loopId,
      event_type: 'loop_create',
      metadata: {
        template_id: templateId,
      },
    });
  }

  /**
   * Track loop completion
   */
  trackLoopComplete(loopId: string, duration: number, iterations: number): void {
    this.trackEvent({
      feature_type: 'loop',
      feature_id: loopId,
      event_type: 'loop_complete',
      duration_ms: duration,
      metadata: {
        iterations,
      },
    });
  }

  /**
   * Track discovery click
   */
  trackDiscoveryClick(contentId: string, contentType: FeatureType, source: string): void {
    this.trackEvent({
      feature_type: 'discovery',
      feature_id: contentId,
      event_type: 'click',
      referrer_type: source,
    });

    // Also track as a feature transition
    this.trackFeatureTransition('discovery', contentId, contentType, contentId, 'discover_click');
  }

  /**
   * Track collaboration start
   */
  trackCollaborationStart(
    collaborationId: string,
    featureType: FeatureType,
    participantIds: string[],
  ): void {
    this.trackEvent({
      feature_type: featureType,
      feature_id: collaborationId,
      event_type: 'start_collaboration',
      metadata: {
        participants: participantIds,
        participant_count: participantIds.length,
      },
    });
  }

  /**
   * Track collaboration end
   */
  trackCollaborationEnd(
    collaborationId: string,
    featureType: FeatureType,
    outcome: 'completed' | 'abandoned' | 'timeout',
  ): void {
    this.trackEvent({
      feature_type: featureType,
      feature_id: collaborationId,
      event_type: 'end_collaboration',
      metadata: {
        outcome,
      },
    });
  }

  /**
   * Track agent interaction
   */
  trackAgentInteraction(
    agentId: string,
    action: 'propose' | 'accept' | 'reject' | 'message',
    targetId?: string,
  ): void {
    const eventType: EngagementEventType = `agent_${action}` as EngagementEventType;
    
    this.trackEvent({
      feature_type: 'agent',
      feature_id: agentId,
      event_type: eventType,
      target_user_id: targetId,
      agent_id: agentId,
    });
  }

  /**
   * Track feature transition (internal helper)
   */
  private async trackFeatureTransition(
    fromFeature: FeatureType,
    fromFeatureId: string,
    toFeature: FeatureType,
    toFeatureId: string,
    transitionType: string,
    originDuration?: number,
  ): Promise<void> {
    try {
      await fetch(`${this.config.apiUrl}/analytics/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.userId,
          session_id: this.sessionId,
          from_feature_type: fromFeature,
          from_feature_id: fromFeatureId,
          to_feature_type: toFeature,
          to_feature_id: toFeatureId,
          transition_type: transitionType,
          origin_duration_ms: originDuration,
        }),
      });
    } catch (error) {
      console.error('[Analytics] Failed to track transition:', error);
    }
  }

  /**
   * Subscribe to real-time stats updates
   */
  onStatsUpdate(callback: (stats: RealtimeStats) => void): () => void {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('analytics:stats-update', handler as EventListener);
    return () => window.removeEventListener('analytics:stats-update', handler as EventListener);
  }

  /**
   * Flush remaining events before unload
   */
  flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.eventQueue.length === 0) {
        resolve();
        return;
      }

      // Wait for current batch to complete
      const checkInterval = setInterval(() => {
        if (this.eventQueue.length === 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Force flush
      this.flushBatch();
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Disconnect and cleanup
   */
  destroy(): void {
    this.flush().then(() => {
      this.socket?.disconnect();
      this.socket = null;
      
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }

      // Clear view timers
      this.viewTimers.forEach(timer => clearTimeout(timer));
      this.viewTimers.clear();
    });
  }
}

// Singleton instance
export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
  return analytics;
}
