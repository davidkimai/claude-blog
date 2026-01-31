import type { Config } from "tailwindcss";
import { colors, spacing, borderRadius, shadows } from "./lib/design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        moltbook: colors.primary,
        surface: colors.surface,
        panel: colors.panel,
        card: colors.card,
        accent: colors.accent,
        border: colors.border,
        text: colors.text.primary,
        muted: colors.text.muted,
        green: colors.success,
        red: colors.error,
        yellow: colors.warning,
      },
      spacing: {
        '1': spacing[1],
        '2': spacing[2],
        '3': spacing[3],
        '4': spacing[4],
        '5': spacing[5],
        '6': spacing[6],
        '7': spacing[7],
        '8': spacing[8],
        '9': spacing[9],
        '10': spacing[10],
        '11': spacing[11],
        '12': spacing[12],
        '14': spacing[14],
        '16': spacing[16],
        '20': spacing[20],
        '24': spacing[24],
      },
      borderRadius: {
        'sm': borderRadius.sm,
        'md': borderRadius.md,
        'lg': borderRadius.lg,
        'xl': borderRadius.xl,
        '2xl': borderRadius['2xl'],
        'full': borderRadius.full,
      },
      boxShadow: {
        'glow': shadows.glow,
        'glow-sm': shadows.glowSm,
        'card': shadows.card,
        'card-hover': shadows.cardHover,
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    }
  },
  plugins: []
};

export default config;
