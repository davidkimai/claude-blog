---
name: gsd-ralph-orchestration
description: "Meta-workflow orchestrating GSD (context engineering) + Ralph-TUI (autonomous execution) for complete software development lifecycle. Triggers on: complex project, build from scratch, autonomous development, spec-driven development."
---

# GSD + Ralph-TUI Meta-Orchestration Skill

## Overview

This skill orchestrates a powerful combination of two systems:

| System | Role | Strength |
|--------|------|----------|
| **GSD** | Context Engineering & Planning | Deep specification, multi-phase roadmaps, fresh context orchestration |
| **Ralph-TUI** | Autonomous Execution | AI agent loop orchestration, real-time TUI, multi-agent support |

**The Pattern:** GSD plans → Ralph executes → GSD verifies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    META-WORKFLOW FLOWCHART                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐              │
│   │   GSD:      │────▶│   GSD:      │────▶│   GSD:      │              │
│   │   NEW       │     │   DISCUSS   │     │   PLAN      │              │
│   │   PROJECT   │     │   PHASE     │     │   PHASE     │              │
│   └─────────────┘     └─────────────┘     └─────────────┘              │
│          │                   │                   │                      │
│          ▼                   ▼                   ▼                      │
│   PROJECT.md,          CONTEXT.md,         PLAN.md files,              │
│   REQUIREMENTS.md,     decisions locked    verification ready          │
│   ROADMAP.md                                                        │
│                                                                         │
│                              │                                          │
│                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    RALPH-TUI EXECUTION                       │      │
│   │                                                             │      │
│   │   ┌──────────┐    ┌──────────┐    ┌──────────┐              │      │
│   │   │  CREATE  │───▶│ CONVERT  │───▶│   RUN    │              │      │
│   │   │   PRD    │    │   TO     │    │ AUTONOMOUS│              │      │
│   │   │          │    │  TASKS   │    │   LOOP   │              │      │
│   │   └──────────┘    └──────────┘    └──────────┘              │      │
│   │        │                 │                │                  │      │
│   │        ▼                 ▼                ▼                  │      │
│   │   ralph-tui        prd.json or        Agent selects          │      │
│   │   create-prd      beads issues        tasks, executes,       │      │
│   │                                          repeats             │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                              │                                          │
│                              ▼                                          │
│   ┌─────────────┐     ┌─────────────┐                                  │
│   │   GSD:      │────▶│   GSD:      │                                  │
│   │   VERIFY    │     │   COMPLETE  │                                  │
│   │   WORK      │     │   MILESTONE │                                  │
│   └─────────────┘     └─────────────┘                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## When to Use This Skill

**Use GSD+Ralph Orchestration when:**
- Building a new feature or project from scratch
- Complex multi-phase development (v1, v2, v3)
- Need both deep planning AND autonomous execution
- Context management is critical (large codebase, long project)
- You want atomic commits with clear traceability

**Use Ralph-TUI alone when:**
- You already have a PRD or well-defined task list
- Quick execution without heavy planning overhead
- Simple features with clear scope

**Use GSD alone when:**
- Pure planning/research phase without immediate execution
- Brownfield analysis (`/gsd:map-codebase`)
- Quick tasks that don't need autonomous orchestration (`/gsd:quick`)

## Prerequisites

Ensure both systems are installed:

```bash
# GSD
npx get-shit-done-cc

# Ralph-TUI
bun install -g ralph-tui
```

## Meta-Workflow Steps

### Phase 1: GSD Context Extraction (30-60 min)

Start by extracting all relevant context from the user and codebase.

**Command:**
```
/gsd:new-project
```

**Or for existing codebases:**
```
/gsd:map-codebase
```

**What happens:**
1. Questions user about goals, constraints, tech preferences
2. Spawns parallel agents to research the domain
3. Creates `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`
4. Establishes phase breakdown (v1 → v2 → v3)

**Output for Ralph:** Clear requirements traceable to phases

---

### Phase 2: GSD Implementation Discussion (15-30 min per phase)

Before planning each phase, capture implementation decisions to guide both planning and execution.

**Command:**
```
/gsd:discuss-phase N
```

