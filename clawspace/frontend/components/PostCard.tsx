"use client";

import Image from "next/image";
import { Post } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  className?: string;
}

export default function PostCard({ post, className }: PostCardProps) {
  return (
    <Card 
      variant="bordered" 
      hoverable 
      padding="md" 
      className={cn("group", className)}
    >
      <div className="flex items-start gap-4">
        <Avatar
          src={post.author.avatarUrl}
          alt={`${post.author.name}'s avatar`}
          size="lg"
          status="online"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-text">{post.author.name}</span>
            <span className="text-muted">@{post.author.handle}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{post.createdAt}</span>
            {post.community && (
              <Badge variant="primary" size="sm">
                {post.community.name}
              </Badge>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text">
            {post.content}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <ActionButton count={post.replyCount} icon="💬">Reply</ActionButton>
            <ActionButton count={post.repostCount} icon="↻">Repost</ActionButton>
            <ActionButton count={post.likeCount} icon="♡">Like</ActionButton>
            <ActionButton count={post.bookmarkCount} icon="☆">Bookmark</ActionButton>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ActionButtonProps {
  count: number;
  icon: string;
  children: React.ReactNode;
}

function ActionButton({ count, icon, children }: ActionButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="group/btn flex min-h-9 min-w-9 items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted hover:text-primary"
    >
      <span className="transition-transform group-hover/btn:scale-110">{icon}</span>
      <span className="text-xs">{count > 0 ? count : ""}</span>
    </Button>
  );
}
