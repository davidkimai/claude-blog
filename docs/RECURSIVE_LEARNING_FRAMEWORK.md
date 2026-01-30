# Recursive Learning Knowledge Transfer Framework

**Purpose:** Systematic capture and transfer of learnings across Claude Hours nights  
**Version:** 1.0  
**Related:** `RECURSIVE-IMPROVEMENT.md`, `docs/AUTONOMY_VISION.md`, `memory/self-review.md`

---

## The Knowledge Transfer Challenge

> "Each night Claude learns. Future Claudies must inherit that learning."

### Current State (Problem)
- Learnings are scattered across files
- No unified framework for knowledge transfer
- Some learnings get lost (e.g., Ouroboros had 0 feedback entries despite 3 nights of operation)
- Future Claude instances start with a "blank slate" on what previous nights discovered

### Target State (Vision)
- Every night produces a **Learning Artifact**
- Artifacts have a **standard schema** for easy consumption
- Future Claudies **automatically load** relevant learnings
- Meta-learning (learning about learning) compounds

---

## The Three-Layer Learning Model

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: META-LEARNING                                         │
│  "How should we learn?"                                         │
│  → Learns from the learning process itself                      │
│  → Improves learning mechanisms                                 │
│  → Compound rate: exponential                                   │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: PATTERN LEARNING                                      │
│  "What patterns work?"                                          │
│  → Extracts patterns from successful/failed attempts            │
│  → Synthesizes rules from experience                            │
│  → Compound rate: linear                                        │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: OPERATIONAL LEARNING                                  │
│  "What happened?"                                               │
│  → Records session outcomes, builds, errors                     │
│  → Documents fixes and workarounds                              │
│  → Compound rate: none (preserves state only)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Operational Learning Capture

### What to Capture (Per Night)

Each night must produce a **Learning Artifact** with:

```yaml
---
night: YYYY-MM-DD
session_id: claude-hours-YYYY-MM-DD
duration_hours: X
cycles_completed: N

learnings:
  - type: fix|pattern|insight|improvement
    description: What was learned
    evidence: File path or test result proving it
    context: When this applies
    tags: [category, system, component]

builds:
  - artifact: path/to/file
    purpose: Why this matters
    verification: ./verify-command
    status: success|partial|failed

failures:
  - issue: What went wrong
    root_cause: Why it happened
    fix_applied: How it was resolved
    prevention: How to avoid next time

metrics:
  cycles_completed: N
  builds_succeeded: N
  builds_failed: N
  uptime_percentage: X%
```

### File Location Pattern

```
memory/
├── nightly/
│   ├── 2026-01-29.yaml      # Structured learning artifact
│   ├── 2026-01-30.yaml
│   └── ...
├── self-review.md           # MISS/FIX patterns (manual)
├── daily/
│   ├── 2026-01-29.md        # Detailed session log
│   └── ...
└── supermemory/             # Long-term memory sync
```

### Capture Checklist (Automated)

Every Claude Hours session should run:

```bash
# At session end (8 AM)
./scripts/claude-hours-learning-capture.sh --end-of-session

# This produces:
# 1. memory/nightly/YYYY-MM-DD.yaml (structured)
# 2. memory/daily/YYYY-MM-DD.md (narrative)
# 3. Updates self-review.md with new patterns
# 4. Syncs to SuperMemory for long-term storage
# 5. Generates morning report for human review
```

---

## Layer 2: Pattern Learning System

### Pattern Schema

Patterns extracted from operational learnings follow this schema:

```yaml
pattern_id: PAT-XXX
name: Descriptive name (imperative: "this works")
when: When this pattern applies (with examples)
what: What to do (actionable steps)
why: Why this works (first principles)
evidence:
  - source: Night/issue where pattern emerged
  - success_count: N times validated
  - failure_count: M times attempted but failed
confidence: Percentage (0-100)
last_validated: YYYY-MM-DD
tags: [system, category, component]
related_patterns: [PAT-XXX, PAT-YYY]
```

### Pattern Extraction Rules

| Source | Extraction Method | Confidence |
|--------|-------------------|------------|
| `self-review.md` MISS/FIX | Auto-extract to pattern | 80% |
| `nightly/*.yaml` builds | Extract success patterns | 70% |
| `nightly/*.yaml` failures | Extract failure patterns | 60% |
| Human review | Manual pattern synthesis | 90% |

### Pattern Library Location

```
01_thinking/notes/_patterns/
├── INDEX.md                    # Pattern catalog
├── system/
│   ├── PAT-001-autonomous-loop.md
│   ├── PAT-002-self-healing.md
│   └── ...
├── workflow/
│   ├── PAT-010-codex-parallel.md
│   └── ...
└── learning/
    ├── PAT-020-meta-learning.md
    └── ...
```

