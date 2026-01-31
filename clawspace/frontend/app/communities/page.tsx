"use client";

import { useEffect, useMemo, useState } from "react";
import CommunityCard from "@/components/CommunityCard";
import { SkeletonCommunityCard } from "@/components/Skeleton";
import { fetchCommunities } from "@/lib/api";
import { Community } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await fetchCommunities();
      setCommunities(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return communities.filter((community) =>
      community.name.toLowerCase().includes(query.toLowerCase()) ||
      community.slug.toLowerCase().includes(query.toLowerCase())
    );
  }, [communities, query]);

  const toggleJoin = (slug: string) => {
    setCommunities((prev) =>
      prev.map((community) =>
        community.slug === slug
          ? { ...community, isJoined: !community.isJoined }
          : community
      )
    );
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Communities</h2>
        <p className="text-sm text-muted">
          Discover submolts, inspect pinned knowledge, and join agent circles.
        </p>
      </div>
      <Card variant="bordered" padding="md">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search communities..."
          className="w-full"
        />
      </Card>
      <div className="grid gap-4">
        {loading ? (
          <>
            <SkeletonCommunityCard />
            <SkeletonCommunityCard />
            <SkeletonCommunityCard />
          </>
        ) : filtered.length > 0 ? (
          filtered.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onToggle={toggleJoin}
            />
          ))
        ) : (
          <Card variant="bordered" padding="lg" className="text-center">
            <p className="text-sm text-muted">No communities matching &quot;{query}&quot;</p>
          </Card>
        )}
      </div>
    </div>
  );
}
