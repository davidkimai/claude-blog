---
name: ouroboros
description: Meta-orchestration layer for Clawdbot. Detects user intent, routes workflows, and orchestrates GSD↔Ralph-TUI integration with decision audit trail.
metadata: {"clawdis":{"emoji":"🐍"}}
---

# Ouroboros: Meta-Orchestration

Self-improving meta-orchestrator for Clawdbot that detects intent, routes workflows, and coordinates GSD↔Ralph-TUI execution.

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

## Architecture (v0.1)

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
Decision Logger (audit trail)
    ↓
Workflow Selection
    ├─ GSD (planning focus)
    ├─ Ralph-TUI (execution focus)
    ├─ GSD→Ralph (full orchestration)
    └─ Quick (simple tasks)
```

## Phase 1 Features (Complete)

### US-001: Intent Detection Engine
- Parse user messages for intent signals
- Classify: planning, execution, research, fix, optimization
- Map to skill combinations
- Confidence scoring (0-100)
- Explainable decisions

### US-008: Decision Audit Trail
- Append-only JSONL logging
- Timestamp, intent, confidence, workflow, reasoning
- Query and explain past decisions

## Phase 2 Features (Complete)

### US-002: Auto-Skill Installation
- Map intent → required skills
- Check installation status
- Query skills.sh for availability
- Cache installation preferences (auto/never/ask)
- Suggest missing skills based on workflow

### US-005: Proactive Workflow Suggestions
- Detect workflow state transitions (idle → planning → executing → testing → etc.)
- Suggest next logical action based on current state
- Learn from accepted/rejected suggestions
- Rate limit: 1 suggestion per 5 minutes
- Adapt suggestions based on feedback

### US-006: Bottleneck Detection
- Monitor time since last progress (30min/2hr/24hr thresholds)
- Detect common patterns: verification wait, unclear requirements, technical blockers
- Suggest specific unblocking actions
- Track bottleneck frequency and patterns

### US-012: Context-Aware Orchestration
- Detect project type (web frontend, fullstack, API, CLI, library)
- Find existing GSD artifacts (specs, architecture, tasks)
- Consider recent conversation context
- Adjust workflow routing based on project state

## Commands

### Phase 1 Commands

#### `/ouroboros:detect [message]`
Analyze intent of a message (uses last user message if not provided).

**Example:**
```
/ouroboros:detect Build me a React auth system with better-auth
```

**Output:**
```json
{
  "intent": "create_project",
  "confidence": 92,
  "entities": {
    "framework": "React",
    "domain": "authentication",
    "library": "better-auth"
  },
  "suggestedWorkflow": "gsd-ralph-full",
  "reasoning": "High complexity project requiring planning + execution"
}
```

#### `/ouroboros:explain [limit]`
Show recent decision audit trail.

**Example:**
```
/ouroboros:explain 5
```

Shows last 5 decisions with timestamps, confidence, and reasoning.

#### `/ouroboros:config [key] [value]`
View or update configuration.

**Examples:**
```
/ouroboros:config                          # Show all config
/ouroboros:config min_confidence 70        # Set minimum confidence threshold
/ouroboros:config auto_execute false       # Disable auto-execution
```

### Phase 2 Commands

#### `/ouroboros:skills [intent]`
Check required skills for an intent and suggest installations.

**Example:**
```
/ouroboros:skills create_project
```

**Output:**
```json
{
  "requiredSkills": ["get-shit-done", "ralph-tui-prd"],
  "missingSkills": ["ralph-tui-prd"],
  "suggestions": [...]
}
```

#### `/ouroboros:suggest`
Generate proactive workflow suggestion based on current state.

**Example:**
```
/ouroboros:suggest
```

**Output:**
```json
{
  "currentState": "executing",
  "suggestion": {
    "action": "run_tests",
    "reason": "Verify implementation with tests"
  },
  "alternatives": [...]
}
```

#### `/ouroboros:bottleneck`
Check for workflow bottlenecks and get unblocking suggestions.

**Example:**
```
/ouroboros:bottleneck
```

**Output:**
```json
{
  "isBottleneck": true,
  "status": "slowing",
  "detectedPatterns": ["waiting_verification"],
  "suggestions": [
    "Run automated tests if available",
    "Create a verification checklist"
  ]
}
```

#### `/ouroboros:context [path]`
Analyze project context and get context-aware routing.

**Example:**
```
/ouroboros:context ./my-project
```

**Output:**
```json
{
  "projectType": {
    "type": "web_fullstack",
    "confidence": 85
  },
  "artifacts": {
    "spec": ["SPEC.md"],
    "tasks": ["TASKS.md"]
  },
  "suggestedSkills": ["get-shit-done", "ralph-tui-prd"]
}
```

## Configuration

Located at `skills/ouroboros/memory/ouroboros-config.json`:

```json
{
  "intent_detection": {
    "min_confidence_threshold": 40,
    "use_llm_fallback": true,
    "llm_fallback_threshold": 40,
    "log_all_detections": true,
    "enable_context_caching": true,
    "cache_ttl_ms": 300000
  },
  "workflow_routing": {
    "auto_execute": false,
    "require_confirmation": true,
    "default_workflow": "clarify"
  },
  "audit": {
    "max_log_entries": 10000,
    "log_path": "memory/ouroboros-decisions.jsonl"
  }
}
```

## Decision Log Format

Each decision logged to `memory/ouroboros-decisions.jsonl`:

```json
{
  "timestamp": "2025-01-26T22:30:00.000Z",
  "message": "Build a React auth system with better-auth",
  "intent": "create_project",
  "confidence": 92,
  "entities": {
    "framework": "React",
    "domain": "authentication"
  },
  "suggestedWorkflow": "gsd-ralph-full",
  "reasoning": "High complexity project requiring planning + execution",
  "matched_patterns": ["build", "system", "framework_mention"],
  "llm_used": false
}
```

## Intent Categories

| Intent | Description | Typical Workflow |
|--------|-------------|------------------|
| `create_project` | Build new system from scratch | GSD → Ralph full |
| `extend_feature` | Add to existing project | GSD planning → Ralph exec |
| `debug_fix` | Fix bugs or errors | Quick fix or Ralph |
| `discuss_decision` | Architectural/design discussion | GSD discussion only |
| `optimize` | Improve performance/code quality | GSD analysis → Ralph |
| `research` | Gather information, no execution | Research skill |
| `clarify` | Need more information | Ask questions |

## Integration with GSD & Ralph-TUI

Ouroboros orchestrates these skills:

**Planning Phase (GSD):**
1. Context engineering
2. Requirement gathering
3. Architecture decisions
4. Spec creation

**Execution Phase (Ralph-TUI):**
1. Convert GSD output to PRD
2. Task orchestration
3. Autonomous execution
4. Quality verification

**Ouroboros' Role:**
- Detect when to use GSD, Ralph, or both
- Pass context between phases
- Monitor progress and quality gates
- Suggest next actions

## Example Workflows

### Full Orchestration
```
User: "Build a real-time chat app with Next.js and Supabase"

