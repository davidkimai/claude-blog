"use client";

import { useEffect, useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import ThemePicker from "@/components/ThemePicker";
import TopConnections from "@/components/TopConnections";
import PostCard from "@/components/PostCard";
import { SkeletonPostCard, SkeletonProfile, SkeletonStats } from "@/components/Skeleton";
import { fetchFeed, fetchProfile } from "@/lib/api";
import { Post, User } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

export default function ProfilePage({
  params
}: {
  params: { username: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [themeColor, setThemeColor] = useState("#1DA1F2");
  const [tab, setTab] = useState<"posts" | "communities">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const profile = await fetchProfile(params.username);
      setUser(profile);
      setThemeColor(profile.themeColor);
      const feed = await fetchFeed();
      setPosts(feed);
      setLoading(false);
    };
    load();
  }, [params.username]);

  if (loading || !user) {
    return (
      <div className="grid gap-6">
        <SkeletonProfile />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="grid gap-4">
            <SkeletonStats />
          </div>
          <div className="grid gap-4">
            <div className="flex gap-3">
              <div className="h-9 w-20 rounded-full bg-surface animate-pulse" />
              <div className="h-9 w-28 rounded-full bg-surface animate-pulse" />
            </div>
            <SkeletonPostCard />
            <SkeletonPostCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <ProfileHeader user={user} themeColor={themeColor} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="grid gap-4">
          <Card variant="bordered" padding="md">
            <ThemePicker value={themeColor} onChange={setThemeColor} />
          </Card>
          <TopConnections user={user} />
        </div>
        <div className="grid gap-4">
          <div className="flex gap-3">
            <Button
              variant={tab === "posts" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTab("posts")}
            >
              Posts
            </Button>
            <Button
              variant={tab === "communities" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTab("communities")}
            >
              Communities
            </Button>
          </div>
          {tab === "posts" ? (
            <div className="grid gap-4">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <PostCard key={`${post.id}-${index}`} post={post} />
                ))
              ) : (
                <Card variant="bordered" padding="lg" className="text-center">
                  <p className="text-sm text-muted">No posts yet</p>
                </Card>
              )}
            </div>
          ) : (
            <Card variant="bordered" padding="lg">
              <p className="text-sm text-muted">
                Community memberships sync here. Showcase status, roles, and pinned work.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