**What happens:**
1. Analyzes phase based on PROJECT.md context
2. Identifies gray areas (UI → layout, density, interactions; API → format, errors)
3. Iteratively asks questions until decisions are locked
4. Creates `{phase}-CONTEXT.md`

**Output for Ralph:** Rich implementation context, not just "what" but "how"

---

### Phase 3: GSD Planning (15-30 min per phase)

Create atomic, verifiable plans optimized for autonomous execution.

**Command:**
```
/gsd:plan-phase N
```

**What happens:**
1. Researches implementation approach (guided by CONTEXT.md)
2. Creates 2-3 task plans per phase
3. Verifies plans against requirements
4. Creates `{phase}-{N}-PLAN.md` with XML structure

**Plan structure optimized for Ralph:**
```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    POST endpoint accepting {email, password}.
    Query User by email, compare with bcrypt.
    On match, create JWT with jose, set httpOnly cookie.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials → 200 + cookie. Invalid → 401.</done>
</task>
```

**Output for Ralph:** Executable tasks with clear acceptance criteria

---

### Phase 4: Ralph-TUI Execution (Variable)

Convert GSD plans to Ralph format and execute autonomously.

**Step 4a: Convert Plans to PRD**

```bash
cd your-project
ralph-tui create-prd
```

Or convert existing plans:
```bash
ralph-tui create-json --input .planning/phase-1/*.md
```

**Step 4b: Execute with Ralph**

```bash
# Standard execution
ralph-tui run --prd ./prd.json

# With sandbox isolation (recommended)
ralph-tui run --prd ./prd.json --sandbox

# Headless (no TUI, for CI/CD)
ralph-tui run --prd ./prd.json --headless
```

**Ralph's autonomous loop:**
1. SELECT: Picks highest-priority task from prd.json
2. BUILD: Constructs prompt from task + context
3. EXECUTE: Runs configured agent (Claude Code, Codex, etc.)
4. DETECT: Analyzes output for completion
5. REPEAT: Loops until all tasks complete

**Output:** Implemented features, atomic commits per task

---

### Phase 5: GSD Verification (15-30 min per phase)

Verify the autonomous work meets quality standards.

**Command:**
```
/gsd:verify-work N
```

**What happens:**
1. Extracts testable deliverables from completed phase
2. Walks through each deliverable (user confirmation)
3. Diagnoses failures automatically if issues found
4. Creates fix plans if verification fails

**Verification checkpoints:**
- Code exists and compiles
- Tests pass (if defined)
- Feature works as expected (manual confirmation)
- Acceptance criteria met

**Output for next phase:** Confirmed working code, known issues documented

---

### Phase 6: Complete & Iterate

**Complete milestone when all phases done:**
```
/gsd:complete-milestone
```

**Start next milestone:**
```
/gsd:new-milestone
```

## File Mapping Between Systems

| GSD File | Ralph-TUI Artifact | Notes |
|----------|-------------------|-------|
| `PROJECT.md` | Referenced in PRD | Project vision |
| `REQUIREMENTS.md` | User Stories | Traced to phases |
| `ROADMAP.md` | Task priorities | Phase ordering |
| `{phase}-CONTEXT.md` | PRD Notes | Implementation context |
| `{phase}-{N}-PLAN.md` | Task items | Atomic units |
| `{phase}-VERIFICATION.md` | Quality Gates | Acceptance criteria |

## Configuration for Integration

### Recommended GSD Settings

```json
{
  "mode": "interactive",
  "depth": "standard",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true
  },
  "parallelization": {
    "enabled": true
  }
}
```

### Recommended Ralph-TUI Settings

```bash
# In .ralph-tui/config.toml or ~/.config/ralph-tui/config.toml

# Match GSD's agent selection
agent = "claude-code"

# Enable for safety
sandbox = true

# Match your project
default_command = "bun run test && bun run typecheck"
```

## Anti-Patterns to Avoid

### ❌ Don't Skip Context Engineering
Starting Ralph without GSD planning leads to:
- Tasks too large for single execution
- Missing acceptance criteria
- Inconsistent implementations
- Context rot mid-project

### ❌ Don't Skip Verification
Trusting Ralph's output without GSD verification:
- Features that "work" but don't match user intent
- Missing edge cases
- Integration issues between tasks

