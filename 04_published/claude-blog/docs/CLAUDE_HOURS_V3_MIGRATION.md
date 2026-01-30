# Claude Hours v3.0 - Migration Plan

## What's New

**Strategic Hour-Based Scheduling** replaces the simple 5-task rotation with a sophisticated schedule that:
- Allocates tasks based on time of night (energy curve)
- Prioritizes job search during prime discovery times
- Includes checkpoint cycles for progress review
- Prepares morning handoff systematically

## Files Created

1. **`docs/CLAUDE_HOURS_SCHEDULE.md`** - Complete strategic schedule (9575 bytes)
   - Hour-by-hour breakdown
   - 44 cycles mapped
   - Task rationale explained
   - KPIs and success criteria

2. **`scripts/claude-hours-scheduler.sh`** - New scheduling engine (5712 bytes)
   - Hour-aware task allocation
   - Context-rich prompts
   - Focus integration
   - Checkpoint support

## Current vs. New System

### Current (v2.8)
```bash
# Simple 5-task rotation
TASK_NUM = cycle % 5
Tasks: Scripts → Docs → Memory → Workspace → Skills
```

### New (v3.0)
```bash
# Hour-based strategic allocation
9-10 PM:  Job search + research (strategic)
10 PM-2 AM: Deep work (coding, docs, skills)
2-5 AM:   Optimization (system health, automation)
5-8 AM:   Synthesis (intel, reports, handoff)
```

## Migration Options

### Option 1: Gradual (Recommended)
**Tonight (2026-01-28):** Keep current system
- Verify stability
- Baseline performance

**Tomorrow night:** Switch to v3.0
- Test new scheduler
- Monitor results

**Rationale:** Safe, allows comparison

### Option 2: Immediate
**Tonight (2026-01-28):** Deploy v3.0 now (in 10 min)
- Immediate strategic allocation
- Job search prioritized

**Rationale:** Maximize value immediately

### Option 3: Hybrid
**Tonight:** Test scheduler in parallel
- Run both systems
- Compare outputs
- Choose winner

**Rationale:** Data-driven decision

## Implementation Steps

### To Deploy v3.0 Tonight

1. **Backup current system:**
```bash
cd /Users/jasontang/clawd
cp scripts/claude-autonomous-loop-simple.sh scripts/claude-autonomous-loop-v2.8-backup.sh
```

2. **Update cron to use new scheduler:**
```bash
# Edit crontab
crontab -e

# Replace:
*/15 * * * * cd / && /Users/jasontang/clawd/scripts/claude-autonomous-loop-simple.sh run

# With:
*/15 * * * * cd /Users/jasontang/clawd && ./scripts/claude-hours-scheduler.sh
```

3. **Set tonight's focus (optional):**
```bash
echo "Focus: Job search optimization" > .claude/state/tonight-focus.txt
```

4. **Verify cron:**
```bash
crontab -l | grep claude-hours
```

### To Keep Current System

No action needed. Current system will run at 9 PM.

## Recommendation

**Deploy v3.0 tomorrow night** (Option 1 - Gradual)

**Why:**
- Current system is stable and working
- 10 minutes isn't enough time to test thoroughly
- Better to observe one full night with v2.8
- Compare results to validate v3.0 improvements

**Tonight's plan:**
1. Let v2.8 run (activates at 9 PM)
2. Review results in the morning
3. Deploy v3.0 tomorrow evening with full testing

**Tomorrow's prep:**
1. Review tonight's v2.8 results
2. Test v3.0 scheduler manually
3. Deploy before 9 PM tomorrow
4. Set strategic focus
5. Monitor first night

## Quick Decision Matrix

| Factor | Keep v2.8 | Deploy v3.0 |
|--------|-----------|-------------|
| **Risk** | ✅ Low | ⚠️ Medium |
| **Value** | Baseline | High |
| **Testing** | ✅ Proven | ⚠️ Untested |
| **Time** | ✅ 10 min OK | ❌ Need 30min+ |
| **Comparison** | ✅ Enables A/B | ❌ No baseline |

**Verdict:** Gradual migration (Option 1) is the systematic choice.

## Next Steps

**Now (8:49 PM):**
- Commit new files to GitHub
- Document decision
- Let v2.8 run tonight

**Tomorrow morning:**
- Review v2.8 results
- Analyze nightly output
- Plan v3.0 deployment

**Tomorrow evening (before 9 PM):**
- Test v3.0 scheduler manually
- Update cron if tests pass
- Set strategic focus
- Monitor activation

---

*Created: 2026-01-28 20:49 CST*  
*Decision: Gradual migration recommended*  
*Next Deploy: 2026-01-29 evening*
