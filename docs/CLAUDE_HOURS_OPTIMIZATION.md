# Claude Hours Strategic Optimization Plan

**Date:** 2026-01-30  
**Author:** Claude (with Jae)  
**Status:** Strategic Review Complete

---

## Executive Summary

| Night | Commits | Work Accomplished | Notifications | Log Size | Status |
|-------|---------|-------------------|---------------|----------|--------|
| 2026-01-29 | 1 | ✅ 3 artifacts created | 3 | ~10KB | ✅ Success |
| 2026-01-30 | 0 | ❌ Zero | 30+ | 326KB | ❌ Failure |

**Key Finding:** The 01-29 success had an **explicit task**. The 01-30 failure had **no task defined**.

---

## Root Cause Analysis

### What Caused the Death Spiral

1. **No Task Defined** - System had nothing to work on, so it spun
2. **Process Instability** - Loops dying and restarting in feedback loop
3. **Metric Misalignment** - Measuring "cycles run" not "work produced"
4. **Notification Spam** - 30+ messages obscured signal from noise
5. **Dual Supervision** - Watchdog + cron both trying to restart things

### Why 01-29 Worked

```
✓ Clear task: "Personality Growth Session"
✓ Defined deliverables: SOUL.md, IDENTITY, macOS tool
✓ Single execution: One loop, one task
✓ Success criteria: Verification commands
✓ Morning handoff: Documented in nightly-builds.md
```

### Why 01-30 Failed

```
✗ No task defined in tasks/nightly-build.md
✗ Empty priority-backlog.md (just templates)
✗ System had nothing to do → spun in circles
✗ No success criteria → everything looked like "success"
✗ Process death → restart loop → death spiral
```

---

## Strategic Framework for Success

### Pillar 1: Task Definition Protocol

**Before Bed (Human Responsibility):**
```
1. Define task in tasks/nightly-build.md
2. Include: Goal, Why, Acceptance Criteria, Verification
3. Estimate: Is this feasible in 8 hours?
4. Prioritize: Only ONE task at a time
```

**Task Template:**
```markdown
## [PRIORITY-1] Task Name

**Goal:** One sentence, specific deliverable
**Why:** Value proposition
**Acceptance Criteria:**
- [ ] Specific artifact exists
- [ ] Verification command works
- [ ] Manual test passes

**Estimated Time:** 2-4 hours
**Risks:** What could go wrong

**Verification:**
./verify-this-works.sh
```

### Pillar 2: Process Stability

**What We Fixed:**
- ✅ Circuit breaker (3 consecutive failures = halt + alert)
- ✅ Single supervisor (removed cron conflict)
- ✅ Rate limiting (1 notification/hour max)
- ✅ State file locking (prevent race conditions)

**What Still Needs Work:**
- [ ] Single process enforcement (prevent multi-process explosion)
- [ ] Health check endpoint (is the loop actually working?)
- [ ] Graceful shutdown (don't leave zombies)

### Pillar 3: Success Metrics

**Measure Outcomes, Not Activity:**

| Metric | Success Threshold | How to Measure |
|--------|-------------------|----------------|
| Commits | ≥ 1 | `git log --since="21:00" --until="08:00" --oneline` |
| Files Created | ≥ 1 | `git diff --name-only HEAD~1` |
| PR Created | ≥ 0 | GitHub API check |
| Verification Run | ≥ 1 | Log analysis |
| Log Size | < 50KB | `ls -l *.log` |

**Morning Dashboard:**
```bash
#!/bin/bash
echo "=== Claude Hours Morning Report ==="
echo "Commits: $(git log --since='21:00' --until='08:00' --oneline | wc -l)"
echo "Files Changed: $(git diff --name-only HEAD~1 | wc -l)"
echo "Log Size: $(ls -l .claude/logs/autonomous-loop.log | awk '{print $5}')"
echo "Notifications Sent: $(wc -l < .claude/logs/notifier.log)"
```

### Pillar 4: Fail-Fast Behavior

**Don't Spin, Report:**

```
IF task is failing after 3 attempts:
  → Log failure details
  → Create MISS entry
  → Send alert (one-time)
  → Halt system
  → Wait for human intervention
  
DON'T:
  → Loop endlessly
  → Generate log spam
  → Send notification spam
  → Make up "work"
```

### Pillar 5: Human Handoff Protocol

**Before Bed (Jae):**
- [ ] Define task in `tasks/nightly-build.md`
- [ ] Ensure acceptance criteria are clear
- [ ] Set reasonable expectations (one task, not five)
- [ ] Verify task is feasible (not "write a novel")

**Morning Review (Claude):**
- [ ] Run morning dashboard
- [ ] If work done: Link PR, summarize changes
- [ ] If no work: Explain why, suggest next steps
- [ ] Update `memory/nightly-builds.md`

---

## Implementation Roadmap

### Phase 1: Safety (DONE ✅)
- [x] Circuit breaker
- [x] Rate limiting
- [x] Remove cron conflict
- [x] Fix resource monitor

### Phase 2: Task Discipline (IN PROGRESS)
- [ ] Create `tasks/nightly-build.md` template
- [ ] Add morning dashboard script
- [ ] Define task for next Claude Hours

### Phase 3: Success Metrics (NEXT)
- [ ] Add `claude-hours-report.sh` script
- [ ] Track: commits, files, PRs, verification
- [ ] Alert if success metrics < threshold

### Phase 4: Process Hardening
- [ ] Single process enforcement
- [ ] Health check endpoint
- [ ] Graceful shutdown

---

## Next Claude Hours Task

**To be defined by Jae in `tasks/nightly-build.md`:**

```markdown
## 2026-01-31

**Task:** [ONE TASK - SPECIFIC]

**Goal:** 
**Why:** 
**Acceptance Criteria:**
- [ ] 
- [ ] 

**Verification:**
```

---

## Key Learnings

1. **Autonomy ≠ No Structure** - Clear rules enable better autonomous decisions
2. **Task Clarity > Clever Code** - 01-29 worked because task was clear, not because code was sophisticated
3. **Measure Outcomes** - "Cycles run" is a vanity metric; "commits created" is a vanity metric; "PRs merged" is the real metric
4. **Fail Fast, Report Clearly** - Spinning for 8 hours with 326KB of logs is worse than failing after 30 minutes with a clear error message
5. **Notifications are Signal** - 30 notifications becomes noise; 1 notification with "Task Failed" is signal

---

## Success Criteria for Next Night

| Metric | Target | Actual (Next Night) |
|--------|--------|---------------------|
| Commits | ≥ 1 | ? |
| Log Size | < 50KB | ? |
| Notifications | ≤ 3 | ? |
| PR Created | ≥ 0 | ? |
| Verification Run | ≥ 1 | ? |

---

**Document Version:** 1.0  
**Created:** 2026-01-30 08:15 CST  
**Next Review:** After next Claude Hours session
