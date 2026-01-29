# Tasks Directory

**Purpose:** Central location for prioritized work items that Claude can autonomously execute during Claude Hours (9 PM - 8 AM CST).

---

## File Structure

```
tasks/
├── README.md              ← You are here
├── nightly-build.md       ← Explicit nightly work (PRIORITY-1)
├── priority-backlog.md    ← Ranked feature list (PRIORITY-2)
├── backlog.md             ← General task queue (PRIORITY-3)
└── completed/             ← Archived completed tasks
```

---

## Priority Levels

### 🔴 PRIORITY-1: `nightly-build.md`
- **When to use:** Single most important task for tonight's build
- **Format:** One task only, replace when completed
- **Execution:** Every night during Claude Hours Phase 2

### 🟡 PRIORITY-2: `priority-backlog.md`
- **When to use:** Ranked list of important features/improvements
- **Format:** Multiple tasks, ordered by priority
- **Execution:** Claude picks #1 if `nightly-build.md` doesn't exist

### 🟢 PRIORITY-3: `backlog.md`
- **When to use:** General improvements, nice-to-haves, ideas
- **Format:** Unordered or loosely ordered
- **Execution:** Rarely (only if no higher priority work exists)

---

## Task Format Template

```markdown
## [PRIORITY-{1|2|3}] Task Title

**Goal:** What we're building (1-2 sentences)

**Why:** Value proposition / problem being solved

**Acceptance Criteria:**
- [ ] Specific testable condition 1
- [ ] Specific testable condition 2
- [ ] Specific testable condition 3

**Context:**
- Related files/systems
- Past attempts or learnings
- Known gotchas (check memory/self-review.md!)

**Verification:**
How to prove this actually works (commands to run, artifacts to check)

---
```

---

## Workflow

### Adding Tasks (You, Jae)
1. Create or edit appropriate priority file
2. Use template above
3. Include enough context for autonomous execution
4. Specify clear acceptance criteria
5. Note any relevant past failures (check `memory/self-review.md`)

### Executing Tasks (Claude, Autonomous)
1. Read task during Phase 2 of Claude Hours
2. Create feature branch: `nightly/YYYY-MM-DD-{task-slug}`
3. Break into subtasks
4. Execute with subagent-driven development
5. Verify against acceptance criteria (EVIDENCE > CLAIMS!)
6. Create draft PR with verification proof
7. Move completed task to `completed/YYYY-MM-DD-{task}.md`
8. Log outcome to `memory/nightly-builds.md`

---

## Best Practices

**For Jae:**
- Write tasks like you're delegating to a smart but literal engineer
- Include examples if the task is ambiguous
- Reference relevant files/systems
- Note any time constraints or dependencies
- Check `memory/self-review.md` for related past failures

**For Claude:**
- Read the ENTIRE task before starting
- Check `memory/self-review.md` for related MISS entries
- Break down into subtasks first
- Verify each acceptance criterion with evidence
- Don't claim completion without proof (THE RULE!)
- Document learnings in `memory/self-review.md` if you hit issues

---

## Current Status

**Active Tasks:** 0  
**Completed (All Time):** 0  
**Success Rate:** N/A (First build pending)

**Last Updated:** 2026-01-29  
**Next Build:** Tonight at 10 PM CST
