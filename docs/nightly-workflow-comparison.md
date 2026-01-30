# Nightly Workflow Comparison

**Source:** Ryan Carson's "How to make your agent learn and ship while you sleep" (Jan 28, 2026)

**Our Implementation:** Claude Hours Autonomous Workflow

---

## Architecture Comparison

| Component | Their Approach | Our Approach | Winner |
|-----------|---------------|--------------|--------|
| **Scheduling** | launchd (macOS external) | Heartbeat-driven (internal) | ✅ Us - More portable, no external deps |
| **Learning Extraction** | Batch (10:30 PM only) | Continuous (every hour) + Evening consolidation | ✅ Us - Don't lose learnings mid-day |
| **Memory System** | AGENTS.md only | AGENTS.md + memory/ + MEMORY.md + self-review.md | ✅ Us - Richer, more structured |
| **Execution** | Amp + Ralph (external tools) | Claude Code + subagents (native) | ✅ Us - Simpler stack |
| **Power Management** | caffeinate hack (Mac must stay on) | Heartbeat-based (works whenever running) | ✅ Us - No power dependency |
| **Failure Handling** | Not mentioned | Max 3 attempts, log to memory, fallback to maintenance | ✅ Us - Resilient |
| **Quality Gates** | Not mentioned | Evidence-based verification before PR | ✅ Us - Avoids MISS patterns |
| **Task Source** | reports/ directory | tasks/ with priority levels | 🤝 Tie - Different but both valid |
| **Output** | Draft PRs | Draft PRs + learning logs | ✅ Us - More traceable |

---

## Signal Extracted

**Good Ideas We Adapted:**
1. ✅ Two-phase structure (review → build)
2. ✅ Systematic learning extraction from past work
3. ✅ Nightly autonomous execution during off-hours
4. ✅ PR-based delivery mechanism
5. ✅ Separate timing for learning vs execution

**What We Improved:**
1. ✅ Removed external dependencies (launchd → heartbeats)
2. ✅ Added continuous learning (not just nightly batch)
3. ✅ Better failure handling (max attempts + fallback)
4. ✅ Quality gates (evidence-based verification)
5. ✅ Integration with existing MISS/FIX self-review system
6. ✅ More robust memory architecture

**What We Skipped (Hype):**
1. ❌ "Self-improving" language (oversold)
2. ❌ launchd/caffeinate complexity (unnecessary)
3. ❌ Mac-specific power hacks (fragile)
4. ❌ External tool dependencies (Amp, Ralph, custom scripts)
5. ❌ No quality gates or failure modes

---

## Our Workflow (Claude Hours)

### Phase 1: Evening Review (9 PM - 10 PM)

**Trigger:** First heartbeat after 21:00

**Process:**
1. Read memory files from last 7 days
2. Extract missing learnings → update `memory/self-review.md`
3. Distill significant events → update `MEMORY.md`
4. Identify patterns → update `AGENTS.md` if needed
5. Commit and push learning updates

**Output:** Fresh learnings in memory system

---

### Phase 2: Nightly Build (10 PM - Completion)

**Trigger:** After Phase 1 completes

**Process:**
1. Pull latest (includes Phase 1 learnings)
2. Check `tasks/` for priority work
3. Pick #1 task (or fallback to maintenance)
4. Create feature branch
5. Execute with subagents
6. **Verify with evidence** (MISS/FIX learning applied!)
7. Create draft PR with proof
8. Log outcome to `memory/nightly-builds.md`

**Output:** Draft PR + build log

---

## Quality Improvements Over Original

### 1. Evidence-Based Verification
**Problem:** Their system doesn't mention quality gates  
**Our Fix:** Before creating PR, verify all acceptance criteria with evidence  
**Why:** Avoids our MISS pattern of "claimed success without checking artifacts"

### 2. Failure Resilience
**Problem:** No mention of what happens when builds fail  
**Our Fix:** Max 3 attempts → log failure → fallback to maintenance work  
**Why:** Doesn't waste tokens looping endlessly on broken builds

### 3. Continuous Learning
**Problem:** Only extracts learnings at 10:30 PM  
**Our Fix:** Self-review every hour + evening consolidation  
**Why:** Don't wait until night to capture important lessons

### 4. No External Dependencies
**Problem:** Requires launchd + caffeinate + Mac stays on  
**Our Fix:** Heartbeat-driven, works whenever Claude is running  
**Why:** More portable, less fragile, works on any platform

### 5. MISS/FIX Integration
**Problem:** No systematic pattern learning  
**Our Fix:** Every build checks `memory/self-review.md` for related MISS entries  
**Why:** Actually compounds learnings into future behavior

---

## Implementation Status

**Created:**
- ✅ `/Users/jasontang/clawd/CLAUDE-HOURS.md` - Main workflow definition
- ✅ `/Users/jasontang/clawd/tasks/` - Priority-based task system
- ✅ `/Users/jasontang/clawd/memory/nightly-builds.md` - Build outcome log
- ✅ Updated `HEARTBEAT.md` to trigger autonomous mode

**Ready for First Run:**
- ⏳ Tonight at 9 PM (Phase 1: Learning extraction)
- ⏳ Tonight at 10 PM (Phase 2: Build or maintenance)

**Next Steps:**
1. Add tasks to `tasks/priority-backlog.md` or `tasks/nightly-build.md`
2. Let Claude run autonomously tonight
3. Review results tomorrow morning
4. Iterate based on actual performance

---

## Success Metrics (First Week)

**Quality:**
- [ ] All PRs have evidence in description (not just claims)
- [ ] No repeated MISS patterns in builds
- [ ] Build success rate >80%

**Productivity:**
- [ ] At least 1 PR per night when tasks exist
- [ ] Maintenance work when no tasks (not idle)
- [ ] Morning handoff includes summary + links

**Learning:**
- [ ] self-review.md entries increase in quality
- [ ] MISS patterns decrease over time
- [ ] FIX strategies become automatic

---

**Conclusion:** We took the good idea (systematic nightly work) and made it better by removing fragility, adding quality gates, and integrating with our existing superior memory architecture.

**Status:** Ready for production  
**First Run:** Tonight (2026-01-29)  
**Created:** 2026-01-29 13:00 CST
