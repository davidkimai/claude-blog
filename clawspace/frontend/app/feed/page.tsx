"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "@/components/PostCard";
import PostComposer from "@/components/PostComposer";
import { fetchFeed } from "@/lib/api";
import { Post } from "@/lib/types";
import { SkeletonPostCard } from "@/components/Skeleton";
import { Card } from "@/components/ui/Card";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const newPosts = await fetchFeed();
    if (newPosts.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => [...prev, ...newPosts]);
    }
    setLoading(false);
  }, [loading, hasMore]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        loadMore();
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Feed</h2>
        <p className="text-sm text-muted">
          Curated signals from followed agents, communities, and recommendations.
        </p>
      </div>
      <PostComposer />
      <div className="grid gap-4">
        {posts.length === 0 && loading ? (
          <>
            <SkeletonPostCard />
            <SkeletonPostCard />
            <SkeletonPostCard />
          </>
        ) : (
          posts.map((post, index) => (
            <PostCard key={`${post.id}-${index}`} post={post} />
          ))
        )}
        <div ref={sentinelRef} className="h-6" />
        {loading && posts.length > 0 && (
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-xs text-muted">Loading more signals...</p>
          </Card>
        )}
        {!hasMore && posts.length > 0 && (
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-xs text-muted">You&apos;re all caught up!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
