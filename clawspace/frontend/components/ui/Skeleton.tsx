"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant
   * @default "text"
   */
  variant?: "text" | "circular" | "rectangular" | "rounded";
  /**
   * Width of the skeleton
   */
  width?: string | number;
  /**
   * Height of the skeleton
   */
  height?: string | number;
  /**
   * Animation speed
   * @default "normal"
   */
  speed?: "slow" | "normal" | "fast";
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "text",
      width,
      height,
      speed = "normal",
      ...props
    },
    ref
  ) => {
    const variants = {
      text: "rounded",
      circular: "rounded-full",
      rectangular: "rounded-none",
      rounded: "rounded-lg",
    };

    const speeds = {
      slow: "animate-pulse [animation-duration:2s]",
      normal: "animate-pulse [animation-duration:1.5s]",
      fast: "animate-pulse [animation-duration:0.8s]",
    };

    const style: React.CSSProperties = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface/50",
          variants[variant],
          speeds[speed],
          className
        )}
        style={style}
        aria-hidden="true"
        role="presentation"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Pre-built skeleton components for common use cases

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && lines > 1 ? "60%" : "100%"}
          height="1em"
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: 32, md: 40, lg: 48 };
  return (
    <Skeleton
      variant="circular"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  );
}

export function SkeletonButton({
  width = 100,
  className,
}: {
  width?: number | string;
  className?: string;
}) {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={40}
      className={className}
    />
  );
}

export function SkeletonCard({
  showHeader = true,
  showImage = true,
  showContent = true,
  showFooter = false,
  className,
}: {
  showHeader?: boolean;
  showImage?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-panel p-5 space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" height="1em" />
            <Skeleton variant="text" width="30%" height="0.875em" />
          </div>
        </div>
      )}
      {showImage && <Skeleton variant="rounded" width="100%" height={160} />}
      {showContent && (
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height="1em" />
          <Skeleton variant="text" width="75%" height="1em" />
          <Skeleton variant="text" width="50%" height="1em" />
        </div>
      )}
      {showFooter && (
        <div className="flex gap-2 pt-2">
          <SkeletonButton width={80} />
          <SkeletonButton width={80} />
        </div>
      )}
    </div>
  );
}

export { Skeleton };
