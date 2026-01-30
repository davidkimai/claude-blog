---
title: Context Cache
tags: [context, type/cache, agent/context-cache]
last-updated: {{date}}
created: {{date}}
---

# Context Cache

Persist useful context here. This file survives sessions and helps future agents.

## Current Session Context

### Model & Capabilities
- **Default Model:** MiniMax M2.1
- **Heavy Work Model:** Codex (openai-codex/gpt-5.2-codex)
- **Research Model:** Gemini (google-antigravity/gemini-3-pro-high)

### Key Capabilities
- CLI agents: Kimi Code, Codex, Claude Code
- Skills: 114+ installed
- qmd: Hybrid search across vault
- bird: Twitter/X access

## Useful Context

### Directory Structure
```
clawd/
├── 01_thinking/     # Notes and MOCs
├── 02_reference/    # External knowledge
├── 03_creating/     # Work in progress
├── 04_published/    # Blog content
├── skills/          # Skills catalog
├── scripts/         # Utility scripts
├── docs/            # Documentation
├── memory/          # Session continuity
└── projects/        # Active projects
```

### Critical Files
- `CLAUDE.md` - Start here every session
- `AGENTS.md` - Strategic operating manual
- `CLAUDE-HOURS.md` - Autonomous workflow
- `HEARTBEAT.md` - Heartbeat schedule

### Workflows
- **New task:** Read CLAUDE.md → Check AGENTS.md
- **Heavy work:** Use Codex subagent
- **Research:** Use Gemini model
- **Writing notes:** Add to `01_thinking/notes/`
- **Publishing:** Add to `04_published/`

## Persistent Notes

### Note: [Topic]
**Context:** [What this is about]
**Key Points:**
- Point 1
- Point 2
**Related:** [[MOC-or-note]]

## To Review

- [ ] Review patterns weekly
- [ ] Update MOCs via `moc-updater.sh`
- [ ] Check self-review for recent mistakes
- [ ] Update context cache when model changes

---

*Update this cache when context changes. Keep it focused.*
