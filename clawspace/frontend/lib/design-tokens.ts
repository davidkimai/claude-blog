/**
 * ClawSpace Design Tokens
 * 
 * Centralized design system values for consistent styling across the app.
 * Use these tokens instead of hardcoded values for maintainability.
 */

export const colors = {
  // Primary brand color
  primary: "#1DA1F2",
  primaryHover: "#1a91da",
  primaryLight: "rgba(29, 161, 242, 0.1)",
  primaryMuted: "rgba(29, 161, 242, 0.2)",
  
  // Background layers (dark theme)
  background: "#0b0f14",
  surface: "#15202B",
  panel: "#111827",
  card: "#0f172a",
  
  // Interactive states
  accent: "#1b2536",
  accentHover: "#243042",
  border: "#1f2937",
  borderLight: "rgba(31, 41, 55, 0.5)",
  
  // Text hierarchy
  text: {
    primary: "#e5e7eb",
    secondary: "#94a3b8",
    muted: "#6b7280",
    inverse: "#0b0f14",
  },
  
  // Semantic colors
  success: "#22c55e",
  successLight: "rgba(34, 197, 94, 0.1)",
  warning: "#eab308",
  warningLight: "rgba(234, 179, 8, 0.1)",
  error: "#ef4444",
  errorLight: "rgba(239, 68, 68, 0.1)",
  info: "#3b82f6",
  infoLight: "rgba(59, 130, 246, 0.1)",
  
  // Social indicators
  online: "#22c55e",
  offline: "#6b7280",
  away: "#eab308",
  busy: "#ef4444",
} as const;

export const spacing = {
  // 4px grid system
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const borderRadius = {
  none: "0",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  full: "9999px",
} as const;

export const typography = {
  // Font families
  fontFamily: {
    sans: "var(--font-inter), system-ui, -apple-system, sans-serif",
    mono: "var(--font-jetbrains-mono), monospace",
  },
  
  // Font sizes (rem-based)
  fontSize: {
    xs: ["12px", "16px"],      // 0.75rem / 1rem
    sm: ["14px", "20px"],      // 0.875rem / 1.25rem
    base: ["16px", "24px"],    // 1rem / 1.5rem
    lg: ["18px", "28px"],      // 1.125rem / 1.75rem
    xl: ["20px", "28px"],      // 1.25rem / 1.75rem
    "2xl": ["24px", "32px"],   // 1.5rem / 2rem
    "3xl": ["30px", "36px"],   // 1.875rem / 2.25rem
    "4xl": ["36px", "40px"],   // 2.25rem / 2.5rem
  },
  
  // Font weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  
  // Line heights
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  
  // Custom shadows for ClawSpace
  glow: "0 0 0 1px rgba(29, 161, 242, 0.3), 0 0 20px rgba(29, 161, 242, 0.15)",
  glowSm: "0 0 0 1px rgba(29, 161, 242, 0.2), 0 0 10px rgba(29, 161, 242, 0.1)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  card: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
  cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
} as const;

export const transitions = {
  fast: "150ms ease-in-out",
  normal: "200ms ease-in-out",
  slow: "300ms ease-in-out",
  spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
} as const;

// Helper function for responsive values
export function responsive<T>(values: { base: T; sm?: T; md?: T; lg?: T; xl?: T }): string {
  const { base, sm, md, lg, xl } = values;
  const parts: string[] = [];
  
  if (base !== undefined) parts.push(base as unknown as string);
  if (sm !== undefined) parts.push(`sm:${sm}`);
  if (md !== undefined) parts.push(`md:${md}`);
  if (lg !== undefined) parts.push(`lg:${lg}`);
  if (xl !== undefined) parts.push(`xl:${xl}`);
  
  return parts.join(" ");
}

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  transitions,
  breakpoints,
  zIndex,
};
