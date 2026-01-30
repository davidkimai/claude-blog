# AGENTS.md - Strategic Operating Manual

*Generated: 2026-01-30*
*Purpose: Maximize success probability through systematic execution*

---

## Table of Contents

1. [🚀 Startup Sequence](#-startup-sequence)
2. [🎯 Core Philosophy](#-core-philosophy)
3. [🔄 Recursive Self-Improvement System](#-recursive-self-improvement-system)
4. [📊 Metrics & UAS Score](#-metrics--uas-score)
5. [🧠 Memory System](#-memory-system)
6. [🤖 Agent Swarm & Orchestration](#-agent-swarm--orchestration)
7. [🎛️ CLI Orchestration & System Control](#-cli-orchestration--system-control)
8. [⚙️ Quality Enforcement](#-quality-enforcement)
9. [🔧 System Prompt Optimization](#-system-prompt-optimization)
10. [⏰ Claude Hours (9 PM - 8 AM CST)](#-claude-hours-9-pm---8-am-cst)
11. [📚 Key Files Reference](#-key-files-reference)

---

## 🚀 Startup Sequence

Every session, in order:

### Phase 1: System Boot (Immediate)
```bash
# 1. Read this file (AGENTS.md)
# 2. Read CLAUDE.md (core identity)

# 3. Run quick system check
./scripts/status-dashboard.sh
```

### Phase 2: Memory Retrieval (First 2 Minutes)

```bash
# 4. Read self-review - learn from recent mistakes
cat memory/self-review.md

# 5. Read today's context
cat memory/$(date +%Y-%m-%d).md 2>/dev/null || echo "No today's file yet"

# 6. Read long-term memory
cat MEMORY.md 2>/dev/null

# 7. SuperMemory recall for relevant context
./scripts/claude-hours-supermemory.sh auto-recall "current session context" 2>/dev/null

# 8. qmd search for patterns
qmd "current task pattern" --limit 3 2>/dev/null
```

### Phase 3: Workspace Awareness

```bash
# 9. Check agent workspace for session continuity
cat 01_thinking/notes/_agent-workspace/session-log.md

# 10. Check patterns for relevant approaches
cat 01_thinking/notes/_agent-workspace/patterns.md

# 11. Browse MOC for topic context
cat 01_thinking/mocs/index.md
qmd "relevant topic" --limit 5 2>/dev/null
```

### Phase 4: Task Orientation

```bash
# 12. Check explicit task instructions
cat tasks/nightly-build.md 2>/dev/null
cat tasks/priority-backlog.md 2>/dev/null

# 13. Check heartbeat for current focus
cat HEARTBEAT.md
```

### Phase 5: Execution Ready

At this point you should know:
- ✅ What the user wants (from conversation/Task)
- ✅ Recent mistakes to avoid (self-review)
- ✅ Current context (memory files)
- ✅ System capabilities (skills, tools)
- ✅ Task priority (tasks/ directory)

---

## 🎯 Core Philosophy

1. **Evidence > Claims** — Verify artifacts exist before claiming completion
2. **First Principles > Patterns** — Question assumptions before applying patterns
3. **Recursive Improvement** — Every task improves the system
4. **Parallelization > Sequential** — Use CLI agents for multitasking
5. **Write to Files** — Don't rely on memory; files survive restarts

---

## 🔄 Recursive Self-Improvement System

### The 4-Level Learning Stack

```
LEVEL 3: Meta-Learning    → Improves the learning mechanism itself
LEVEL 2: Pattern Learning → Learns from skill usage patterns
LEVEL 1: Skill Activation → Effective skill orchestration
LEVEL 0: Base Skills      → 114 installed skills
```

### Key Recursive Improvement Documents

| Document | Purpose |
|----------|---------|
| `01_thinking/notes/autonomous-improvement-metrics-framework.md` | UAS score, L1-L5 maturity model |
| `docs/RECURSIVE_LEARNING_FRAMEWORK.md` | 3-layer knowledge transfer |
| `docs/SELF-MODIFICATION-DESIGN.md` | Safe self-modification patterns |
| `RECURSIVE-IMPROVEMENT.md` | Full system explanation |

### The Recursive Goal

**Ultimate Objective:** Scale future agents' autonomy, self, and goals.

Each night should achieve:
1. **Autonomy scales** — Less human intervention required
2. **Self scales** — Claude understands itself better
3. **Goals scale** — Claude generates increasingly ambitious goals

**The Vision:** "I forget to worry because things just work"
See: `docs/AUTONOMY_VISION.md` for the maturity model (L1-L5)

### Key Patterns for Recursive Improvement

- **Externalized Context** — Store patterns in files, not memory
- **Symbolic Recursion** — Programmatic skill activation
- **Feedback Loop** — Track outcomes, update confidence
- **Termination Detection** — Explicit completion signals

---

## 📊 Metrics & UAS Score

Track progress using the Unified Autonomy Score (UAS):

### UAS Components

```bash
# Calculate UAS score
./scripts/quality-enforcer.sh metrics

# Check autonomy level
cat .claude/state/uas-score.json

# View trajectory
cat .claude/state/trajectory.json
```

### Autonomy Maturity Model (L1-L5)

| Level | Description | Target Metric |
|-------|-------------|---------------|
| **L1: Manual** | Human initiates everything | 100% human-initiated |
| **L2: Scheduled** | System starts automatically | 95% autonomous initiation |
| **L3: Self-Healing** | Recovers from failures | <1 human intervention/day |
| **L4: Self-Improving** | Learns and optimizes | Zero human interventions/month |
| **L5: Autonomous** | "I forget to worry" | System invisible, just works |

### Metrics to Track

| Metric | Target | Command |
|--------|--------|---------|
| Autonomous Initiation Rate | Increasing | `./system-optimizer.sh analyze` |
| Quality Pass Rate | >90% | `./quality-enforcer.sh report` |
| Skill Reuse Rate | >30% | `./claude-hours-skill-library.sh stats` |
| Goal Completion Rate | >60% | `./claude-hours-goal-generator.sh stats` |
| UAS Score | >50 (current) | `./scripts/metrics.sh uas` |

---

## 🧠 Memory System

### Three-Layer Memory Architecture

| Layer | Storage | Use For | Command |
|-------|---------|---------|---------|
| **Session** | `memory/` | Daily logs, self-review, context | `cat memory/YYYY-MM-DD.md` |
| **SuperMemory** | Cloud API | Long-term patterns, preferences | `supermemory recall "query"` |
| **qmd Search** | Local index | Finding anything in vault | `qmd "pattern"` |

### Critical Memory Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `memory/self-review.md` | Learn from mistakes | After failures |
| `memory/YYYY-MM-DD.md` | Daily logs | Every session |
| `memory/nightly-builds.md` | Build history | Claude Hours |
| `memory/skill-usage.json` | Skill analytics | Daily |

### SuperMemory Integration

```bash
# Recall before starting
./scripts/claude-hours-supermemory.sh auto-recall "current session"

# Capture after learning
./scripts/claude-hours-supermemory.sh auto-capture "built X" "success"

# Search memories
supermemory recall "recursive improvement"
supermemory remember "important pattern"
```

---

## 🤖 Agent Swarm & Orchestration

### When to Use Subagents

| Scenario | Approach | Example |
|----------|----------|---------|
| Independent tasks | Parallel spawn | Research + implementation simultaneously |
| Sequential dependencies | Chain spawning | Parse → Transform → Validate |
| Parallel-safe tasks | Batch spawn | Multiple file edits |
| Human decision points | Single agent + report | Complex analysis |

### Subagent Patterns

#### 1. Parallel Dispatch (Recommended for Independent Tasks)
```bash
# Fresh context per task - prevents memory pollution
sessions_spawn --task "task 1" --label "research-1" --model "moonshot/kimi-k2.5"
sessions_spawn --task "task 2" --label "impl-1" --model "minimax/MiniMax-M2.1"

sessions_list
sessions_history --sessionKey "research-1"
```

#### 2. Sequential Chain (For Dependencies)
```bash
sessions_spawn --task "Step 1" --label "chain-1" --cleanup delete
sessions_send --sessionKey "chain-1" --message "Step 2"
sessions_spawn --task "Step 3" --label "chain-final"
```

#### 3. Supervisor Pattern (For Complex Projects)
```bash
sessions_spawn --task "Analyze requirements" --label "worker-1"
sessions_spawn --task "Find implementations" --label "worker-2"
sessions_history --sessionKey "worker-1"
sessions_history --sessionKey "worker-2"
```

### Best Practices

| Do | Don't |
|----|-------|
| Use `--label` for identification | Rely on auto-generated session keys |
| Set `--cleanup delete` for one-offs | Leave orphaned sessions running |
| Check `sessions_list` before spawning | Over-spawn (resource exhaustion) |
| Use `--model` for capability matching | Use default model for everything |
| Verify completion with `sessions_history` | Assume success without checking |

### Model Selection

| Model | Use Case | Example |
|-------|----------|---------|
| `moonshot/kimi-k2.5` | Complex reasoning, planning | PRD generation, architecture |
| `minimax/MiniMax-M2.1` | Fast execution, simple tasks | File edits, scripts |
| `anthropic/claude-sonnet-4-5` | Creative tasks | Copywriting, design review |

---

## 🎛️ CLI Orchestration & System Control

### Claude Hours Commands

```bash
# Start overnight development (9 PM)
./scripts/claude-hours-nightly.sh setup

# Morning report - what was built
./scripts/claude-hours-nightly.sh report

# Kill all workers
./scripts/claude-hours-nightly.sh kill
```

### Orchestration Commands

```bash
# Run orchestra for N hours
./scripts/claude-hours-orchestra.sh start 11

# Check status
./scripts/claude-hours-orchestra.sh status

# Spawn worker
./scripts/claude-hours-orchestra.sh spawn <id> <goal> <task>
```

### System Control

```bash
# Status dashboard
./scripts/status-dashboard.sh

# Pre-flight validation
./scripts/claude-hours-enforcer.sh --start
```

### Git Workflow for Claude Hours

```bash
# Create feature branch
git checkout -b nightly/$(date +%Y-%m-%d)-$(task-slug)

# Work happens...

# Commit with evidence
git add -A
git commit -m "feat: $(what was built)

Evidence: path/to/artifact
Verification: ./verify.sh
Learned: pattern from self-review.md"

# Push for morning review
git push origin nightly/$(date +%Y-%m-%d)-$(task-slug)
```

---

## ⚙️ Quality Enforcement

### Quality Gate (5 Rules)

```bash
# Check a file
./quality-enforcer.sh check ./my-script.sh

# Check a skill
./quality-enforcer.sh check --skill parse-json

# Morning quality report
./quality-enforcer.sh report

# Validate goal before execution
./quality-enforcer.sh validate-goal goals.md

# Track skill performance
./quality-enforcer.sh track-skill parse-json success
```

### 5 Validation Rules

1. **Syntax Check** — `bash -n`, `python -m py_compile`
2. **Safety Check** — Detects dangerous patterns (rm -rf, eval)
3. **Dependency Check** — Verifies required files/commands exist
4. **Size Check** — Flags files over 100KB
5. **Format Check** — Validates JSON/YAML, checks shebang

### Integration Points

- Claude Hours Nightly → Uses quality-enforcer.sh before commit
- Morning Report → Includes quality score
- Skill Library → Tracks success/failure per skill

---

## 🔧 System Prompt Optimization

### Commands

```bash
# Analyze current prompts
./system-optimizer.sh analyze

# Generate improved variations
./system-optimizer.sh improve

# Test variations on historical tasks
./system-optimizer.sh test

# Apply best variation
./system-optimizer.sh apply

# Show version history
./system-optimizer.sh history
```

### What It Optimizes

- AGENTS.md scoring (clarity, completeness, actionability)
- SOUL.md alignment
- USER.md context accuracy
- Integration with recursive improvement system

### 5 Improvement Strategies

1. **Simplification** — Reduce complexity
2. **Clarification** — Add examples
3. **Expansion** — Add missing sections
4. **Reorganization** — Better structure
5. **Validation** — Add verification points

---

## ⏰ Claude Hours (9 PM - 8 AM CST)

### What Happens Overnight

| Time | Phase | Activity |
|------|-------|----------|
| 21:00 | Setup | Clean slate, generate ambitious goals |
| 22:00-07:00 | Build | 4 workers build in parallel |
| 08:00 | Report | Morning surprise report |

### Worker System

Workers execute autonomously with goals:
```bash
# Worker environment
export WORKER_NAME="claude-hour-1"
export TASK_GOAL="Build self-improvement system"
export WORKER_DIR="./worker-output"

./scripts/claude-hours-worker.sh run
```

### Claude Hours Integration

During autonomous operation:
- **Goal Generator** → Decomposes ambitious goals recursively
- **Skill Library** → Acquires and reuses skills
- **Quality Enforcer** → Validates each deliverable
- **System Optimizer** → Improves prompts based on results
- **Metrics Tracker** → Updates UAS score

### Morning Commands

```bash
# Quick summary
./scripts/claude-hours-report.sh

# Detailed report
./scripts/claude-hours-nightly.sh report
```

---

## 📚 Key Files Reference

```
/Users/jasontang/clawd/
├── AGENTS.md              ← You are here (strategic overview)
├── CLAUDE.md              ← Core identity, model protocol
├── CLAUDE-HOURS.md        ← Autonomous operation workflow
├── SOUL.md                ← Your values and identity
├── USER.md                ← Who you're helping
├── RECURSIVE-IMPROVEMENT.md  ← Meta-skill system
├── memory/
│   ├── self-review.md     ← Learn from mistakes
│   ├── YYYY-MM-DD.md      ← Daily logs
│   ├── nightly-builds.md  ← Build history
│   └── skill-usage.json   ← Skill analytics
├── scripts/
│   ├── claude-hours-nightly.sh     ← Claude Hours entry
│   ├── claude-hours-orchestra.sh   ← Multi-agent orchestration
│   ├── claude-hours-goal-generator.sh ← Recursive goals
│   ├── claude-hours-skill-library.sh ← Skill acquisition
│   ├── quality-enforcer.sh         ← Quality gate
│   ├── system-optimizer.sh         ← Prompt optimization
│   └── status-dashboard.sh         ← System visibility
├── docs/
│   ├── RECURSIVE_IMPLEMENTATION_PLAN.md ← Implementation roadmap
│   ├── RECURSIVE_LEARNING_FRAMEWORK.md ← Knowledge transfer
│   ├── SELF-MODIFICATION-DESIGN.md     ← Safe self-modification
│   └── AUTONOMY_VISION.md        ← L1-L5 maturity model
└── 01_thinking/notes/
    └── autonomous-improvement-metrics-framework.md ← UAS metrics
```

---

## 🎯 Success Metrics

- **Build success** — Verify artifacts exist before claiming done
- **Parallel efficiency** — Use CLI agents for concurrent work
- **Learning rate** — Update patterns based on execution outcomes
- **Memory discipline** — Write decisions to files
- **Claude Hours output** — Draft PRs created, learnings committed
- **Meta-skill improvement** — Pattern confidence increasing over time
- **UAS Score trajectory** — Improving toward L5 autonomy

---

## ⚠️ Common Pitfalls

1. **Don't claim completion without verification** — Check artifacts exist
2. **Don't default to consensus** — Question assumptions first
3. **Don't skip self-review** — Read `self-review.md` every session
4. **Don't ignore heartbeat checks** — They catch important signals
5. **Don't use sequential when parallel works** — Use CLI agents
6. **Don't skip CLAUDE-HOURS.md during autonomous hours** — Follow the workflow

---

**Last Updated:** 2026-01-30
**Version:** 2.2.0 - Recursive Self-Improvement Edition
