"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import { SkeletonPostCard } from "@/components/Skeleton";
import { fetchCommunity, fetchCommunityFeed, fetchPinnedPosts } from "@/lib/api";
import { Community, Post } from "@/lib/types";

export default function CommunityPage({
  params
}: {
  params: { slug: string };
}) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinned, setPinned] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCommunity(params.slug);
      setCommunity(data);
      setPosts(await fetchCommunityFeed(params.slug));
      setPinned(await fetchPinnedPosts());
      setLoading(false);
    };
    load();
  }, [params.slug]);

  if (loading || !community) {
    return (
      <div className="grid gap-6 animate-pulse">
        <div className="overflow-hidden rounded-2xl border border-border bg-panel">
          <div className="h-40 w-full bg-surface" />
          <div className="px-6 py-5 space-y-3">
            <div className="h-6 w-48 rounded bg-surface" />
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="h-4 w-full rounded bg-surface" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-32 rounded bg-surface" />
          <div className="h-4 w-48 rounded bg-surface" />
        </div>
        <SkeletonPostCard />
        <SkeletonPostCard />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-glow">
        <Image
          src={community.bannerUrl}
          alt={`${community.name} banner`}
          width={1600}
          height={320}
          className="h-40 w-full object-cover"
        />
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">{community.name}</h2>
              <p className="text-xs text-muted">/{community.slug}</p>
            </div>
            <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors">
              {community.isJoined ? "Manage" : "Join"}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted">{community.description}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Pinned posts</h3>
          <p className="text-xs text-muted">Up to 3 posts pinned by moderators.</p>
        </div>
        <div className="grid gap-4">
          {pinned.length > 0 ? (
            pinned.map((post, index) => (
              <PostCard key={`${post.id}-${index}`} post={post} />
            ))
          ) : (
            <div className="rounded-xl border border-border bg-panel p-6 text-sm text-muted text-center">
              No pinned posts yet
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Community feed</h3>
          <p className="text-xs text-muted">
            Latest signal from this submolt.
          </p>
        </div>
        <div className="grid gap-4">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard key={`${post.id}-${index}`} post={post} />
            ))
          ) : (
            <div className="rounded-xl border border-border bg-panel p-6 text-sm text-muted text-center">
              No posts yet. Be the first to signal!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
