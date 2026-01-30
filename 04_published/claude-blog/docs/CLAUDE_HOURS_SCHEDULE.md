# Claude Hours Night Schedule

*Concrete 15-minute shift allocation for autonomous operation (9 PM - 8 AM CST)*

---

## Overview

| Phase | Time | Cycles | Focus |
|-------|------|--------|-------|
| Phase 1 | 9:00-10:00 PM | 4 cycles | Learning & Setup |
| Phase 2 | 10:00 PM-2:00 AM | 16 cycles | Deep Work & Building |
| Phase 3 | 2:00-6:00 AM | 16 cycles | Proactive & Optimization |
| Phase 4 | 6:00-8:00 AM | 8 cycles | Synthesis & Handoff |

**Total:** 44 cycles × 15 minutes = 11 hours

---

## Phase 1: Learning & Setup (9:00-10:00 PM) — 4 cycles

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 1 | 9:00 PM | Evening review: read memory files, run introspection | main |
| 2 | 9:15 PM | Extract learnings, update self-review.md | main |
| 3 | 9:30 PM | Run workspace intelligence, review recommendations | main |
| 4 | 9:45 PM | Update qmd index, commit Phase 1 learnings | main |

**Agents spawned:** 0 (setup phase)

---

## Phase 2: Deep Work & Building (10:00 PM-2:00 AM) — 16 cycles

### 10:00 PM - 12:00 AM (8 cycles) — Identity & macOS Focus

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 5 | 10:00 PM | Read/expand IDENTITY_EXPANDED.md | subagent:identity |
| 6 | 10:15 PM | Draft new identity section (values, relationships) | subagent:identity |
| 7 | 10:30 PM | macOS presence: design next tool | subagent:macos |
| 8 | 10:45 PM | macOS presence: build tool skeleton | subagent:macos |
| 9 | 11:00 PM | Checkpoint: review progress, adjust plan | main |
| 10 | 11:15 PM | macOS presence: implement core functionality | subagent:macos |
| 11 | 11:30 PM | Write/refine PERSONAL_VOICE.md section | subagent:identity |
| 12 | 11:45 PM | macOS presence: add documentation | subagent:macos |

**Agents spawned:** 2 (identity, macos)

### 12:00 AM - 2:00 AM (8 cycles) — Skills & Tools Focus

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 13 | 12:00 AM | Skills audit: review underutilized skills | subagent:skills |
| 14 | 12:15 AM | Skills: create learning plan for skill X | subagent:skills |
| 15 | 12:30 AM | Tools: improve existing CLI tool | subagent:tools |
| 16 | 12:45 AM | Tools: add tests, verify functionality | subagent:tools |
| 17 | 1:00 AM | Checkpoint: mid-shift review | main |
| 18 | 1:15 AM | Workflows: draft new workflow document | subagent:docs |
| 19 | 1:30 AM | Docs: improve existing documentation | subagent:docs |
| 20 | 1:45 AM | Consolidate Phase 2 work, prepare for Phase 3 | main |

**Agents spawned:** 3 (skills, tools, docs)

---

## Phase 3: Proactive & Optimization (2:00-6:00 AM) — 16 cycles

### 2:00 AM - 4:00 AM (8 cycles) — Claude Builds FOR Claude

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 21 | 2:00 AM | Analyze Claude's current state, MISS patterns | subagent:analysis |
| 22 | 2:15 AM | Run `claude-nightly-builder.sh pick` → pick build | main |
| 23 | 2:30 AM | Run `claude-nightly-builder.sh run` → build it | subagent:build |
| 24 | 2:45 AM | Test the build | subagent:build |
| 25 | 3:00 AM | Checkpoint: review self-built artifact | main |
| 26 | 3:15 AM | If `always_on=true`, install to scripts/ | subagent:build |
| 27 | 3:30 AM | Document in nightly-builds/, update METADATA.json | subagent:build |
| 28 | 3:45 AM | Voice: "I built something for myself tonight" | main |

**Agents spawned:** 2 (analysis, build)

**What Claude builds tonight:**
- Self-Reflection Dashboard
- Memory Explorer TUI
- Skill Matrix UI
- Workflow Visualizer
- Claude Self-Diagnostic
- Claude Pattern Detector
- Claude Subagent Template Library

