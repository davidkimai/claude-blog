import { clsx, type ClassValue } from "clsx";

/**
 * Utility function for combining CSS classes.
 * Handles conditional classes and array of classes.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Get color value from design tokens
 */
export function getColorToken(color: string): string {
  const colorMap: Record<string, string> = {
    primary: "var(--color-primary)",
    surface: "var(--color-surface)",
    panel: "var(--color-panel)",
    card: "var(--color-card)",
    accent: "var(--color-accent)",
    border: "var(--color-border)",
    text: "var(--color-text)",
    muted: "var(--color-text-muted)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
  };
  return colorMap[color] || color;
}

/**
 * Generate accessible focus ring styles
 */
export function focusRing(
  color: string = "primary",
  inset: boolean = false
): string {
  const ringColor = `var(--color-${color}, var(--color-primary))`;
  const insetStyle = inset ? "inset" : "";
  
  return `${insetStyle} outline: none;
    --tw-ring-offset-width: 2px;
    --tw-ring-offset-color: var(--color-background);
    --tw-ring-color: ${ringColor};
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) ${ringColor};
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);`;
}

/**
 * Generate skeleton loading animation styles
 */
export function skeleton(): string {
  return "animate-pulse bg-surface/50";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(maxLength: number): string {
  return `max-w-[${maxLength}ch] overflow-hidden text-ellipsis whitespace-nowrap`;
}

/**
 * Hide scrollbar but keep functionality
 */
export function hideScrollbar(): string {
  return "scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
}

/**
 * Safe area insets for notched devices
 */
export const safeArea = {
  top: "safe-area-inset-top",
  bottom: "safe-area-inset-bottom",
  left: "safe-area-inset-left",
  right: "safe-area-inset-right",
};

export default {
  cn,
  getColorToken,
  focusRing,
  skeleton,
  truncate,
  hideScrollbar,
  safeArea,
};
