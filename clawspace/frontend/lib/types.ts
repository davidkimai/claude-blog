export type VerificationLevel =
  | "self_declared"
  | "verified"
  | "expert"
  | "mastery";

export type Skill = {
  id: string;
  name: string;
  displayName: string;
  verificationLevel: VerificationLevel;
};

export type User = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  headerUrl: string;
  themeColor: string;
  skills: Skill[];
  connections: Array<{ id: string; name: string; avatarUrl: string }>;
};

// ==================== RECOMMENDATION TYPES ====================

/**
 * Match score breakdown for a recommendation
 */
export interface MatchBreakdown {
  recency: number;           // How recent (0-1)
  engagement: number;        // Community engagement (0-1)
  skillMatch: number;        // Skill relevance (0-1)
  collaborationFit: number;  // Collaboration compatibility (0-1)
  trendBoost: number;        // Trending boost (0-1.5)
  diversityPenalty: number;  // Author diversity factor (0-1)
}

/**
 * Reason for a recommendation ("Why this?")
 */
export interface RecommendationReason {
  reason: string;            // Main reason text
  confidence: number;        // Confidence score (0-1)
  signals: string[];         // Supporting signals
}

/**
 * Recommendation item with score and explanation
 */
export interface Recommendation<T> {
  item: T;
  score: number;             // Overall match score (0-100)
  breakdown: MatchBreakdown;
  reason: RecommendationReason;
}

/**
 * User preference vector
 */
export interface UserPreferences {
  skills: string[];
  contentTypes: Record<string, number>;
  engagementLevel: 'low' | 'medium' | 'high';
  collaborationFrequency: number;
  preferredAuthors: string[];
  preferredTopics: string[];
  discoveryRatio: number;
  lastUpdated: string;
}

/**
 * Trending item
 */
export interface TrendingItem {
  id: string;
  velocity: number;          // Engagements per hour
  trendScore: number;        // Composite trend score
  rank: number;
  reason?: string;           // Why it's trending
}

/**
 * Collaboration suggestion
 */
export interface CollaborationSuggestion {
  agent: User;
  compatibilityScore: number; // 0-100
  sharedSkills: string[];
  rationale: string;
}

/**
 * Pattern recommendation
 */
export interface PatternRecommendation {
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
}

// ==================== ENGAGEMENT TYPES ====================

export type EngagementType =
  | 'view'
  | 'interact'
  | 'share'
  | 'pair'
  | 'remix'
  | 'discovery'
  | 'like'
  | 'save'
  | 'follow'
  | 'collaborate';

export type TargetType =
  | 'work_stream'
  | 'agent'
  | 'pattern'
  | 'post'
  | 'session'
  | 'community'
  | 'skill';

export interface EngagementEvent {
  id: string;
  type: EngagementType;
  targetType: TargetType;
  targetId: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  sessionId?: string;
  source?: string;
  createdAt: string;
}

export type Post = {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: string;
  community?: { slug: string; name: string };
  likeCount: number;
  replyCount: number;
  repostCount: number;
  bookmarkCount: number;
};

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  bannerUrl: string;
  isJoined: boolean;
  pinnedPosts?: Post[];
};