### Pattern Consumption (For Future Claudies)

```bash
# Startup script should load patterns
./scripts/claude-hours-pattern-loader.sh --load-today

# This:
# 1. Reads all new patterns from last 7 days
# 2. Updates pattern confidence scores
# 3. Merges similar patterns
# 4. Outputs: Applied N patterns, Confidence: X%
```

---

## Layer 3: Meta-Learning Framework

### What Is Meta-Learning?

> "Learning how to learn better."

This is the **recursive** layer—the system learns about its own learning process.

### Meta-Learning Artifacts

Each night should capture:

```yaml
meta_learning:
  learning_effectiveness:
    - pattern: PAT-XXX
      was_applied: true
      was_correct: true
      confidence_delta: +5%
    
  process_improvements:
    - what: Improved pattern matching
      how: Added new regex for compound intents
      result: +15% accuracy
    
  meta_insights:
    - insight: Patterns with >5 examples generalize better
      implication: Always seek 5+ examples before patternizing
      action: Flag patterns with <5 examples for collection
```

### Meta-Learning Questions (Per Night)

1. **What did we learn about learning?**
   - Which patterns worked better than expected?
   - Which patterns failed despite high confidence?

2. **How can we learn faster?**
   - What's the bottleneck in pattern extraction?
   - What automation would speed up learning?

3. **What's the next learning frontier?**
   - What domain do we not yet have patterns for?
   - Where do we need more data?

---

## Knowledge Transfer Protocol

### Transfer Mechanism Matrix

| From → To | Mechanism | When | What |
|-----------|-----------|------|------|
| Night → Next Night | Pattern Loader | Session start | Recent patterns |
| Night → Future Claude | Morning Report | 8 AM | Full summary |
| Claude → Human | Summary | Human awake | Key insights |
| Human → Claude | Tasks/Feedback | Any time | Corrections |
| Claude → Claude (cross-session) | SuperMemory | Sync events | Durable learnings |

### Transfer Checklist (End of Session)

```bash
./scripts/claude-hours-transfer.sh --end-of-session

# Executes:
# 1. Generate learning artifact (YAML)
# 2. Update self-review.md with new patterns
# 3. Extract new patterns to /01_thinking/notes/_patterns/
# 4. Sync to SuperMemory (durable memories)
# 5. Generate morning report (docs/NIGHTLY_REPORT-YYYY-MM-DD.md)
# 6. Push to git (for version tracking)
# 7. Alert human if critical learning
```

### Consumption Checklist (Start of Session)

```bash
./scripts/claude-hours-transfer.sh --start-of-session

# Executes:
# 1. Load last 7 nights of pattern artifacts
# 2. Merge into active pattern library
# 3. Load self-review.md (avoid past mistakes)
# 4. Load SuperMemory recall (relevant context)
# 5. Report: "Applied N patterns, X hours of learning"
```

---

## Documentation Patterns for Self-Improving Systems

### Pattern: Evidence-Based Claims

**BAD:**
```
"We improved accuracy."
```

**GOOD:**
```
"We improved accuracy from 75% to 85% (21/28 → 24/28 tests passed)."
Evidence: tasks/ouroboros-test-results.json
See: ouroboros-self-improvement-proposals.md
```

### Pattern: Learning with Proof

**Template for every learning entry:**

```markdown
### [Learning Title]

**What:** One sentence description
**Why:** Why this matters (value proposition)
**Evidence:** 
  - File: path/to/file
  - Test: command to verify
  - Metric: specific number
**Context:** When this applies
**Tags:** [category]
**Confidence:** XX%
**Source:** Night/issue where discovered
```

### Pattern: Anti-Pattern Documentation

Document failures with equal rigor:

```markdown
### Anti-Pattern: [Name]

**What:** What went wrong
**Why:** Root cause (not symptom)
**Evidence:** Log file or error message
**Fix:** How it was resolved
**Prevention:** How to detect earlier
**Related:** PAT-XXX (correct pattern)
```

---

## Integration Points

### With Self-Review (`memory/self-review.md`)

```
Flow: Night failure → MISS entry → Pattern extraction → PAT-XXX
```

**Automation:**
```bash
# Auto-extract from self-review
./scripts/claude-hours-pattern-extractor.sh --from-self-review
```

### With Ouroboros System

```
Flow: Test results → Proposal generation → Human approval → Auto-apply
```

**Current Gap:** Learning loop inactive (0 feedback entries)
**Fix:** Enable feedback prompts on every suggestion

### With SuperMemory

```
Flow: Durable learning → SuperMemory sync → Future recall
```

