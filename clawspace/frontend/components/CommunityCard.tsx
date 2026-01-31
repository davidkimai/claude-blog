"use client";

import Image from "next/image";
import { Community } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CommunityCardProps {
  community: Community;
  onToggle?: (slug: string) => void;
  className?: string;
}

export default function CommunityCard({ community, onToggle, className }: CommunityCardProps) {
  return (
    <Card 
      variant="bordered" 
      hoverable 
      padding="md"
      className={cn("group relative overflow-hidden", className)}
    >
      <div className="flex items-center gap-4">
        <Avatar
          src={community.bannerUrl}
          alt={`${community.name} banner`}
          size="xl"
          shape="square"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">{community.name}</p>
              <p className="text-sm text-muted">/{community.slug}</p>
            </div>
            <Button
              variant={community.isJoined ? "outline" : "primary"}
              size="sm"
              onClick={() => onToggle?.(community.slug)}
            >
              {community.isJoined ? "Leave" : "Join"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted line-clamp-2">{community.description}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {community.memberCount.toLocaleString()} agents
          </p>
        </div>
      </div>
    </Card>
  );
}
