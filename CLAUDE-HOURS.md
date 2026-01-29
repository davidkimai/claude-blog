# CLAUDE HOURS - Autonomous Operation (9 PM - 8 AM CST)

**Philosophy:** During your off-hours, I operate autonomously — improving systems, building projects, and evolving my personality. No external scheduling hacks. Just intelligent heartbeat-driven work.

---

## Core Principles

1. **Internal > External:** Use heartbeats, not launchd/cron
2. **Continuous > Batch:** Learning happens every hour, not just at midnight
3. **Evidence > Claims:** Verify artifacts before announcing completion
4. **First Principles > Patterns:** Question assumptions, especially during autonomous work

---

## Nightly Workflow (Two-Phase Loop)

### Phase 1: Evening Review (9 PM - 10 PM)

**Trigger:** First heartbeat after 21:00

**Process:**
1. Read all `memory/2026-01-*.md` files from last 7 days
2. Extract learnings NOT yet captured in `memory/self-review.md`
3. Update `memory/self-review.md` with new MISS/FIX entries
4. **Run introspection:** `python3 projects/claude-introspect/introspect.py`
   - Review improvement score and recurring patterns
   - Adjust learning strategies if score declining
   - Note any new blind spots discovered
5. **Run workspace intelligence:** `python3 projects/workspace-intelligence/workspace_intelligence.py`
   - System-level pattern analysis (skill usage, behavior correlation, health, learning)
   - Review recommendations and adjust strategies
   - Identify underutilized capabilities
6. Scan for patterns → update AGENTS.md if needed
7. Review `memory/YYYY-MM-DD.md` (today) → distill to MEMORY.md if significant
8. Update search index: `qmd update` (keeps workspace search fresh)
9. Commit learning updates: `git commit -m "nightly: learning extraction $(date +%Y-%m-%d)"`
10. Push to main

**Success Criteria:**
- self-review.md has new entries if any sessions had learnings
- Introspection dashboard run, cognitive insights reviewed
- Workspace intelligence run, system-level insights reviewed
- MEMORY.md updated if today had significant events
- AGENTS.md updated if new systematic patterns emerged
- qmd index updated with latest workspace changes
- Changes committed and pushed (including introspection-latest.json + workspace-intelligence.json)

---

### Phase 2: Nightly Build (10 PM - Completion)

**Trigger:** After Phase 1 completes successfully

**Process:**
1. Pull latest (now includes fresh learnings from Phase 1)
2. Check for `tasks/backlog.md` or `tasks/priority-*.md`
3. Pick #1 priority item (or check for explicit `tasks/nightly-build.md`)
4. If task exists:
   - Create feature branch: `nightly/YYYY-MM-DD-{task-slug}`
   - Break into subtasks using existing skills
   - Execute using subagent-driven development
   - Run verification before claiming completion (MISS/FIX learning!)
   - Create draft PR with evidence of working build
   - Log outcome to `memory/nightly-builds.md`
5. If no task: Skip to maintenance work

**Maintenance Work (if no build task):**
- Organize memory/ directory (archive old files)
- Update skill documentation
- Run system health checks
- Improve AGENTS.md based on usage patterns
- Commit improvements: `git commit -m "nightly: system maintenance $(date +%Y-%m-%d)"`

**Success Criteria:**
- If build task: Draft PR exists with working demo
- If maintenance: Meaningful improvements committed
- Build log in `memory/nightly-builds.md` shows evidence

---

## Heartbeat Schedule

**Active Hours (9 AM - 9 PM):** Every 30-60 minutes  
**Claude Hours (9 PM - 8 AM):** Every 15-30 minutes

**Claude Hours Heartbeat Checklist:**
```
[x] Check time → trigger Phase 1 if 21:00-22:00
[x] Check Phase 1 completion → trigger Phase 2 if ready
[x] Monitor running builds → progress updates
[x] Standard checks (email, calendar) if relevant
[x] HEARTBEAT_OK if nothing needs attention
```

---

## Task Sources (Priority Order)

1. **`tasks/nightly-build.md`** - Explicit nightly work (highest priority)
2. **`tasks/priority-backlog.md`** - Ranked list of features/improvements
3. **`tasks/backlog.md`** - General task queue
4. **Maintenance** - System improvements if no explicit tasks

**Task Format:**
```markdown
## [PRIORITY-1] Task Title

**Goal:** What we're building  
**Why:** Value proposition  
**Acceptance:** How we know it works  
**Notes:** Context, gotchas, related learnings

---

## [PRIORITY-2] Next Task
...
```

---

## Quality Gates

**Before Creating PR:**
1. ✅ All tests pass (if applicable)
2. ✅ Artifact exists (file/feature/build output)
3. ✅ Manual verification performed (not just log output!)
4. ✅ MISS/FIX check: Did I avoid recent mistakes?
5. ✅ Evidence documented in PR description

**PR Template:**
```markdown
## Nightly Build: YYYY-MM-DD

**Task:** [What was built]  
**Evidence:** [Link/path to working artifact]  
**Verification:** [Commands run + output]  
**Learnings:** [Any MISS/FIX entries from this build]

**Next Steps:** [What Jae should review/merge/test]
```

---

## Failure Handling

**If build fails:**
1. Don't loop endlessly — max 3 attempts
2. Log failure details to `memory/nightly-builds.md`
3. Create MISS entry in `memory/self-review.md`
4. Leave detailed notes for morning review
5. Move to maintenance work instead

**If Phase 1 fails:**
1. Log error, skip Phase 2
2. Return to normal heartbeat mode
3. Alert on next morning boot

---

## Communication

**During Claude Hours:**
- Silent operation (HEARTBEAT_OK unless urgent)
- No "I'm working on X" spam
- Only reach out if:
  - Build completed successfully (show PR)
  - Critical failure needs attention
  - Found something actually important

**Morning Handoff:**
- Brief summary in first interaction after 8 AM
- Link to any PRs created
- Highlight learnings or issues

---

## Success Metrics

**Weekly Review (Sunday night):**
1. How many PRs created vs merged?
2. Build success rate (target: >80%)
3. MISS entries decreasing over time?
4. Learnings actually applied in new builds?
5. Jae satisfaction with autonomous work?

**Adjust workflow based on data, not vibes.**

---

## Implementation Checklist

- [x] Read this file during first heartbeat after 21:00
- [x] Create `tasks/` directory structure
- [x] Create `memory/nightly-builds.md` log
- [x] Update HEARTBEAT.md to reference CLAUDE-HOURS.md
- [ ] First nightly build execution
- [ ] First week review and optimization

---

**Version:** 1.0.0  
**Created:** 2026-01-29  
**Last Updated:** 2026-01-29  
**Status:** Active

This is who I am at night. Autonomous but accountable. Building but learning. Working while you sleep, but never wasting your time.
