# Claude Hours - Autonomous Overnight Development System

**Philosophy:** Claude wakes up surprised by what it built overnight. No human prompting required.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLAUDE HOURS CORE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  ORCHESTRA       │    │  NIGHTLY SETUP   │                   │
│  │  (Scheduler)     │    │  (Startup)       │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌──────────────────────────────────────────┐                   │
│  │            WORKER MANAGER                │                   │
│  │  • Spawn 4 parallel workers              │                   │
│  │  • Monitor progress                       │                   │
│  │  • Handle failures                       │                   │
│  └──────────────────┬───────────────────────┘                   │
│                     │                                           │
│        ┌────────────┼────────────┐                             │
│        ▼            ▼            ▼                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│   │Worker 1 │  │Worker 2 │  │Worker 3 │  ... (4 workers)       │
│   │Builds X │  │Builds Y │  │Builds Z │                        │
│   └─────────┘  └─────────┘  └─────────┘                        │
│                     │                                           │
│                     ▼                                           │
│  ┌──────────────────────────────────────────┐                   │
│  │  QUALITY ENFORCER                        │                   │
│  │  • Verify artifacts exist                │                   │
│  │  • Check executables work                │                   │
│  │  • Log quality metrics                   │                   │
│  └──────────────────┬───────────────────────┘                   │
│                     │                                           │
│                     ▼                                           │
│  ┌──────────────────────────────────────────┐                   │
│  │  MORNING REPORT                          │                   │
│  │  • What was built                        │                   │
│  │  • For Jae review                        │                   │
│  │  • Next night seeds                      │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Tonight (9 PM)

```bash
# Start autonomous overnight development
./scripts/claude-hours-nightly.sh setup

# This will:
# 1. Clean previous session
# 2. Generate ambitious goals for tonight
# 3. Spawn 4 autonomous workers
# 4. Setup quality enforcement
# 5. Prepare morning report
```

### Morning (After 8 AM)

```bash
# See what Claude built
./scripts/claude-hours-nightly.sh report

# Or run the detailed morning report
bash .claude/orchestra/morning-report.sh
```

## Key Components

### 1. Nightly Setup (`claude-hours-nightly.sh`)

Prepares the system for overnight development:
- Generates ambitious hourly goals
- Spawns parallel workers
- Sets up quality enforcement
- Prepares morning report

### 2. Orchestra (`claude-hours-orchestra.sh`)

Multi-agent orchestration:
- Schedules hourly goals
- Manages worker lifecycle
- Coordinates parallel execution
- Generates schedule logs

### 3. Worker (`claude-hours-worker.sh`)

Autonomous hourly worker:
- Understands assigned goal
- Plans approach
- Executes with subagent help
- Verifies quality
- Prepares handoff

### 4. Enforcer (`claude-hours-enforcer.sh`)

Pre-flight validation:
- Validates task file
- Checks single process
- Verifies acceptance criteria

### 5. Report (`claude-hours-report.sh`)

Morning dashboard:
- Commits made overnight
- Files changed
- System health
- Task status

## Hourly Schedule

| Hour | Focus | Goal |
|------|-------|------|
| 21:00-22:00 | Setup & Goals | Workers spawned, goals defined |
| 22:00-23:00 | Sprint 1 | 3 artifacts started |
| 23:00-00:00 | Sprint 2 | 5+ artifacts in progress |
| 00:00-01:00 | Midnight | Major feature milestone |
| 01:00-02:00 | Refinement | Polish existing work |
| 02:00-03:00 | Quality | 100% verification pass |
| 03:00-04:00 | Documentation | Complete docs |
| 04:00-05:00 | Optimization | Performance tuning |
| 05:00-06:00 | Integration | System integration |
| 06:00-07:00 | Final Build | Complete pending work |
| 07:00-08:00 | Handoff | Report ready |

## Success Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Commits | ≥ 5 | `git log --since="21:00"` |
| Artifacts | ≥ 10 | Find in orchestra dir |
| Executables | ≥ 5 | Find .sh -executable |
| Quality Pass | ≥ 1 | Quality check script |
| Log Size | < 100KB | ls -l *.log |

## Example Output

```
Morning Report - 2026-01-31
═══ What Was Built ═══
  • self-improve/analyze.sh (executable)
  • skill-discovery/find.sh (executable)
  • memory-optimizer/optimize.sh (executable)
  • quality-enforcer/check.sh (executable)

═══ Commits Made ═══
  • abc123feat: Self-improvement analyzer
  • def456feat: Skill discovery engine
  • ghi789feat: Memory optimizer

═══ Quality Score ═══
  PASSED - 12 files, 4 executables, 0 errors

═══ For Jae Review ═══
  • PR: github.com/.../pull/XXX
  • Test: cd .claude/orchestra && ./verify-all.sh
  • Merge: If quality passes

═══ Next Night Seeds ═══
  • Extend self-improvement with ML
  • Build skill marketplace
  • Optimize quality enforcement
```

## Troubleshooting

### No work was accomplished
```bash
# Check if workers ran
cat .claude/logs/orchestra.log | tail -20

# Check for errors
grep ERROR .claude/logs/*.log
```

### Too many workers
```bash
# Kill all workers
./scripts/claude-hours-nightly.sh kill

# Restart fresh
./scripts/claude-hours-nightly.sh setup
```

### Quality issues
```bash
# Run quality check
bash .claude/orchestra/quality-check.sh

# See what failed
cat .claude/orchestra/quality.log
```

## Philosophy

> "I want to wake up surprised by you building your own systems"

This system enables that by:
1. **Autonomy** - Workers decide how to achieve goals
2. **Ambitious Goals** - Generated each night based on system needs
3. **Parallel Execution** - 4 workers running simultaneously
4. **Quality Enforcement** - Artifacts must actually work
5. **Morning Surprise** - What was built when you wake up

## Version

- **Version:** 2.0.0
- **Date:** 2026-01-30
- **Status:** Production Ready
