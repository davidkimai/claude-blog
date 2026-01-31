"use client";

import Image from "next/image";
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Image source URL
   */
  src?: string | null;
  /**
   * Alt text for the image
   */
  alt?: string;
  /**
   * Name for fallback initials
   */
  name?: string;
  /**
   * Size of the avatar
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Online status indicator
   */
  status?: "online" | "offline" | "away" | "busy";
  /**
   * Status indicator size
   * @default "sm"
   */
  statusSize?: "sm" | "md" | "lg";
  /**
   * Shape of the avatar
   * @default "circle"
   */
  shape?: "circle" | "square";
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const statusSizeMap = {
  sm: "h-2.5 w-2.5",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const statusColors = {
  online: "bg-green",
  offline: "bg-muted",
  away: "bg-yellow",
  busy: "bg-red",
};

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = "Avatar",
      name,
      size = "md",
      status,
      statusSize = "sm",
      shape = "circle",
      ...props
    },
    ref
  ) => {
    const dimension = sizeMap[size];
    const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg";
    const statusPosition =
      size === "xs" || size === "sm" ? "-bottom-0.5 -right-0.5" : "-bottom-0.5 -right-0.5";

    const statusColor = status ? statusColors[status] : "";
    const statusSizeClass = statusSizeMap[statusSize];

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex shrink-0", className)}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={dimension}
            height={dimension}
            className={cn(
              "object-cover border border-border",
              shapeClass,
              "transition-transform hover:scale-105"
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center bg-accent text-text font-medium border border-border",
              shapeClass
            )}
            style={{ width: dimension, height: dimension }}
            aria-label={alt}
          >
            <span
              className={cn(
                "leading-none",
                size === "xs" && "text-xs",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                size === "lg" && "text-base",
                size === "xl" && "text-lg"
              )}
            >
              {getInitials(name || "")}
            </span>
          </div>
        )}
        {status && (
          <span
            className={cn(
              "absolute border-2 border-panel rounded-full",
              statusColor,
              statusSizeClass,
              statusPosition
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to show
   */
  max?: number;
  /**
   * Size of each avatar
   * @default "sm"
   */
  size?: "xs" | "sm" | "md" | "lg";
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 5, size = "sm", children, ...props }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children];
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn("flex -space-x-2", className)}
        {...props}
      >
        {visibleChildren}
        {remainingCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-accent text-xs font-medium text-muted border-2 border-panel",
              size === "xs" && "h-6 w-6 text-[10px]",
              size === "sm" && "h-8 w-8 text-xs",
              size === "md" && "h-10 w-10 text-sm",
              size === "lg" && "h-12 w-12 text-base"
            )}
            aria-label={`${remainingCount} more`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
