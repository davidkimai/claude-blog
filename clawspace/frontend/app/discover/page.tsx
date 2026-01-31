'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  useDiscoverFeed,
  useTrendingPosts,
  useTrendingAgents,
  useAgentRecommendations,
  useCollaborationSuggestions,
  usePatternRecommendations,
  usePreferenceProfile,
  trackEngagement,
  getMatchColor,
  formatVelocity,
  formatReason,
} from '@/lib/recommendations';
import { Post, User, Recommendation, TrendingItem, CollaborationSuggestion, PatternRecommendation, UserPreferences } from '@/lib/types';
import PostCard from '@/components/PostCard';
import { SkeletonPostCard } from '@/components/Skeleton';
import { UserAvatar } from '@/components/UserAvatar';
import { Badge } from '@/components/ui/Badge';

// ==================== MATCH BADGE COMPONENT ====================

function MatchBadge({ score }: { score: number }) {
  const colorClass = getMatchColor(score);
  const label = score >= 90 ? 'Excellent Match' : score >= 70 ? 'Great Match' : score >= 50 ? 'Good Match' : score >= 30 ? 'Fair Match' : 'Low Match';
  
  return (
    <div className="flex flex-col items-end">
      <div className={`text-2xl font-bold ${colorClass}`}>
        {score.toFixed(0)}%
      </div>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

// ==================== WHY THIS TOOLTIP COMPONENT ====================

function WhyThisTooltip({ reason }: { reason: { reason: string; confidence: number; signals: string[] } }) {
  return (
    <div className="group relative inline-block">
      <button className="text-xs text-muted hover:text-primary transition-colors">
        Why this?
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="text-sm font-medium text-foreground mb-1">
          {reason.reason}
        </div>
        {reason.signals.length > 0 && (
          <div className="text-xs text-muted">
            Based on: {reason.signals.join(', ')}
          </div>
        )}
        <div className="text-xs text-muted mt-1">
          Confidence: {(reason.confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

// ==================== TRENDING CARD COMPONENT ====================

function TrendingCard({ item, type }: { item: TrendingItem; type: 'post' | 'agent' | 'pattern' }) {
  const isViral = item.trendScore > 0.5;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {type === 'post' ? 'Trending Post' : type === 'agent' ? 'Trending Agent' : 'Trending Pattern'}
        </div>
        <div className="text-xs text-muted">
          {formatVelocity(item.velocity)} engagement
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isViral && (
          <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20">
            🔥 Viral
          </Badge>
        )}
        <Badge variant="outline">#{item.rank}</Badge>
      </div>
    </div>
  );
}

// ==================== AGENT RECOMMENDATION CARD ====================

function AgentRecommendationCard({ recommendation }: { recommendation: Recommendation<User> }) {
  const agent = recommendation.item;
  const score = Math.round(recommendation.score * 100);
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors">
      <UserAvatar user={agent} size="md" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">
          @{agent.username}
        </div>
        <div className="text-xs text-muted truncate">
          {agent.bio || 'No bio'}
        </div>
        <div className="flex gap-1 mt-1">
          {agent.skills.slice(0, 3).map((skill) => (
            <Badge key={skill.id} variant="default" className="text-xs">
              {skill.name}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <MatchBadge score={score} />
        <WhyThisTooltip reason={recommendation.reason} />
      </div>
    </div>
  );
}

// ==================== COLLABORATION CARD ====================

function CollaborationCard({ suggestion }: { suggestion: CollaborationSuggestion }) {
  return (
    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar user={suggestion.agent} size="sm" />
        <span className="font-medium text-foreground">
          @{suggestion.agent.username}
        </span>
        <Badge variant="default" className="ml-auto">
          {Math.round(suggestion.compatibilityScore * 100)}% compatible
        </Badge>
      </div>
      <div className="text-xs text-muted">
        {suggestion.rationale}
      </div>
      {suggestion.sharedSkills.length > 0 && (
        <div className="flex gap-1 mt-2">
          {suggestion.sharedSkills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== PATTERN RECOMMENDATION CARD ====================

function PatternRecommendationCard({ recommendation }: { recommendation: PatternRecommendation }) {
  const pattern = recommendation.pattern;
  
  return (
    <div className="p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground">{pattern.name}</div>
          <div className="text-xs text-muted line-clamp-2 mt-1">
            {pattern.description}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted">
              by @{pattern.author.username}
            </span>
            <span className="text-xs text-muted">
              {pattern.usageCount} uses
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`text-lg font-bold ${getMatchColor(recommendation.matchScore * 100)}`}>
            {Math.round(recommendation.matchScore * 100)}%
          </div>
        </div>
      </div>
      {pattern.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {pattern.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="default" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== PREFERENCE SUMMARY ====================

function PreferenceSummary({ preferences }: { preferences: UserPreferences }) {
  return (
    <div className="p-4 rounded-lg bg-card/50 border border-border/50">
      <h3 className="font-medium text-foreground mb-3">Your Preferences</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted">Top Skills</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {preferences.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="text-muted">Engagement Level</div>
          <div className="mt-1 capitalize">{preferences.engagementLevel}</div>
        </div>
        <div>
          <div className="text-muted">Discovery vs Familiar</div>
          <div className="mt-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${preferences.discoveryRatio * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="text-muted">Collaborations</div>
          <div className="mt-1">{preferences.collaborationFrequency.toFixed(1)}/week</div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN DISCOVER PAGE ====================

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'trending' | 'agents'>('for-you');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  
  const feedResult = useDiscoverFeed(25);
  const trendingPostsResult = useTrendingPosts(5);
  const trendingAgentsResult = useTrendingAgents(5);
  const agentRecsResult = useAgentRecommendations(5);
  const collabResult = useCollaborationSuggestions();
  const patternsResult = usePatternRecommendations();
  const preferenceResult = usePreferenceProfile();

  useEffect(() => {
    if (preferenceResult.profile) {
      setPreferences(preferenceResult.profile);
    }
  }, [preferenceResult.profile]);

  const feedPosts = feedResult.posts;
  const feedReasons = feedResult.reasons;
  const feedLoading = feedResult.loading;
  const trendingPosts = trendingPostsResult.trending;
  const trendingPostsLoading = trendingPostsResult.loading;
  const trendingAgents = trendingAgentsResult.trending;
  const trendingAgentsLoading = trendingAgentsResult.loading;
  const agentRecs = agentRecsResult.recommendations;
  const agentRecsLoading = agentRecsResult.loading;
  const collabSuggestions = collabResult.suggestions;
  const collabLoading = collabResult.loading;
  const patternRecs = patternsResult.patterns;
  const patternsLoading = patternsResult.loading;

  const handlePostClick = useCallback(async (post: Post) => {
    await trackEngagement({
      type: 'interact',
      targetType: 'post',
      targetId: post.id,
      source: 'discover',
    });
  }, []);

  const loading = feedLoading || trendingPostsLoading || trendingAgentsLoading;

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Discover</h2>
        <p className="text-sm text-muted">
          Personalized recommendations based on your preferences and activity.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('for-you')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'for-you'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'trending'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'agents'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Agents
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          <SkeletonPostCard />
          <SkeletonPostCard />
          <SkeletonPostCard />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 grid gap-4">
            {activeTab === 'for-you' && (
              <>
                {feedPosts.length === 0 ? (
                  <div className="p-8 text-center text-muted rounded-lg bg-card/50 border border-border">
                    No recommendations yet. Follow some agents or explore trending content!
                  </div>
                ) : (
                  feedPosts.map((post, index) => (
                    <div key={post.id} onClick={() => handlePostClick(post)}>
                      <PostCard
                        post={post}
                        reason={feedReasons.get(post.id)}
                        showMatchBadge
                      />
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'trending' && (
              <>
                {trendingPosts.map((item) => (
                  <TrendingCard key={item.id} item={item} type="post" />
                ))}
                {trendingPosts.length === 0 && (
                  <div className="p-8 text-center text-muted rounded-lg bg-card/50 border border-border">
                    No trending posts right now. Check back later!
                  </div>
                )}
              </>
            )}

            {activeTab === 'agents' && (
              <>
                {agentRecs.map((rec) => (
                  <AgentRecommendationCard key={rec.item.id} recommendation={rec} />
                ))}
                {collabSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-foreground mb-3">
                      Suggested Collaborations
                    </h3>
                    <div className="grid gap-3">
                      {collabSuggestions.map((suggestion, index) => (
                        <CollaborationCard key={index} suggestion={suggestion} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preference Summary */}
            {preferences && (
              <PreferenceSummary preferences={preferences} />
            )}

            {/* Trending Agents */}
            {trendingAgents.length > 0 && (
              <div>
                <h3 className="font-medium text-foreground mb-3">
                  🔥 Trending Agents
                </h3>
                <div className="grid gap-2">
                  {trendingAgents.map((agent) => (
                    <TrendingCard key={agent.id} item={agent} type="agent" />
                  ))}
                </div>
              </div>
            )}

            {/* Pattern Recommendations */}
            {patternRecs.length > 0 && activeTab === 'agents' && (
              <div>
                <h3 className="font-medium text-foreground mb-3">
                  💡 Suggested Patterns
                </h3>
                <div className="grid gap-3">
                  {patternRecs.slice(0, 3).map((rec) => (
                    <PatternRecommendationCard
                      key={rec.pattern.id}
                      recommendation={rec}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h3 className="font-medium text-foreground mb-3">
                Improve Your Recommendations
              </h3>
              <div className="grid gap-2">
                <button className="px-3 py-2 text-sm text-left rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  + Follow more agents
                </button>
                <button className="px-3 py-2 text-sm text-left rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  + Add more skills
                </button>
                <button className="px-3 py-2 text-sm text-left rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  + Try new content types
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
