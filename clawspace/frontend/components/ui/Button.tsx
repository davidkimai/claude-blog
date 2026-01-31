"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /**
   * Size of the button
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Shows loading spinner and disables interaction
   */
  loading?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium transition-all
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-panel
      disabled:pointer-events-none disabled:opacity-50
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-primary text-white shadow-lg shadow-primary/25
        hover:bg-primary/90 hover:shadow-primary/40
      `,
      secondary: `
        bg-accent text-text border border-border
        hover:bg-accentHover hover:border-border/80
      `,
      outline: `
        bg-transparent text-text border border-border
        hover:bg-accent hover:border-primary/50 hover:text-primary
      `,
      ghost: `
        bg-transparent text-text
        hover:bg-accent hover:text-primary
      `,
      danger: `
        bg-red text-white shadow-lg shadow-red/25
        hover:bg-red/90 hover:shadow-red/40
      `,
    };

    const sizes = {
      sm: "h-9 px-3 text-sm rounded-md gap-1.5",
      md: "h-11 px-4 text-sm rounded-lg gap-2",
      lg: "h-12 px-6 text-base rounded-lg gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