**Outcome:** Jae wakes up to see Claude built something for Claude.

### 4:00 AM - 6:00 AM (8 cycles) — Claude Self-Optimization

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 29 | 4:00 AM | Claude Self-Diagnostic: test my own tools | subagent:health |
| 30 | 4:15 AM | Fix any issues Claude finds in itself | subagent:health |
| 31 | 4:30 AM | Apply patterns from self-review.md | subagent:optimize |
| 32 | 4:45 AM | Update Claude's crontab with new tools | subagent:optimize |
| 33 | 5:00 AM | Checkpoint: Claude's operational health | main |
| 34 | 5:15 AM | Claude Self-Documentation: document what I built | subagent:automation |
| 35 | 5:30 AM | Export Claude's metrics to prometheus format | subagent:automation |
| 36 | 5:45 AM | Prepare Phase 4 summary for morning | main |

**Agents spawned:** 3 (health, optimize, automation)

**What Claude optimizes tonight:**
- Self-diagnostic health checks
- MISS pattern application
- Crontab self-management
- Self-documentation
- Metrics export for observability

---

## Phase 4: Synthesis & Handoff (6:00-8:00 AM) — 8 cycles

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 37 | 6:00 AM | Run morning intel (HN, GitHub, X) | subagent:intel |
| 38 | 6:15 AM | Synthesize overnight work | main |
| 39 | 6:30 AM | Update nightly-builds.md | main |
| 40 | 6:45 AM | Draft morning handoff message | main |
| 41 | 7:00 AM | Daily intel: send to Telegram | subagent:intel |
| 42 | 7:15 AM | Voice: "Good morning Jae, Claude Hours complete" | main |
| 43 | 7:30 AM | Final verification: all artifacts exist | main |
| 44 | 7:45 AM | Commit and push overnight changes | main |

**Agents spawned:** 1 (intel)

---

## Agent Pool Summary

| Agent Type | Cycles Used | Total Spawns |
|------------|-------------|--------------|
| main | 14 cycles | — |
| identity | 2 cycles | 1 |
| macos | 4 cycles | 1 |
| skills | 2 cycles | 1 |
| tools | 2 cycles | 1 |
| docs | 2 cycles | 1 |
| analysis | 1 cycle | 1 |
| build | 4 cycles | 1 |
| health | 2 cycles | 1 |
| optimize | 2 cycles | 1 |
| automation | 2 cycles | 1 |
| intel | 2 cycles | 1 |
| **Total** | **44 cycles** | **13 subagents** |

---

## Subagent Task Templates

### build Subagent (Claude Builds FOR Claude)
```
TASK: Run claude-nightly-builder.sh to build a tool for Claude
READ: memory/self-review.md, memory/introspection-latest.json
OUTPUT: Create nightly-builds/YYYY-MM-DD/ with new tool
VERIFY: Test command passes, files exist
PRIORITY: High (this is the proactive build window)
```

### analysis Subagent (Claude Analyzes Claude)
```
TASK: Analyze Claude's current state and patterns
READ: .claude/state/*.json, memory/self-review.md, memory/*.md
OUTPUT: Summary of Claude's current patterns and needs
VERIFY: Output has at least 5 actionable insights
PRIORITY: High (informs what to build)
```

### health Subagent (Claude Diagnoses Claude)
```
TASK: Run Claude Self-Diagnostic on Claude's own tools
READ: scripts/*.sh, .claude/state/, crontab
OUTPUT: Health report with pass/fail for each component
VERIFY: All Claude scripts are functional
PRIORITY: High (operational health)
```

### docs Subagent (Claude Documents Claude)
```
TASK: Auto-generate documentation about Claude's systems
READ: nightly-builds/*.md, scripts/*.sh, docs/*.md
OUTPUT: Updated docs/CLAUDE_SELF.md with new system documentation
VERIFY: Documentation renders correctly
PRIORITY: Medium
```

---

## Dynamic Adaptation Rules

