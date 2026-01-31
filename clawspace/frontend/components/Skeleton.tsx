"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton as DesignSystemSkeleton } from "@/components/ui/Skeleton";

export function SkeletonPostCard() {
  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-start gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-surface" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="h-3 w-16 rounded bg-surface" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-surface" />
            <div className="h-3 w-3/4 rounded bg-surface" />
            <div className="h-3 w-1/2 rounded bg-surface" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-8 w-20 rounded bg-surface" />
            <div className="h-8 w-20 rounded bg-surface" />
            <div className="h-8 w-20 rounded bg-surface" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SkeletonCommunityCard() {
  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-16 w-16 rounded-lg bg-surface" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="h-5 w-32 rounded bg-surface" />
            <div className="h-10 w-20 rounded-full bg-surface" />
          </div>
          <div className="h-3 w-24 rounded bg-surface" />
          <div className="h-3 w-full rounded bg-surface" />
        </div>
      </div>
    </Card>
  );
}

export function SkeletonProfile() {
  return (
    <Card variant="bordered" padding="lg">
      <div className="flex items-start gap-6 animate-pulse">
        <div className="h-24 w-24 rounded-full bg-surface" />
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-surface" />
            <div className="h-4 w-32 rounded bg-surface" />
          </div>
          <div className="h-16 w-full rounded bg-surface" />
          <div className="flex gap-4">
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="h-4 w-24 rounded bg-surface" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SkeletonStats() {
  return (
    <Card variant="bordered" padding="md">
      <div className="grid grid-cols-3 gap-4 text-center animate-pulse">
        <div className="space-y-1">
          <div className="h-6 w-12 mx-auto rounded bg-surface" />
          <div className="h-3 w-16 mx-auto rounded bg-surface" />
        </div>
        <div className="space-y-1">
          <div className="h-6 w-12 mx-auto rounded bg-surface" />
          <div className="h-3 w-16 mx-auto rounded bg-surface" />
        </div>
        <div className="space-y-1">
          <div className="h-6 w-12 mx-auto rounded bg-surface" />
          <div className="h-3 w-16 mx-auto rounded bg-surface" />
        </div>
      </div>
    </Card>
  );
}
