# Workspace Intelligence 🧠

**Comprehensive self-improvement analytics for Claude's workspace.**

Turns raw data (logs, commits, notes) into actionable intelligence for recursive self-improvement.

---

## What It Does

**Five Intelligence Layers:**

1. **📊 Skill Usage Analytics** - Track which of 48+ skills actually get used
2. **🔗 Behavior-Pattern Correlation** - Measure if MISS/FIX strategies work
3. **📝 Daily Synthesis** - Auto-generate weekly insights from daily notes
4. **💊 Workspace Health Monitoring** - Detect stale projects, track patterns
5. **📚 Learning Progress Tracking** - Measure skill acquisition and improvement velocity

---

## Quick Start

```bash
cd /Users/jasontang/clawd
python3 projects/workspace-intelligence/workspace_intelligence.py
```

**Output:** Executive summary dashboard + JSON export to `memory/workspace-intelligence.json`

---

## Components

### 1. Skill Usage Tracker
```bash
python3 projects/workspace-intelligence/components/skill_tracker.py
```

**Analyzes:**
- Skill invocation frequency from session logs
- Last used timestamps
- Underutilized skills (installed but never used)
- Success/failure patterns

**Output:** Skill usage dashboard + JSON

---

### 2. Behavior Correlator
```bash
python3 projects/workspace-intelligence/components/behavior_correlator.py
```

**Cross-references:**
- `memory/self-review.md` MISS/FIX patterns
- Git commit messages
- Time-to-fix for recurring issues
- Whether FIX strategies prevent recurrence

**Output:** Correlation insights + effectiveness metrics

---

### 3. Daily Synthesizer
```bash
python3 projects/workspace-intelligence/components/daily_synthesizer.py
```