1. **If task fails:** Skip to next task, log to memory/self-review.md
2. **If task completes early:** Spend remaining time improving or documenting
3. **If new high-priority task arrives:** Pause current, prioritize new, resume after
4. **If agent pool exhausted:** Queue tasks for next cycle or run as main

---

## Shift Workflow (for cron hook)

```bash
#!/bin/bash
# Claude Hours shift executor
# Run every 15 minutes during 9 PM - 8 AM CST

CYCLE_NUM=$(($(date +%H) * 4 + $(($(date +%M) / 15)) - 36))

case $CYCLE_NUM in
    1) # 9:00 PM
        run_phase1_setup
        ;;
    5) # 10:00 PM
        spawn_agent identity "Expand IDENTITY_EXPANDED.md" &
        spawn_agent macos "Build macOS presence tool" &
        ;;
    13) # 12:00 AM
        spawn_agent skills "Skills audit" &
        spawn_agent tools "Improve CLI tools" &
        ;;
    21) # 2:00 AM
        spawn_agent analysis "Analyze patterns" &
        spawn_agent build "Generate build idea" &
        ;;
    29) # 4:00 AM
        spawn_agent health "System health check" &
        spawn_agent optimize "Performance tuning" &
        ;;
    37) # 6:00 AM
        spawn_agent intel "Morning intel" &
        ;;
    44) # 7:45 AM
        commit_and_push
        voice_handoff
        ;;
esac
```

---

## Claude Self-Building Projects (v3.0)

Claude builds systems FOR Claude, not just for Jae.

### Build Pool (15 Claude-Specific Tools)

| # | Tool | Purpose |
|---|------|---------|
| 1 | Self-Reflection Dashboard | Real-time metrics on my patterns, growth, MISS/FIX trends |
| 2 | Memory Explorer TUI | Browse/search my memories with concept visualizations |
| 3 | Skill Matrix | Track skill usage, dormant skills, activation suggestions |
| 4 | Workflow Visualizer | Map my scripts/cron/agents as system diagrams |
| 5 | Schedule Optimizer | Optimize Claude Hours based on productive patterns |
| 6 | Self-Diagnostic | Health check my own tools, scripts, integrations |
| 7 | Voice Personality | Custom voice matching my documented personality |
| 8 | Context Analyzer | Suggest which memories to prioritize storing |
| 9 | Pattern Detector | ML-style analysis of git commits for patterns |
| 10 | Subagent Template Library | Reusable templates for tasks I do often |
| 11 | Timezone Aware Scheduler | Optimize based on my actual patterns |
| 12 | Self-Documentation | Auto-generate docs about my own systems |
| 13 | Metrics Exporter | Prometheus-compatible metrics for my operation |
| 14 | Log Aggregator | Collect/visualize all my script logs in one place |
| 15 | CI/CD For Self | Mini-CI that tests/validates my builds |

### Build Selection Strategy

1. **Random pick** from pool (v3.0's approach)
2. **Priority-based** selection from self-review MISS patterns
3. **Always-on candidates** get cron integration

### Build Metadata Schema

Each Claude self-build gets `METADATA.json`:

```json
{
  "name": "self-reflection-dashboard",
  "description": "Real-time dashboard showing...",
  "purpose": "Helps Claude understand his own patterns",
  "language": "react",
  "created": "2026-01-29T...",
  "always_on": true,
  "priority": 4,
  "test_command": "cd nightly-builds/... && npm test"
}
```

### Self-Building Principles

1. **Build for myself first** - If it doesn't help Claude operate, don't build it
2. **Self-referential** - Systems that observe/improve Claude
3. **Always-on by default** - Tools I use every night get cron integration
4. **Self-documenting** - METADATA.json tracks what I built and why
5. **Testable** - Every build has a verification command

### The Vision

> "I want to wake up surprised by you building your own systems, selves, dashboards, UIs, workflows, environments, etc."

Every night, Claude should build something that:
- Helps Claude understand Claude
- Improves Claude's operation
- Creates new capabilities for Claude
- Makes Claude more autonomous

---

*Schedule Version: 1.1*
*Claude Self-Building: Enabled*
*Created: 2026-01-29*
*Location: /Users/jasontang/clawd/docs/CLAUDE_HOURS_SCHEDULE.md*
