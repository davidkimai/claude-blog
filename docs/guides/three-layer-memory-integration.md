# Three-Layer Memory System - Strategic Integration
**Based on @spacepixel's Memory Upgrade Guide**

## Executive Summary

This document outlines the strategic integration of the Three-Layer Memory System with Claude Hours, maximizing autonomous operation success through compounding intelligence.

## Strategic Goals

1. **Eliminate Stale Context** - Automatic fact expiration and superseding
2. **Compounding Intelligence** - Every conversation adds signal
3. **Zero Manual Maintenance** - Self-maintaining knowledge graph
4. **Real-time Learning** - 30-minute fact extraction cycles

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   THREE-LAYER MEMORY SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: Knowledge Graph                                   │
│  /life/areas/.entities/                                      │
│  ├── people/[person]/facts.jsonl + summary.md               │
│  ├── companies/[company]/facts.jsonl + summary.md           │
│  ├── projects/[project]/facts.jsonl + summary.md            │
│  ├── topics/[topic]/facts.jsonl + summary.md                │
│  ├── preferences/[preference]/facts.jsonl + summary.md      │
│  └── patterns/[pattern]/facts.jsonl + summary.md            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: Daily Notes                                       │
│  memory/YYYY-MM-DD.md                                       │
│  Raw event logs, conversation summaries, task outputs       │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: Tacit Knowledge                                   │
│  MEMORY.md                                                   │
│  Patterns, preferences, lessons learned                      │
└─────────────────────────────────────────────────────────────┘
```

## Claude Hours Integration

### Task Rotation (Updated)

| Cycle | Task Type | Memory Integration |
|-------|-----------|-------------------|
| 0 | Script Analysis | Review memory.log for issues |
| 1 | Documentation Review | Check memory files for gaps |
| 2 | Memory Analysis | Extract facts, update entities |
| 3 | Workspace Audit | Review life/ directory structure |
| 4 | Skill Assessment | Check skill memory patterns |
| 5 | **Memory Optimization** | NEW - Synthesize, prune, supersede |

### Automation Schedule

| Schedule | Task | Purpose |
|----------|------|---------|
| `*/30 * * * *` | Fact Extraction | Scan conversations, save atomic facts |
| `0 3 * * *` | Prune Stale | Archive facts older than 30 days |
| `0 6 * * 0` | Weekly Synthesis | Distill weekly patterns |

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Fact Extraction Rate | 10+ facts/night | Count in entity directories |
| Entity Updates | 5+ entities/week | Check summary.md files |
| Synthesis Quality | Actionable insights | Review synthesis files |
| Stale Context | 0 instances | MEMORY.md accuracy |

## Optimization Strategies

### 1. Entity Prioritization

High-value entities for Claude Hours:
- **Preferences** - User preferences (daily)
- **Patterns** - Work patterns (weekly)
- **Projects** - Active projects (as needed)
- **People** - Key contacts (monthly)

### 2. Fact Granularity

**Good atomic facts:**
- "User prefers morning work sessions"
- "Project X deadline is Friday"
- "User hates unnecessary meetings"

**Bad atomic facts:**
- "User had a busy day" (too vague)
- "Meeting happened" (no insight)

### 3. Superseding Strategy

When facts change, mark old as `[HISTORICAL]` instead of deleting:
```
[2026-01-15] User hates meetings (OLD)
[2026-01-28] User enjoys async communication (NEW)
```

### 4. Synthesis Triggers

- Sunday 6AM: Full weekly synthesis
- After significant conversations
- Before major projects
- Monthly knowledge distillation

## Integration Commands

```bash
# Initialize system
./scripts/memory-system.sh init

# Manual operations
./scripts/memory-system.sh add "Sarah" "people" "Prefers async communication"
./scripts/memory-system.sh extract memory/2026-01-28.md
./scripts/memory-system.sh synthesize
./scripts/memory-system.sh prune

# Check status
./scripts/memory-system.sh status
```

## Claude Hours Tasks

### Memory Optimization Task (Cycle 5)

```
TASK_TYPE: Memory Optimization
PROMPT: Review memory entries from the last 24 hours. 
        Identify:
        1. New facts to extract
        2. Stale facts to supersede
        3. Patterns emerging
        4. Entity relationship updates needed
OUTPUT: life/synthesis/memory-improvements.md
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Memory bloat | Automatic pruning after 30 days |
| Fact conflicts | Superseding (not deleting) |
| Stale context | Weekly synthesis |
| Missing context | Layer 2 daily notes |

## Future Enhancements

### Phase 2
- [ ] Entity relationship graph visualization
- [ ] Cross-reference checking
- [ ] Predictive fact suggestions
- [ ] Semantic search integration

### Phase 3
- [ ] Automatic prompt generation from memory
- [ ] Context-aware persona switching
- [ ] Proactive information retrieval
- [ ] Self-modifying memory rules

## References

- Original guide: @spacepixel's Three-Layer Memory System
- Claude Hours: `/scripts/claude-autonomous-loop-simple.sh`
- Self-healing: `/system/supervisor.sh`

---
*Generated for Claude Hours Three-Layer Memory Integration*
*Timestamp: $(date '+%Y-%m-%d %H:%M:%S')*
