---
name: ouroboros
description: Meta-orchestration layer. Detects user intent, routes workflows, and orchestrates GSD↔Ralph-TUI integration with decision audit trail.
---

# Ouroboros: Meta-Orchestration

Self-improving meta-orchestrator that detects intent, routes workflows, and coordinates GSD↔Ralph-TUI execution.

## What This Does

Ouroboros is the intelligence layer that sits above your skills:
- **Intent Detection** - Understands what you want from natural language
- **Workflow Routing** - Automatically selects GSD, Ralph-TUI, or other workflows
- **Decision Auditing** - Logs every decision with confidence scores and reasoning
- **Orchestration** - Coordinates multi-skill workflows seamlessly

## When to Trigger

**Automatically triggers when:**
- User describes complex project requirements
- Messages contain planning + execution signals
- Mentions "build from scratch", "create a system", "implement feature"

**Manual triggers:**
- `/ouroboros:detect` - Analyze intent of last message
- `/ouroboros:explain` - Show decision audit trail
- `/ouroboros:config` - View/update configuration

## Architecture

```
User Message
    ↓
Intent Detector (multi-layer)
    ├─ Fast: keyword/pattern matching
    ├─ Medium: entity extraction
    └─ LLM: complex classification
    ↓
Confidence Scoring (0-100)
    ↓
Workflow Selection
    ├─ GSD (planning focus)
    ├─ Ralph-TUI (execution focus)
    ├─ GSD→Ralph (full orchestration)
    └─ Quick (simple tasks)
```

## Workflows

| Workflow | Use When |
|----------|----------|
| `gsd-ralph-full` | Complex projects (Plan → Execute) |
| `gsd-only` | Planning, architecture decisions |
| `ralph-only` | Quick fixes, simple tasks |
| `quick` | Simple additions (buttons, styles) |
| `research` | Investigation, best practices |
| `clarify` | Ambiguous requests |

## Intent Categories

| Intent | Description |
|--------|-------------|
| `create_project` | Build new system from scratch |
| `extend_feature` | Add to existing project |
| `debug_fix` | Fix bugs or errors |
| `discuss_decision` | Architectural/design discussion |
| `optimize` | Improve performance/code quality |
| `research` | Gather information |
| `clarify` | Need more information |

## Commands

### `/ouroboros:detect [message]`
Analyze intent of a message.

### `/ouroboros:explain [limit]`
Show recent decision audit trail.

### `/ouroboros:config [key] [value]`
View or update configuration.

## Example

```
User: "Build a React auth system with OAuth"

Ouroboros:
1. Detects: create_project, high complexity
2. Suggests: "gsd-ralph-full" (55% confidence)
3. On approval: Triggers GSD → Ralph workflow
```

## Integration

Works with:
- **GSD** (get-shit-done) for planning
- **Ralph-TUI** for execution
- Context7 MCP for framework docs

## Files

- `scripts/intent-detector.js` - Intent detection engine
- `memory/ouroboros-config.json` - Configuration
- `memory/ouroboros-decisions.jsonl` - Audit trail

---

**Version:** 0.3.0 | **Status:** Production-ready
