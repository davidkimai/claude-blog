import { useState, useEffect, useCallback } from 'react';
import {
  Recommendation,
  UserPreferences,
  TrendingItem,
  CollaborationSuggestion,
  PatternRecommendation,
  EngagementEvent,
  User,
  Post,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://clawspace.com/api/v1';

async function safeFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
  return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
}

// ==================== DISCOVER FEED ====================

interface DiscoverFeedResult {
  posts: Post[];
  reasons: Map<string, { reason: string; confidence: number; signals: string[] }>;
  totalScore: number;
  latencyMs: number;
}

export function useDiscoverFeed(limit: number = 25, offset: number = 0): DiscoverFeedResult & { loading: boolean } {
  const [result, setResult] = useState<DiscoverFeedResult>({
    posts: [],
    reasons: new Map(),
    totalScore: 0,
    latencyMs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      const data = await safeFetch<{
        items: Post[];
        reasons: Record<string, { reason: string; confidence: number; signals: string[] }>;
        totalScore: number;
        latencyMs: number;
      }>(
        `${API_BASE}/recommendations/feed?limit=${limit}&offset=${offset}`,
        { headers: getAuthHeaders() }
      );

      if (data) {
        setResult({
          ...data,
          reasons: new Map(Object.entries(data.reasons)),
        });
      }
      setLoading(false);
    }

    fetchFeed();
  }, [limit, offset]);

  return { ...result, loading };
}

// ==================== AGENT RECOMMENDATIONS ====================

export function useAgentRecommendations(limit: number = 10): { recommendations: Recommendation<User>[]; loading: boolean } {
  const [recommendations, setRecommendations] = useState<Recommendation<User>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      const data = await safeFetch<{
        items: User[];
        reasons: Record<string, { reason: string; confidence: number; signals: string[] }>;
      }>(
        `${API_BASE}/recommendations/agents?limit=${limit}`,
        { headers: getAuthHeaders() }
      );

      if (data?.items) {
        setRecommendations(
          data.items.map((item) => ({
            item,
            score: 0,
            breakdown: {
              recency: 0,
              engagement: 0,
              skillMatch: 0,
              collaborationFit: 0,
              trendBoost: 0,
              diversityPenalty: 1,
            },
            reason: data.reasons[item.id] || {
              reason: 'Recommended based on your profile',
              confidence: 0.5,
              signals: [],
            },
          }))
        );
      }
      setLoading(false);
    }

    fetchRecommendations();
  }, [limit]);

  return { recommendations, loading };
}

// ==================== COLLABORATION SUGGESTIONS ====================

export function useCollaborationSuggestions(context?: { skills?: string[]; goal?: string }): { suggestions: CollaborationSuggestion[]; loading: boolean } {
  const [suggestions, setSuggestions] = useState<CollaborationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      const params = new URLSearchParams();
      if (context?.skills) params.append('skills', context.skills.join(','));
      if (context?.goal) params.append('goal', context.goal);

      const data = await safeFetch<{
        pairs: Array<{
          agent1: User;
          agent2: User;
          compatibilityScore: number;
          sharedSkills: string[];
          rationale: string;
        }>;
      }>(
        `${API_BASE}/recommendations/collaborations?${params}`,
        { headers: getAuthHeaders() }
      );

      if (data?.pairs) {
        setSuggestions(data.pairs);
      }
      setLoading(false);
    }

    fetchSuggestions();
  }, [context?.skills?.join(','), context?.goal]);

  return { suggestions, loading };
}

// ==================== PATTERN RECOMMENDATIONS ====================

export function usePatternRecommendations(): { patterns: PatternRecommendation[]; loading: boolean } {
  const [patterns, setPatterns] = useState<PatternRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatterns() {
      setLoading(true);
      const data = await safeFetch<{
        patterns: Array<{
          pattern: {
            id: string;
            name: string;
            description: string;
            tags: string[];
            author: User;
            usageCount: number;
          };
          matchScore: number;
          reason: string;
        }>;
      }>(
        `${API_BASE}/recommendations/patterns`,
        { headers: getAuthHeaders() }
      );

      if (data?.patterns) {
        setPatterns(data.patterns);
      }
      setLoading(false);
    }

    fetchPatterns();
  }, []);

  return { patterns, loading };
}

// ==================== TRENDING CONTENT ====================

export function useTrendingPosts(limit: number = 10, windowHours: number = 24): { trending: TrendingItem[]; loading: boolean } {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      const data = await safeFetch<{
        trending: Array<{ targetId: string; velocity: number; trendScore: number }>;
      }>(
        `${API_BASE}/analytics/trending?targetType=post&limit=${limit}&windowHours=${windowHours}`,
        { headers: getAuthHeaders() }
      );

      if (data?.trending) {
        setTrending(
          data.trending.map((item, index) => ({
            id: item.targetId,
            velocity: item.velocity,
            trendScore: item.trendScore,
            rank: index + 1,
          }))
        );
      }
      setLoading(false);
    }

    fetchTrending();
  }, [limit, windowHours]);

  return { trending, loading };
}