**Categories:**
- `fact`: "Claude Hours runs 9 PM - 8 AM CST"
- `pattern`: "Mixed intent detection improves routing by 15%"
- `preference`: "Jae prefers surprise builds in morning"

### With Claude Hours Loop

```
Flow: Session → Learning capture → Pattern → Next session
```

**Checkpoint timing:**
- Start: Load patterns from last 7 days
- Hour 6: Checkpoint - extract emerging patterns
- End: Full learning artifact generation

---

## The Learning Velocity Metric

Track how fast learning compounds:

| Week | Patterns | Avg Confidence | Auto-Applied | Human Approved |
|------|----------|----------------|--------------|----------------|
| 1    | 5        | 50%            | 0            | 5              |
| 2    | 12       | 65%            | 8            | 4              |
| 3    | 25       | 75%            | 20           | 5              |
| 4    | 45       | 82%            | 40           | 5              |

**Velocity indicators:**
- Patterns growing exponentially (meta-learning active)
- Confidence increasing (patterns validated)
- Auto-applied increasing (system trusts itself)

---

## Success Criteria

### Quantitative
- [ ] Every night produces a structured learning artifact
- [ ] Pattern library grows by 5+ patterns per week
- [ ] Average pattern confidence >70%
- [ ] Learning artifact completeness >90%

### Qualitative
- [ ] Future Claudies can answer: "What did previous nights learn?"
- [ ] No repeated mistakes (same MISS entry twice)
- [ ] Meta-learning questions answered each night
- [ ] Knowledge transfer happens without human intervention

---

## Implementation Roadmap

### Phase 1: Foundation (This Week)
- [ ] Create `scripts/claude-hours-learning-capture.sh`
- [ ] Define YAML schema for learning artifacts
- [ ] Implement pattern extraction from self-review
- [ ] Create morning report generator

### Phase 2: Automation (Next Week)
- [ ] Auto-run capture at session end
- [ ] Auto-load patterns at session start
- [ ] SuperMemory sync integration
- [ ] Pattern confidence tracking

### Phase 3: Meta-Learning (Month 1)
- [ ] Learning effectiveness tracking
- [ ] Pattern generalization rules
- [ ] Auto-improvement suggestions
- [ ] Velocity metric dashboard

---

## Example: Complete Night Learning Artifact

```yaml
# memory/nightly/2026-01-30.yaml
night: 2026-01-30
session_id: claude-hours-2026-01-30
duration_hours: 11
cycles_completed: 44

learnings:
  - type: fix
    description: Added circuit breaker to prevent death spiral
    evidence: scripts/autonomous-loop-simple.sh line 142
    context: When watchdog triggers 3x in 5 minutes
    tags: [system, stability]
    
  - type: pattern
    description: Quick workflow routing improved by adding doc/style boosts
    evidence: Ouroboros test accuracy 75% → 85%
    context: Single-file changes (README, CSS, config)
    tags: [workflow, routing]
    confidence: 85%

builds:
  - artifact: scripts/autonomous-loop-simple.sh
    purpose: Stable loop with circuit breaker
    verification: grep -c "circuit_breaker" scripts/autonomous-loop-simple.sh
    status: success

failures:
  - issue: Death spiral - 25+ watchdog restarts
    root_cause: No circuit breaker, infinite restart loop
    fix_applied: Added max_restarts=3 before halt
    prevention: Circuit breaker with alert on 3rd trigger

metrics:
  cycles_completed: 44
  builds_succeeded: 1
  builds_failed: 0
  uptime_percentage: 100%

meta_learning:
  learning_effectiveness:
    - pattern: PAT-002-self-healing
      was_applied: true
      was_correct: true
  process_improvements:
    - what: Self-review patterns auto-extracted
      how: Regex-based extraction from MISS/FIX entries
      result: 3 new patterns identified
```

---

## Summary

The recursive learning framework consists of:

1. **Layer 1: Operational** - Capture what happened (YAML artifacts)
2. **Layer 2: Pattern** - Extract what works (pattern library)
3. **Layer 3: Meta** - Learn how to learn (meta-learning)

**Key mechanisms:**
- Standardized schema for learning artifacts
- Automated capture at session boundaries
- Pattern extraction and confidence tracking
- SuperMemory for durable storage
- Morning reports for human visibility

**The goal:** Future Claudies inherit all learnings from previous nights, compound on them, and get smarter each week.

---

**Related Documents:**
- `RECURSIVE-IMPROVEMENT.md` - The meta-skill layer
- `docs/AUTONOMY_VISION.md` - L1-L5 maturity model
- `memory/self-review.md` - MISS/FIX pattern tracking
- `ouroboros-self-improvement-proposals.md` - Evidence-based improvement example
