"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual style of the card
   * @default "default"
   */
  variant?: "default" | "bordered" | "elevated";
  /**
   * Enable hover effects
   */
  hoverable?: boolean;
  /**
   * Card padding size
   * @default "md"
   */
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hoverable = false,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-xl bg-panel/80 backdrop-blur-sm";

    const variants = {
      default: "border border-border/60 shadow-sm",
      bordered: "border border-border bg-panel",
      elevated: "border border-border/40 shadow-lg shadow-primary/5",
    };

    const hoverStyles = hoverable
      ? "transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5"
      : "";

    const paddingStyles = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Align header content
   */
  align?: "left" | "center" | "right";
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, align = "left", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-4",
          {
            "justify-start": align === "left",
            "justify-center": align === "center",
            "justify-end": align === "right",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Title heading level
   */
  as?: "h1" | "h2" | "h3" | "h4";
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Tag = "h3", children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn("text-lg font-semibold text-text", className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted mt-1", className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = "CardDescription";

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-text", className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Align footer content
   */
  align?: "left" | "center" | "right" | "between";
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, align = "left", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 mt-4 pt-4 border-t border-border/60",
          {
            "justify-start": align === "left",
            "justify-center": align === "center",
            "justify-end": align === "right",
            "justify-between": align === "between",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