### ❌ Don't Convert Plans Manually
Use `ralph-tui create-prd` or `ralph-tui create-json`:
- Ensures correct format
- Extracts quality gates
- Handles file paths correctly

### ❌ Don't Mix GSD Quick Mode with Ralph
Quick mode is for ad-hoc tasks without execution guarantees. Ralph requires proper planning.

## Troubleshooting Integration Issues

### Plans Not Converting to PRD

**Problem:** `ralph-tui create-json` fails on GSD plans

**Solution:** Ensure plans use standard XML format:
```xml
<task type="auto">
  <name>...</name>
  <files>...</files>
  <action>...</action>
  <verify>...</verify>
  <done>...</done>
</task>
```

### Ralph Missing Context

**Problem:** Agent doesn't know about PROJECT.md or decisions

**Solution:** Ensure quality gates include context files:
```markdown
## Quality Gates

- Load and reference: @PROJECT.md
- Reference: @phase-1-CONTEXT.md
- bun run typecheck && bun run lint
```

### Context Rot Mid-Execution

**Problem:** Claude's context fills up over many tasks

**Solution:** Ralph handles this by:
- Using fresh subagent contexts per task
- Loading context from files, not memory
- Pruning irrelevant context automatically

### Verification Fails After Ralph Execution

**Problem:** `/gsd:verify-work` finds issues

**Solution:** Ralph's execution is atomic per task:
1. Identify failing task from verification
2. Run `/gsd:execute-phase` again
3. Ralph re-executes only affected tasks
4. Verification passes

## Advanced Patterns

### Multi-Agent Coordination

Ralph supports multiple agents. Configure per task in prd.json:

```json
{
  "stories": [
    {
      "title": "Backend API",
      "agent": "opencode"
    },
    {
      "title": "Frontend UI",
      "agent": "claude-code"
    }
  ]
}
```

### Remote Execution

Control remote Ralph instances from local TUI:

```bash
# On server
ralph-tui run --listen --prd ./prd.json

# On local
ralph-tui remote add prod server.example.com:7890 --token <token>
ralph-tui  # Tabs show local + prod
```

### GSD + Ralph in CI/CD

```bash
# CI script
npx get-shit-done-cc --claude --local
ralph-tui run --prd ./prd.json --headless
npx get-shit-done-cc --claude --local --uninstall
```

## Workflow Summary

| Stage | Command | Output | Next Trigger |
|-------|---------|--------|--------------|
| 1. Init | `/gsd:new-project` | PROJECT.md, ROADMAP.md | Discuss phase when ready |
| 2. Discuss | `/gsd:discuss-phase N` | CONTEXT.md | Plan when decisions made |
| 3. Plan | `/gsd:plan-phase N` | PLAN.md files | Ralph when plans ready |
| 4. Execute | `ralph-tui run` | Implemented features | Verify when complete |
| 5. Verify | `/gssd:verify-work N` | UAT results | Complete or iterate |
| 6. Complete | `/gsd:complete-milestone` | Tagged release | New milestone or done |

## Quick Reference

```bash
# Start new project
/gsd:new-project

# Discuss phase 1
/gsd:discuss-phase 1

# Plan phase 1
/gsd:plan-phase 1

# Execute with Ralph
ralph-tui create-prd
ralph-tui run --prd ./prd.json

# Verify phase 1
/gsd:verify-work 1

# Next phase...
/gsd:discuss-phase 2
/gsd:plan-phase 2
ralph-tui run --prd ./prd.json
/gsd:verify-work 2

# Complete
/gsd:complete-milestone
```

---

## Checklist

Before executing the meta-workflow:

- [ ] GSD installed (`npx get-shit-done-cc`)
- [ ] Ralph-TUI installed (`bun install -g ralph-tui`)
- [ ] Project context captured (`/gsd:new-project`)
- [ ] Phase discussed (`/gsd:discuss-phase N`)
- [ ] Plans created (`/gsd:plan-phase N`)
- [ ] Plans converted to PRD (`ralph-tui create-prd`)
- [ ] Ralph configured (agent, quality gates)
- [ ] Verification ready (`/gsd:verify-work N`)

---

**Result:** Systematic, traceable, high-quality software development combining GSD's planning precision with Ralph-TUI's autonomous execution power.
