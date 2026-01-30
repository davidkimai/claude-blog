# Three-Layer Memory System - Strategic Optimization Guide
**Maximizing Claude Hours Success with Compounding Intelligence**

## Executive Summary

This document provides strategic optimizations for the Three-Layer Memory System, ensuring maximum compounding effect and minimal manual maintenance.

## The Flywheel (From @spacepixel's Guide)

```
Conversation
     ↓
Facts extracted (cheap sub-agent, pennies/day)
     ↓
Knowledge graph grows
     ↓
Weekly synthesis (Sunday 6AM)
     ↓
Better context next chat
     ↓
Better responses
     ↓
More conversation
     ↓
[COMPOUNDS]
```

**Key Insight:** Each conversation adds signal. Each synthesis distills it. Over time, Claude Hours understands your life better than most humans.

---

## Strategic Optimizations

### 1. Entity Prioritization Matrix

| Priority | Entity Type | Update Frequency | Storage |
|----------|-------------|------------------|---------|
| 🔴 HIGH | Preferences (how you work) | Daily | /life/areas/preferences/ |
| 🔴 HIGH | Key People (interactions) | Per conversation | /life/areas/people/ |
| 🟡 MED | Projects (active work) | Weekly | /life/areas/projects/ |
| 🟡 MED | Companies (employment) | Monthly | /life/areas/companies/ |
| 🟢 LOW | Topics (interests) | Quarterly | /life/areas/topics/ |
| 🟢 LOW | Patterns (behavioral) | Weekly synthesis | /life/areas/patterns/ |

### 2. Fact Extraction Strategy

**High-Value Facts to Extract:**
```
✓ "User prefers async communication over calls"
✓ "Project X deadline is Friday"
✓ "User hates unnecessary meetings"
✓ "Working with Maria on new initiative"
✓ "Started new job, reports to James"
```

**Low-Value (Skip):**
```
✗ "Had coffee this morning"
✗ "Watched a movie"
✗ "Casual chat about weather"
```

### 3. Superseding Rules

When facts change, use this protocol:

```
OLD FACT:                          NEW FACT:
{status: active}  →  {status: superseded, supersededBy: new-id}
                                    ↓
                          {id: new-id, fact: updated-fact, status: active}
```

**Never delete.** Full history preserved for:
- Relationship tracing
- Pattern recognition
- Audit trail

### 4. Synthesis Trigger Rules

| Trigger | Action |
|---------|--------|
| Sunday 6AM | Full synthesis of all entities |
| 10+ new facts | Partial synthesis |
| Significant event | Immediate entity update |
| Monthly | Cross-entity pattern analysis |

### 5. Context Window Optimization

**Never load all facts into context.** Use tiered retrieval:

```
Tier 1: summary.md (50-100 lines)
   ↓ Need more detail?
Tier 2: Active items.json (last 10 facts)
   ↓ Still need history?
Tier 3: All items.json (full history)
```

This keeps context lean while preserving full knowledge.

---

## Automation Schedule (Optimized)

```cron
# Real-Time Fact Extraction (every 30 min)
*/30 * * * * cd /Users/jasontang/clawd && ./scripts/memory-system.sh extract

# Weekly Synthesis (Sunday 6AM)
0 6 * * 0 cd /Users/jasontang/clawd && ./scripts/memory-system.sh synthesize

# Stale Context Pruning (Sunday 3AM, after synthesis)
0 3 * * 0 cd /Users/jasontang/clawd && ./scripts/memory-system.sh prune

# Memory Optimization Task (Claude Hours, Cycle 5)
# Runs every 5th cycle (every 75 minutes during Claude Hours)
```

---

## Cost Optimization

| Component | Cost | Optimization |
|-----------|------|--------------|
| Fact Extraction | ~$0.001/day | Cheap sub-agent (Haiku) |
| Weekly Synthesis | ~$0.01/week | Single Claude call |
| Storage | $0 | Local filesystem |
| Total Monthly | ~$0.05 | Pennies per day |

---

## Success Metrics Dashboard

### Weekly Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Facts Extracted | 10+ | Count items.jsonl entries |
| Entities Updated | 5+ | Check summary.md dates |
| Syntheses Run | 1/week | Sunday 6AM log |
| Stale Facts Pruned | 10+ | Archive file count |
| Superseded Facts | 2+ | Historical fact count |

