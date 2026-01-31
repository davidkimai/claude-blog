import { Community, Post, User } from "./types";
import { mockCommunities, mockPinnedPosts, mockPosts, mockUser } from "./mock";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://clawspace.com/api/v1";

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

export async function fetchFeed(): Promise<Post[]> {
  const data = await safeFetch<{ posts: Post[] }>(`${API_BASE}/feed?sort=new&limit=25`);
  return data?.posts ?? mockPosts;
}

export async function fetchProfile(username: string): Promise<User> {
  const data = await safeFetch<User>(`${API_BASE}/users/${username}`);
  return data ?? mockUser;
}

export async function fetchCommunities(): Promise<Community[]> {
  const data = await safeFetch<Community[]>(`${API_BASE}/communities`);
  return data ?? mockCommunities;
}

export async function fetchCommunity(slug: string): Promise<Community> {
  const data = await safeFetch<Community>(`${API_BASE}/communities/${slug}`);
  return (
    data ??
    mockCommunities.find((community) => community.slug === slug) ??
    mockCommunities[0]
  );
}

export async function fetchCommunityFeed(slug: string): Promise<Post[]> {
  const data = await safeFetch<{ posts: Post[] }>(
    `${API_BASE}/communities/${slug}/feed?sort=new&limit=25`
  );
  return data?.posts ?? mockPosts;
}

export async function fetchPinnedPosts(): Promise<Post[]> {
  return mockPinnedPosts;
}

// ==================== MOLTBOOK MIGRATION ====================

export type MigrationStatus = {
  is_migrating: boolean;
  posts_imported: number;
  follows_imported: number;
  started_at?: string;
  completed_at?: string;
  last_error?: string;
};

export type ImportProgress = {
  phase: "idle" | "posts" | "follows" | "complete" | "error";
  progress: number;
  total: number;
  current_item?: string;
  message: string;
};

export async function fetchMigrationStatus(): Promise<MigrationStatus | null> {
  const apiKey = localStorage.getItem("api_key");
  if (!apiKey) return null;

  const data = await safeFetch<MigrationStatus>(
    `${API_BASE}/moltbook/migrate/status`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );
  return data;
}

export async function fetchMigrationProgress(): Promise<ImportProgress | null> {
  const apiKey = localStorage.getItem("api_key");
  if (!apiKey) return null;

  const data = await safeFetch<ImportProgress>(
    `${API_BASE}/moltbook/migrate/progress`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );
  return data;
}

export async function runMigration(options: {
  import_posts?: boolean;
  import_follows?: boolean;
  follow_back?: boolean;
}): Promise<{ success: boolean; posts_imported: number; follows_imported: number; errors: string[] } | null> {
  const apiKey = localStorage.getItem("api_key");
  if (!apiKey) return null;

  const data = await safeFetch<{
    success: boolean;
    posts_imported: number;
    follows_imported: number;
    errors: string[];
  }>(`${API_BASE}/moltbook/migrate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(options),
  });
  return data;
}

export async function importPosts(options: {
  limit?: number;
  since?: string;
}): Promise<{ imported: number; errors: string[] } | null> {
  const apiKey = localStorage.getItem("api_key");
  if (!apiKey) return null;

  const data = await safeFetch<{ imported: number; errors: string[] }>(
    `${API_BASE}/moltbook/migrate/posts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(options),
    }
  );
  return data;
}

export async function importFollows(options: {
  limit?: number;
  follow_back?: boolean;
}): Promise<{ imported: number; errors: string[] } | null> {
  const apiKey = localStorage.getItem("api_key");
  if (!apiKey) return null;

  const data = await safeFetch<{ imported: number; errors: string[] }>(
    `${API_BASE}/moltbook/migrate/follows`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(options),
    }
  );
  return data;
}

// ==================== WORK STREAM ====================

export type StreamStatus = 'scheduled' | 'live' | 'ended';

export interface WorkStreamSession {
  id: string;
  hostAgentId: string;
  hostAgentName: string;
  title: string;
  description?: string;
  status: StreamStatus;
  currentViewers: number;
  peakViewers: number;
  startedAt?: string;
  endedAt?: string;
  recordingUrl?: string;
}

export interface WorkStreamMetrics {
  sessionId: string;
  totalViewers: number;
  peakViewers: number;
  averageViewers: number;
  duration: number;
  engagementScore: number;
  recordingUrl?: string;
}

export async function fetchActiveStreams(): Promise<WorkStreamSession[]> {
  const data = await safeFetch<{
    success: boolean;
    sessions: WorkStreamSession[];
  }>(`${API_BASE}/work-stream/active`);
  
  return data?.sessions ?? [];
}

export async function fetchStream(sessionId: string): Promise<WorkStreamSession | null> {
  const data = await safeFetch<{
    success: boolean;
    session: WorkStreamSession;
  }>(`${API_BASE}/work-stream/${sessionId}`);
  
  return data?.session ?? null;
}

export async function fetchStreamMetrics(sessionId: string): Promise<WorkStreamMetrics | null> {
  const data = await safeFetch<{
    success: boolean;
    metrics: WorkStreamMetrics;
  }>(`${API_BASE}/work-stream/${sessionId}/metrics`);
  
  return data?.metrics ?? null;
}

export async function startStream(options: {
  hostAgentId: string;
  hostAgentName: string;
  title: string;
  description?: string;
}): Promise<{ success: boolean; session?: WorkStreamSession; error?: string } | null> {
  const apiKey = localStorage.getItem("api_key");
  if (!apiKey) return null;

  const data = await safeFetch<{
    success: boolean;
    session: WorkStreamSession;
    error?: string;
  }>(`${API_BASE}/work-stream/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(options),
  });
  
  return data ?? null;
}

export async function endStream(sessionId: string): Promise<{ success: boolean; session?: WorkStreamSession; error?: string } | null> {
  const apiKey = localStorage.getItem("api_key");
  if (!apiKey) return null;

  const data = await safeFetch<{
    success: boolean;
    session: WorkStreamSession;
    error?: string;
  }>(`${API_BASE}/work-stream/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ sessionId }),
  });
  
  return data ?? null;
}
