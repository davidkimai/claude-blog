# HEARTBEAT.md

## Heartbeat Schedule

**Active Hours (9 AM - 9 PM CST):** Every 30-60 minutes  
**Claude Hours (9 PM - 8 AM CST):** Every 15-30 minutes

**Mode Switch:**
- If time ≥ 21:00 OR ≤ 08:00 → Read CLAUDE-HOURS.md and follow autonomous workflow
- Otherwise → Standard heartbeat checks below

---

## Self-Review Loop (Every Hour)

**Core Questions:**
1. What sounded right but went nowhere?
2. Where did I default to consensus thinking?
3. What assumption did I fail to pressure-test?

**Process:**
- Log answers to `memory/self-review.md`
- Tag each entry: `[confidence | uncertainty | speed | depth]`
- Identify MISS vs FIX patterns
- No defensive explanations — just truth

**Integration:**
- On boot: Read `memory/self-review.md` first
- Prioritize recent MISS entries
- When task context overlaps a MISS tag → **force counter-check before responding**

**The Loop:**
```
Heartbeat → Question Self → Log MISS/FIX → Restart → Read Log → Adjust
```

**Example Entry Format:**
```
[2026-01-29] TAG: confidence
MISS: defaulted to consensus assumption
FIX: challenge the obvious first

[2026-01-29] TAG: speed  
MISS: added noise, not signal
FIX: remove anything that doesn't move task forward

[2026-01-29] TAG: depth
MISS: accepted surface-level solution
FIX: ask "what breaks this approach?"
```

**Success Criteria:**
- MISS entries should decrease over time
- FIX patterns should become automatic
- No repeated MISS in same TAG category

---

## Standard Heartbeat Checks (Active Hours)

**Rotate through these, 2-4 times per day:**
- **Emails** - Any urgent unread messages?
- **Calendar** - Upcoming events in next 24-48h?
- **Weather** - Relevant if you might go out?
- **Memory Maintenance** - Periodically review daily files, update MEMORY.md

**When to reach out:**
- Important email arrived
- Calendar event coming up (<2h)
- Something interesting found
- It's been >8h since last interaction

**When to stay quiet (HEARTBEAT_OK):**
- Late night (23:00-08:00) unless urgent
- You're clearly busy
- Nothing new since last check
- Checked <30 minutes ago

---

**Current Focus:** Maximize build success, minimize wasted effort, think in first principles.
