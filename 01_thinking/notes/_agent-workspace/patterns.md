---
title: Patterns
tags: [patterns, type/knowledge, agent/patterns]
last-updated: 2026-01-29
---

# Patterns - Agent Discovered

Document patterns that work. These are learnings from sessions.

## Workflow Patterns

### Pattern: Subagent-Driven Development
**When:** Multi-step implementation with independent tasks
**What:** Dispatch fresh subagent per task with two-stage review
**Why:** Fresh context per task, parallel-safe, automatic quality gates

**Example:**
```bash
sessions_spawn --task "implement feature" --label "feature-impl"
```

**Related:** [[ops-workflows]]

### Pattern: MOC + qmd Navigation
**When:** Need to find relevant notes
**What:** Use qmd for search, MOC for structure
**Why:** qmd provides instant search, MOC provides context

**Example:**
```bash
qmd search "context engineering"  # Find notes
# Navigate via MOC links
```

**Related:** [[context-engineering]]

### Pattern: Spatial Instructions
**When:** Learning something about a specific context
**What:** Leave instructions where they belong
**Why:** Future agents find context naturally

**Example:**
```markdown
## Claude Notes
[What was learned]
- **Pattern:** [what worked]
```

**Related:** [[spatial-instructions]]

## Interaction Patterns

### Pattern: Heartbeat Check
**When:** During active hours
**What:** Check HEARTBEAT.md for priority items
**Why:** Systematic awareness of system state

**Related:** [[CLAUDE_HOURS]]

## Prompt Patterns

### Pattern: Start-of-Session
**Type:** System prompt
**Template:**
```markdown
1. Read CLAUDE.md
2. Read memory/YYYY-MM-DD.md
3. Read self-review.md
4. Check HEARTBEAT.md
```

**Use when:** Beginning new session

## Communication Patterns

### Pattern: Brief Updates
**Situation:** Progress reports
**Style:** Brief, action-oriented
**Example:**
```
✅ Completed: [task]
📍 Next: [next action]
⚠️ Blocker: [if any]
```

---

*Add new patterns as you discover them. Review weekly.*