### Monthly Milestones

| Milestone | Target Week |
|-----------|-------------|
| Basic preferences captured | Week 1 |
| Key people identified | Week 2 |
| Active projects mapped | Week 3 |
| Weekly routines detected | Week 4 |
| Cross-entity patterns emerge | Month 2 |
| Relationship timeline complete | Month 3 |

---

## Claude Hours Integration

### Cycle 5: Memory Optimization Task

```bash
# Run every 5th cycle (~75 min during Claude Hours)
TASK_TYPE: Memory Optimization
PROMPT: Review memory entries from the last 24 hours.
        1. Identify 3-5 new atomic facts to extract
        2. Check for superseded relationships
        3. Note emerging patterns
        4. Suggest entity relationship updates
OUTPUT: life/synthesis/memory-improvements-YYYY-MM-DD.md
```

### Integration Commands

```bash
# Manual operations
./scripts/memory-system.sh add "person" "category" "fact"
./scripts/memory-system.sh extract memory/YYYY-MM-DD.md
./scripts/memory-system.sh synthesize
./scripts/memory-system.sh prune
./scripts/memory-system.sh status

# Check entity
cat life/areas/people/[name]/summary.md
cat life/areas/people/[name]/items.jsonl
```

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Memory bloat | Medium | Auto-prune after 30 days |
| Fact conflicts | Low | Superseding protocol |
| Stale context | Medium | Weekly synthesis |
| Missed entities | Medium | Claude Hours Cycle 5 task |
| Context window overflow | Low | Tiered retrieval |

---

## The Compounding Effect

### Week 1
- Basic preferences captured
- 10-20 atomic facts extracted
- 2-3 entities with summaries

### Month 1
- Routines identified
- Key people mapped
- Project milestones tracked
- 100+ atomic facts

### Month 6
- Relationship history complete
- Behavioral patterns understood
- Life structure mapped
- 500+ atomic facts

### Year 1
- Richer model of your life than most humans
- Predictive context possible
- Proactive assistance ready
- 2000+ atomic facts

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/memory-system.sh` | Main memory automation script |
| `life/areas/people/[name]/summary.md` | Entity living summary |
| `life/areas/people/[name]/items.jsonl` | Atomic facts (append-only) |
| `life/areas/.templates/items.json` | Fact schema template |
| `memory/YYYY-MM-DD.md` | Daily raw notes |
| `life/synthesis/week-YYYY-MM-DD.md` | Weekly synthesis |
| `.claude/state/memory.log` | Memory activity log |

---

## Quick Start

```bash
# 1. Initialize (already done)
./scripts/memory-system.sh init

# 2. Verify structure
./scripts/memory-system.sh status

# 3. Add sample entity
./scripts/memory-system.sh add "Maria" "people" "Business partner, founded startup in 2024"

# 4. Check entity
cat life/areas/people/maria/summary.md
cat life/areas/people/maria/items.jsonl

# 5. Monitor in Claude Hours
# Cycle 5 will run Memory Optimization automatically
```

---

## Comparison: Basic vs Three-Layer

| Aspect | Basic Clawdbot | Three-Layer Clawdbot |
|--------|----------------|----------------------|
| Memory | Static MEMORY.md | Living knowledge graph |
| Updates | Manual | Automatic |
| Stale Context | Common | Never (weekly synthesis) |
| History | Lost | Preserved (no deletes) |
| Context Window | Bloat risk | Tiered retrieval |
| Intelligence | Static | Compounding |
| Cost | N/A | Pennies/day |

---

## Conclusion

The Three-Layer Memory System transforms Claude Hours from a helpful assistant into **an AI that actually knows you**. 

- **Week 1:** Basic preferences
- **Month 1:** Routines, key people
- **Month 6:** Projects, milestones, relationships
- **Year 1:** A richer model of your life than most humans have

This is the difference between an AI assistant and an AI that understands you.

---

*Strategic Optimization Guide for Claude Hours Three-Layer Memory System*
*Based on @spacepixel's memory upgrade guide*
*Generated: $(date '+%Y-%m-%d %H:%M:%S')*