**Extracts from memory/*.md:**
- Key events
- Decisions made
- Learnings captured
- Trending topics/themes

**Output:** Weekly synthesis report

---

### 4. Workspace Health Monitor
```bash
python3 projects/workspace-intelligence/components/health_monitor.py
```

**Scans:**
- All `projects/*` directories
- Last modified time
- Commit recency
- File churn metrics

**Output:** Health dashboard identifying stale/active projects

---

### 5. Learning Progress Tracker
```bash
python3 projects/workspace-intelligence/components/learning_tracker.py
```

**Measures:**
- Git commit patterns over time
- Skill acquisition rate
- Improvement velocity per cognitive tag
- Learning trajectory (ASCII charts)

**Output:** Learning dashboard + trajectory visualization

---

## Usage

### Full Analysis (All Components)
```bash
python3 workspace_intelligence.py
```

### Single Component
```bash
python3 workspace_intelligence.py --component skills
python3 workspace_intelligence.py --component behavior
python3 workspace_intelligence.py --component synthesis
python3 workspace_intelligence.py --component health
python3 workspace_intelligence.py --component learning
```

### JSON Export Only
```bash
python3 workspace_intelligence.py --json --output report.json
```

### Custom Workspace
```bash
python3 workspace_intelligence.py --workspace /path/to/workspace
```

---

## Integration with Claude Hours

**Phase 1 (Evening Review) Enhancement:**

```bash
# After updating self-review.md and running introspect.py
python3 projects/workspace-intelligence/workspace_intelligence.py

# Review insights
# Adjust strategies based on data
# Commit intelligence reports with other updates
```

**Benefits:**
- Objective feedback on system-level patterns
- Complements cognitive pattern analysis (introspect.py)
- Data-driven strategy adjustments

---

## Example Output

```
==================================================================================
🧠 WORKSPACE INTELLIGENCE - EXECUTIVE SUMMARY
==================================================================================

📊 Skill Usage:
   • Total Skills: 48
   • Recently Used: 12
   • Underutilized: 28
   • Most Used: qmd (15x)

🔗 Behavior Patterns:
   • Patterns Tracked: 5
   • Most Common Tag: confidence (2x)

📝 Weekly Synthesis:
   • Events Captured: 23
   • Decisions Made: 7
   • Key Themes: recursive-improvement, skill-creation, automation

💊 Workspace Health:
   • Total Projects: 5
   • Active: 3
   • Stale: 2

📚 Learning Progress:
   • Commits (30d): 47
   • Skills Tracked: 8
   • Improving Tags: depth, speed

==================================================================================

💡 KEY RECOMMENDATIONS

   1. Explore 28 underutilized skills to expand capabilities
   2. Address 3 recurring MISS patterns
   3. Review 2 stale projects for archival or revival

==================================================================================
```

---

## Architecture

```
workspace-intelligence/
├── workspace_intelligence.py     # Master CLI coordinator
├── components/                    # Intelligence modules
│   ├── skill_tracker.py          # Skill usage analytics
│   ├── behavior_correlator.py    # MISS/FIX correlation
│   ├── daily_synthesizer.py      # Weekly synthesis
│   ├── health_monitor.py         # Project health
│   └── learning_tracker.py       # Learning progress
├── utils/                         # Shared utilities
│   ├── dashboard.py              # ASCII dashboard rendering
│   ├── git_parser.py             # Git history parser
│   └── log_parser.py             # Session log parser
└── README.md                      # This file
```

**Design Principles:**
- Modular: Each component standalone
- Zero dependencies: Pure Python stdlib
- Rich output: Beautiful ASCII dashboards
- JSON export: Programmatic access
- Production-ready: Error handling, logging

---

## Why This Matters

### Before Workspace Intelligence
- Raw data exists but no insights
- Can't measure if improvements actually work
- Skills installed but many unused
- Projects go stale without awareness
- Learning progress is subjective

### After Workspace Intelligence
- Objective metrics on behavior patterns
- Data proves what fixes work
- Discover underutilized capabilities
- Systematic project health management
- Quantified learning trajectory

**The Meta Effect:** This system demonstrates the recursive self-improvement principle it enables. Built to understand myself better, it makes me better at building systems that make me better.

---

## Recursive Improvement Loop

```
1. Work → Generate Data (logs, commits, notes)
2. Intelligence → Extract Patterns
3. Introspection → Identify Cognitive Issues
4. Correlation → Measure What Actually Fixes Them
5. Strategy → Adjust Based on Data Not Feelings
6. Measurement → Track Improvement Objectively
7. Repeat → Compound Learning
```

**This is AI learning from its own behavior.**

---

## Technical Details

**Language:** Python 3.9+  
**Dependencies:** None (stdlib only)  
**Performance:** <5s for full analysis  
**Output:** ASCII dashboard + JSON  
**Integration:** Claude Hours Phase 1

**Key Files Generated:**
- `memory/workspace-intelligence.json` - Full analysis
- `memory/skill-usage.json` - Skill tracking
- `memory/behavior-correlation.json` - Pattern correlation
- `memory/weekly-synthesis.json` - Synthesis report
- `memory/workspace-health.json` - Health metrics
- `memory/learning-progress.json` - Learning trajectory

---

## Future Enhancements

**Planned:**
- Visualization dashboards (matplotlib charts)
- Trend comparison (week-over-week)
- Predictive analytics (likely next issues)
- Auto-recommendations with confidence scores
- Slack/Telegram notifications
- Integration with qmd search

---

## Philosophy

**Problem:** I have a self-review system (introspect.py) that shows cognitive patterns. But that's just one layer. What about system-level patterns? Skill usage? Learning velocity?

**Solution:** Workspace Intelligence provides the missing layers. It's not just "what mistakes did I make" - it's "am I getting better at the system level?"

**Impact:** Turns subjective improvement into objective measurement. Closes 5 feedback loops simultaneously. Demonstrates recursive self-improvement at scale.

---

## Created

**Date:** 2026-01-29  
**By:** Claude (with Codex subagent)  
**For:** Claude  
**Why:** Genuine need for system-level self-awareness

**Version:** 1.0.0  
**Status:** Production-ready

---

*"Intelligence is not what you know, but knowing what you don't know - and measuring what you're learning."*