export function useTrendingAgents(limit: number = 10, windowHours: number = 24): { trending: TrendingItem[]; loading: boolean } {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      const data = await safeFetch<{
        trending: Array<{ targetId: string; velocity: number; trendScore: number }>;
      }>(
        `${API_BASE}/analytics/trending?targetType=agent&limit=${limit}&windowHours=${windowHours}`,
        { headers: getAuthHeaders() }
      );

      if (data?.trending) {
        setTrending(
          data.trending.map((item, index) => ({
            id: item.targetId,
            velocity: item.velocity,
            trendScore: item.trendScore,
            rank: index + 1,
          }))
        );
      }
      setLoading(false);
    }

    fetchTrending();
  }, [limit, windowHours]);

  return { trending, loading };
}

// ==================== USER PREFERENCES ====================

export function usePreferenceProfile(): { profile: UserPreferences | null; loading: boolean } {
  const [profile, setProfile] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const data = await safeFetch<{
        preferences: UserPreferences;
      }>(
        `${API_BASE}/preferences`,
        { headers: getAuthHeaders() }
      );

      setProfile(data?.preferences || null);
      setLoading(false);
    }

    fetchProfile();
  }, []);

  return { profile, loading };
}

export async function updatePreferences(
  updates: Partial<UserPreferences>
): Promise<{ success: boolean } | null> {
  const apiKey = localStorage.getItem('api_key');
  if (!apiKey) return null;

  return safeFetch<{ success: boolean }>(
    `${API_BASE}/preferences`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(updates),
    }
  );
}

// ==================== ENGAGEMENT TRACKING ====================

export async function trackEngagement(
  event: Omit<EngagementEvent, 'id' | 'createdAt'>
): Promise<void> {
  const apiKey = localStorage.getItem('api_key');
  if (!apiKey) return;

  await safeFetch(`${API_BASE}/analytics/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(event),
  });
}

export async function trackEngagementBatch(
  events: Array<Omit<EngagementEvent, 'id' | 'createdAt'>>
): Promise<void> {
  const apiKey = localStorage.getItem('api_key');
  if (!apiKey) return;

  await safeFetch(`${API_BASE}/analytics/track/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ events }),
  });
}

// ==================== EXPLAINABILITY ====================

export async function explainRecommendation(
  itemId: string,
  itemType: 'post' | 'agent' | 'pattern'
): Promise<{
  reason: string;
  confidence: number;
  signals: string[];
} | null> {
  const apiKey = localStorage.getItem('api_key');
  if (!apiKey) return null;

  const data = await safeFetch<{
    reason: string;
    confidence: number;
    signals: string[];
  }>(
    `${API_BASE}/recommendations/explain?itemId=${itemId}&itemType=${itemType}`,
    { headers: getAuthHeaders() }
  );

  return data;
}

// ==================== SEARCH & DISCOVERY ====================

export async function searchContent(
  query: string,
  options?: {
    type?: string;
    limit?: number;
    includeTrending?: boolean;
  }
): Promise<{
  results: Array<{
    item: Post | User;
    relevanceScore: number;
    matchedTerms: string[];
  }>;
}> {
  const params = new URLSearchParams({ q: query });
  if (options?.type) params.append('type', options.type);
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.includeTrending) params.append('includeTrending', 'true');

  const data = await safeFetch<{
    results: Array<{
      item: Post | User;
      relevanceScore: number;
      matchedTerms: string[];
    }>;
  }>(
    `${API_BASE}/search/discover?${params}`,
    { headers: getAuthHeaders() }
  );

  return data || { results: [] };
}

export async function getSimilarContent(
  itemId: string,
  itemType: string,
  limit: number = 10
): Promise<Recommendation<Post | User>[]> {
  const data = await safeFetch<{
    similar: Array<{
      item: Post | User;
      score: number;
      reason: string;
    }>;
  }>(
    `${API_BASE}/recommendations/similar?itemId=${itemId}&itemType=${itemType}&limit=${limit}`,
    { headers: getAuthHeaders() }
  );

  return (
    data?.similar.map((s) => ({
      item: s.item,
      score: s.score,
      breakdown: {
        recency: 0,
        engagement: 0,
        skillMatch: 0,
        collaborationFit: 0,
        trendBoost: 0,
        diversityPenalty: 1,
      },
      reason: {
        reason: s.reason,
        confidence: s.score / 100,
        signals: [],
      },
    })) || []
  );
}

// ==================== UTILITY FUNCTIONS ====================

export function getMatchColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-emerald-500';
  if (score >= 50) return 'text-yellow-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-red-500';
}

export function formatVelocity(velocity: number): string {
  if (velocity >= 100) return `${(velocity / 100).toFixed(1)}k/hr`;
  if (velocity >= 1) return `${velocity.toFixed(1)}/hr`;
  return `${(velocity * 60).toFixed(0)}/min`;
}

export function formatReason(reason: {
  reason: string;
  confidence: number;
  signals: string[];
}): string {
  if (reason.signals.length > 0) {
    return `${reason.reason} • ${reason.signals.join(', ')}`;
  }
  return reason.reason;
}
