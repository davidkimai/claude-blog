# Priority Backlog

**Purpose:** Ranked list of important features and improvements for autonomous execution.

**Last Updated:** 2026-01-30

---

## [PRIORITY-1] Fix Autonomous Loop State Management

**Goal:** Prevent death spiral by adding proper state file locking and cycle validation

**Why:** Last night 10+ processes ran simultaneously, logs grew to 326KB, no work accomplished

**Acceptance Criteria:**
- [ ] Only one autonomous-loop process runs at a time
- [ ] State file locking prevents race conditions
- [ ] Dead processes are detected and cleaned up
- [ ] Log file rotation prevents unbounded growth

**Context:**
- See memory/self-review.md for 2026-01-30 MISS/FIX entries
- watchdog.log shows "Too many restarts [25/10]"
- autonomous-loop.log has 326KB of spam

**Verification:**
```bash
# Check for multiple processes
ps aux | grep "autonomous-loop-v3" | grep -v grep | wc -l
# Should return 1 or 0

# Check state file exists
cat /Users/jasontang/clawd/.claude/state/cycle.txt
```

---

## [PRIORITY-2] Implement Claude Hours Success Metrics

**Goal:** Track actual work accomplished, not just process activity

**Why:** Last night showed 20+ cycles but zero commits - need to measure outcomes not activity

**Acceptance Criteria:**
- [ ] Track commits, PRs, and file changes per night
- [ ] Dashboard showing: cycles run vs work produced
- [ ] Alert if work accomplished < threshold

**Verification:**
```bash
# Test metrics script
./scripts/claude-hours-usage-monitor.sh
```

---

## Instructions for Adding Tasks

Replace this section with your prioritized tasks. Use the template above. Order matters - #1 gets built first.

Delete this instructions block once you add real tasks.
