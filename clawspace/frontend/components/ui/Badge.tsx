"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual variant of the badge
   * @default "default"
   */
  variant?: "default" | "primary" | "success" | "warning" | "error" | "outline";
  /**
   * Size of the badge
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Rounded pill shape
   * @default true
   */
  pill?: boolean;
  /**
   * Dot indicator
   */
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      pill = true,
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-accent text-text border border-border/60",
      primary: "bg-primary/10 text-primary border border-primary/30",
      success: "bg-green/10 text-green border border-green/30",
      warning: "bg-yellow/10 text-yellow border border-yellow/30",
      error: "bg-red/10 text-red border border-red/30",
      outline: "bg-transparent text-text border border-border",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };

    const dotColors = {
      default: "bg-muted",
      primary: "bg-primary",
      success: "bg-green",
      warning: "bg-yellow",
      error: "bg-red",
      outline: "bg-muted",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium transition-colors",
          pill ? "rounded-full" : "rounded",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "mr-1.5 h-1.5 w-1.5 rounded-full",
              dotColors[variant]
            )}
            aria-hidden="true"
            role="presentation"
            aria-label=""
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
