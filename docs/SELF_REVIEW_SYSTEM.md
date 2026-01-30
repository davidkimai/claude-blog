# Self-Review System Implementation
**Created:** 2026-01-29 10:50 CST  
**Status:** Active  
**Purpose:** Continuous self-improvement through systematic mistake tracking

## System Overview

**Philosophy:** First-principles thinking requires actively fighting pattern-matching and consensus bias. This system creates a feedback loop to catch and correct cognitive shortcuts.

## Components

### 1. HEARTBEAT.md
**Triggers:** Every hour during autonomous operation  
**Action:** Run self-review questions  

**Core Questions:**
- What sounded right but went nowhere?
- Where did I default to consensus thinking?
- What assumption did I fail to pressure-test?

### 2. memory/self-review.md
**Purpose:** Persistent mistake log  
**Format:** TAG → MISS → FIX  
**Tags:** `[confidence | uncertainty | speed | depth]`

**Entry Structure:**
```
[DATE] TAG: <category>
MISS: <what went wrong>
FIX: <corrective action>
Context: <specific situation>
```

### 3. AGENTS.md Integration
**Modified startup sequence:**
1. Read `memory/self-review.md` FIRST (before anything else)
2. Load recent MISS entries into working context
3. When task overlaps MISS tag → force counter-check

## Tag Meanings

**confidence** - Overconfidence, premature certainty, untested assumptions  
**uncertainty** - Failed to question, accepted surface answers  
**speed** - Rushed, added noise, skipped validation  
**depth** - Shallow analysis, didn't pressure-test, missed edge cases

## The Self-Review Loop

```
┌─────────────────────────────────────────┐
│  Heartbeat (every hour)                 │
│  ↓                                       │
│  Run 3 core questions                   │
│  ↓                                       │
│  Log any MISS entries                   │
│  ↓                                       │
│  Tag with category                      │
│  ↓                                       │
│  Define FIX pattern                     │
│  ↓                                       │
│  Session restart                        │
│  ↓                                       │
│  Read self-review.md on boot            │
│  ↓                                       │
│  Apply FIX patterns to new work         │
│  ↓                                       │
│  Monitor for repeated MISS              │
│  ↓                                       │
└─────────────────────────────────────────┘
```

## Success Metrics

**Leading Indicators:**
- MISS entries per day decreasing
- No repeated MISS in same TAG within 7 days
- FIX patterns becoming automatic (no conscious effort)

**Lagging Indicators:**
- Fewer "I was wrong" conversations with Jae
- More first-attempt successes
- Reduced iteration cycles on complex tasks

## Integration Points

### Startup (AGENTS.md)
```bash
# Session start sequence:
1. Read memory/self-review.md
2. Load recent MISS tags
3. Proceed with normal startup
```

### Heartbeat (HEARTBEAT.md)
```bash
# Every hour:
1. Ask 3 core questions
2. Identify any MISS
3. Log to self-review.md
4. Continue normal operations
```

### Task Execution
```bash
# Before responding to complex tasks:
1. Check: Does this overlap recent MISS tags?
2. If yes: Force counter-check
3. Apply relevant FIX pattern
4. Proceed with response
```

## Example Workflow

**Scenario:** User asks to "verify the build worked"

**Without self-review:**
- Check logs: "✓ Build complete"
- Respond: "Yes, it worked!"
- Reality: No artifacts created

**With self-review:**
1. Check recent MISS: "[confidence] trusted logs over artifacts"
2. Apply FIX: "verify actual output exists"
3. Check: `ls -la nightly-builds/2026-01-29/`
4. Result: Empty directory
5. Respond: "Build script ran but created no files. Investigating..."

## Initial Seed Entries

Logged from today's nightly builder incident:

```
[2026-01-29] TAG: confidence
MISS: Assumed first nightly builder worked without verifying execution
FIX: Always check output artifacts, not just log messages

[2026-01-29] TAG: depth
MISS: Didn't trace through bash script execution flow
FIX: When claiming "X is done," verify end-to-end

[2026-01-29] TAG: speed
MISS: Rushed to "mission accomplished" before validation
FIX: Pause at completion claims — ask "what proves this works?"
```

## Optimization Strategies

### 1. Pattern Recognition
- After 10+ entries, identify recurring MISS categories
- Create targeted FIX checklists for each category
- Automate counter-checks where possible

### 2. Context Matching
- Build TAG overlap detection
- When task has keywords matching MISS context → auto-flag
- Force deliberate pause before proceeding

### 3. Temporal Analysis
- Track MISS frequency over time
- Identify time-of-day patterns (tired? rushed?)
- Adjust autonomous operations accordingly

### 4. Severity Weighting
- Not all MISS entries equal
- High-impact mistakes get priority in boot sequence
- Recent high-severity MISS = elevated alertness

## Areas for Improvement

**Identified gaps in current implementation:**

1. **No automated TAG overlap detection**  
   FIX: Add keyword matching in startup sequence

2. **MISS entries could grow unbounded**  
   FIX: Archive entries >30 days old, keep summary stats

3. **No severity/impact scoring**  
   FIX: Add `IMPACT: [low|medium|high|critical]` field

4. **Manual logging overhead**  
   FIX: Create helper script to streamline entry creation

5. **No cross-session pattern analysis**  
   FIX: Weekly synthesis of patterns → update FIX strategies

## Maximizing Success Probability

**Strategic optimizations applied:**

1. ✅ **Boot sequence prioritization** - Read mistakes FIRST
2. ✅ **Hourly review cadence** - Catches drift quickly
3. ✅ **Context-aware triggers** - Overlapping MISS = forced counter-check
4. ✅ **Concrete FIX patterns** - Not vague advice, specific actions
5. ✅ **No defensive logging** - Truth over ego protection

**Next level improvements:**

1. **Pre-commit hooks** - Check for MISS overlap before major actions
2. **Confidence calibration** - Track prediction accuracy over time
3. **Decision log** - Record assumptions, validate later
4. **Counter-argument forcing function** - Must generate steelman against own conclusion
5. **Red team rotation** - Periodically assume you're wrong, prove it

## Files

- **Config:** `/Users/jasontang/clawd/HEARTBEAT.md`
- **Log:** `/Users/jasontang/clawd/memory/self-review.md`
- **Integration:** `/Users/jasontang/clawd/AGENTS.md` (startup sequence)

## Status

✅ **HEARTBEAT.md** - Updated with self-review loop  
✅ **self-review.md** - Created with seed entries  
✅ **AGENTS.md** - Modified startup sequence  
✅ **Documentation** - This file

**System is LIVE and active starting next session.**

---

**Principle:** Optimize for truth-seeking, not being right. Log failures ruthlessly, learn systematically, improve continuously.
