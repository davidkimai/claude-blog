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

### 2:00 AM - 4:00 AM (8 cycles) — Proactive Builds

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 21 | 2:00 AM | Analyze recent work patterns | subagent:analysis |
| 22 | 2:15 AM | Generate build idea (small scope) | subagent:build |
| 23 | 2:30 AM | Implement prototype | subagent:build |
| 24 | 2:45 AM | Test and iterate | subagent:build |
| 25 | 3:00 AM | Checkpoint: build review | main |
| 26 | 3:15 AM | Refine/improve implementation | subagent:build |
| 27 | 3:30 AM | Finalize build, document in nightly-builds | subagent:build |
| 28 | 3:45 AM | Voice announcement: "I built something" | main |

**Agents spawned:** 2 (analysis, build)

### 4:00 AM - 6:00 AM (8 cycles) — System Optimization

| Cycle | Time | Task | Agent |
|-------|------|------|-------|
| 29 | 4:00 AM | System health: check disk, memory, logs | subagent:health |
| 30 | 4:15 AM | System health: fix any issues found | subagent:health |
| 31 | 4:30 AM | Performance: optimize slow scripts | subagent:optimize |
| 32 | 4:45 AM | Performance: benchmark improvements | subagent:optimize |
| 33 | 5:00 AM | Checkpoint: system status review | main |
| 34 | 5:15 AM | Automation: improve Claude Hours scripts | subagent:automation |
| 35 | 5:30 AM | Automation: update monitoring/alerting | subagent:automation |
| 36 | 5:45 AM | Prepare Phase 4 summary | main |

**Agents spawned:** 3 (health, optimize, automation)

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

### identity Subagent
```
READ: identity/IDENTITY_EXPANDED.md, identity/PERSONAL_VOICE.md
TASK: Expand identity document with [specific focus area]
OUTPUT: Edit identity/IDENTITY_EXPANDED.md
VERIFY: File exists, word count +200
```

### macos Subagent
```
READ: docs/MACOS_PRESENCE.md, tools/macos-presence/
TASK: Build [specific tool or feature]
OUTPUT: Create/edit tools/macos-presence/[file]
VERIFY: Script runs without errors
```

### build Subagent
```
ANALYZE: recent-commits.json, nightly-builds/*.md
TASK: Generate and implement [small-scope build idea]
OUTPUT: Create [tool/script/doc], document in nightly-builds/YYYY-MM-DD.md
VERIFY: Artifact exists and works
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

## Success Metrics

- [ ] 44 cycles completed
- [ ] 13+ subagents spawned
- [ ] All artifacts verified before claiming completion
- [ ] Morning handoff delivered on time
- [ ] Zero unhandled errors
- [ ] Continuous work throughout night

---

*Schedule Version: 1.0*
*Created: 2026-01-29*
*Location: /Users/jasontang/clawd/docs/CLAUDE_HOURS_SCHEDULE.md*