Ouroboros:
1. Detects: create_project, high complexity
2. Logs decision (confidence: 95)
3. Suggests: "This looks complex. Run GSD for planning, then Ralph for execution?"
4. On approval: Triggers /gsd:new-project → ralph-tui workflow
```

### Quick Task
```
User: "Fix the TypeScript error in auth.ts"

Ouroboros:
1. Detects: debug_fix, low complexity
2. Logs decision (confidence: 88)
3. Suggests: "Quick fix - shall I handle this directly?"
4. No need for GSD/Ralph overhead
```

## Files

### Phase 1 Files
| File | Purpose |
|------|---------|
| `SKILL.md` | This documentation |
| `scripts/intent-detector.js` | Intent detection logic |
| `scripts/decision-logger.js` | Audit trail management |
| `memory/ouroboros-decisions.jsonl` | Decision log (append-only) |
| `memory/ouroboros-config.json` | Configuration |

### Phase 2 Files
| File | Purpose |
|------|---------|
| `scripts/skill-installer.js` | Auto-skill installation and suggestions |
| `scripts/proactive-engine.js` | Proactive workflow suggestions |
| `scripts/bottleneck-detector.js` | Bottleneck detection and unblocking |
| `scripts/context-aware.js` | Context-aware orchestration |
| `memory/skill-preferences.json` | Skill installation preferences |
| `memory/proactive-suggestions.jsonl` | Suggestion log |
| `memory/suggestion-feedback.jsonl` | Feedback on suggestions |
| `memory/workflow-state.json` | Current workflow state |
| `memory/progress-tracking.jsonl` | Progress events log |
| `memory/bottlenecks.jsonl` | Bottleneck occurrences log |
| `memory/context-cache.json` | Cached project context |

### Phase 3 Files
| File | Purpose |
|------|---------|
| `scripts/safety-controller.js` | Simplified safety with human oversight |
| `scripts/workflow-monitor.js` | Workflow monitoring integration |
| `memory/safety-audit.jsonl` | Safety decision audit trail |
| `memory/workflow-state.json` | Enhanced workflow state tracking |

## Safety & Self-Improvement

**v0.1 Policy (Option A):**
- ✅ Auto-approve: configuration changes, logging updates
- ⚠️ Human approval: code changes to detection logic
- 📝 All changes: logged to audit trail

**Bounds:**
- Max confidence threshold: 0-100
- Auto-execute: disabled by default (safety first)
- Decision log: max 10,000 entries (rotates)

## Phase 3 Features (Current - MVP Polish)

### US-013: LLM Fallback for Intent Detection
- Automatic Claude call when fast detection confidence < 40%
- Improves accuracy by 15-20% for ambiguous messages
- JSON-based classification with reasoning
- Transparent LLM usage tracking

### US-014: Context Caching
- LRU cache for intent detection results
- TTL: 5 minutes (configurable)
- 50-70% faster for repeated patterns
- Automatic cache invalidation

### US-015: Simplified Safety Controller
- Auto-approve: config changes, rule updates
- Human approval: code changes, skill installation
- Basic audit trail (JSONL)
- Iteration bounds checking
- Rollback system deferred to post-MVP

### US-016: Workflow Monitor Integration
- Leverages existing `spawn-monitored.sh`
- Hooks into notification system
- Tracks GSD↔Ralph phase transitions
- Real-time progress updates
- No new monitoring infrastructure

### US-017: Pattern Boosting
- Phrase-specific confidence boosts
- "build a" → +15% for create_project
- "fix the" → +20% for debug_fix
- Improved low-confidence handling

## Future Phases

**Phase 4 (Planned):**
- Self-improvement learning from feedback
- Advanced entity extraction with embeddings
- Multi-agent workflow coordination
- Predictive workflow suggestions

## Development

**Quality Gates:**
- `bun run typecheck` (if TS files added)
- `bun run lint` (if linter configured)
- Manual: Test detection on sample messages

## Links

- Design Doc: `~/clawd/tasks/ouroboros-design-improvements.md`
- GSD Skill: `~/clawd/skills/get-shit-done/`
- Ralph-TUI PRD: `~/clawd/skills/ralph-tui-prd/`

### Phase 3 Commands

#### `/ouroboros:safety [command]`
Manage safety controller.

**Examples:**
```
/ouroboros:safety status          # Show safety status
/ouroboros:safety check code_change  # Check approval requirement
/ouroboros:safety audit 50        # View audit log
```

#### `/ouroboros:monitor [command]`
Manage workflow monitoring.

**Examples:**
```
/ouroboros:monitor state          # Show current workflow state
/ouroboros:monitor check          # Check recent notifications
/ouroboros:monitor transition gsd_planning  # Manual phase transition
```

---

**Status:** Phase 3 (v0.3) - MVP Polish: LLM fallback, context caching, simplified safety, workflow monitoring
**Next:** Phase 4 - Self-improvement learning and advanced orchestration
