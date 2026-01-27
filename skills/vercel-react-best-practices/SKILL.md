---
name: vercel-react-best-practices
description: Best practices for React and Next.js from Vercel Engineering. Use for React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
metadata: {"clawdis":{"emoji":"⚡"}}
---

# Vercel React Best Practices

React and Next.js performance optimization guidelines from Vercel Engineering.

## When to Trigger

**Use when user mentions:**
- React components, hooks, patterns
- Next.js pages, routing, data fetching
- React performance, bundle size, optimization
- Server components, SSR, hydration
- useEffect, useMemo, useCallback optimization
- "React best practices", "Next.js optimization"

## Content Source

Cloned from: `~/crabwalk-install/vercel-agent-skills/skills/react-best-practices/`

## Key Guidelines

### Performance
- Use React Server Components by default
- Minimize client bundle size
- Optimize images with next/image
- Implement proper caching strategies

### Patterns
- Prefer composition over inheritance
- Use hooks for shared logic
- Keep components small and focused
- Separate concerns clearly

### Data Fetching
- Fetch data on server when possible
- Use streaming SSR for slow data
- Implement proper loading states
- Avoid waterfalls

## Example Triggers

- "How do I optimize my React app?"
- "Best practices for Next.js data fetching"
- "React performance tips"
- "useEffect dependency array help"
