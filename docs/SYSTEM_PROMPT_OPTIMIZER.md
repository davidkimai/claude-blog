# System Prompt Optimizer

A tool for analyzing, improving, testing, and versioning Claude's system prompts (AGENTS.md, SOUL.md).

## Overview

The System Prompt Optimizer helps improve Claude's system prompts through:
- **Analysis**: Score prompts on clarity, completeness, actionability
- **Improvement**: Generate variations using 5 different strategies
- **Testing**: Rank variations and pick the best
- **Versioning**: Track all changes with backups

## Usage

```bash
./scripts/system-optimizer.sh <command>
```

### Commands

| Command | Description |
|---------|-------------|
| `analyze` | Score current prompts on clarity, completeness, actionability |
| `improve` | Generate 5 improved variations with different strategies |
| `test` | Test variations on historical tasks and score improvements |
| `apply` | Apply the best variation to AGENTS.md |
| `history` | Show version history and evolution |

### Examples

```bash
# Analyze current prompts
./scripts/system-optimizer.sh analyze

# Generate improvement variations
./scripts/system-optimizer.sh improve

# Test and rank variations
./scripts/system-optimizer.sh test

# Apply best variation
./scripts/system-optimizer.sh apply

# View history
./scripts/system-optimizer.sh history
```

## Improvement Strategies

The optimizer generates variations using 5 strategies:

| Strategy | Focus | Expected Benefit |
|----------|-------|-----------------|
| **Simplify** | Reduce complexity, remove redundancy | -30% length, faster onboarding |
| **Clarify** | Add examples, clarify ambiguous instructions | +20% clarity |
| **Expand** | Add missing sections, more detail | +20% completeness |
| **Reorganize** | Better logical flow, grouping | +15% actionability |
| **Validate** | Add verification points, success criteria | +20% actionability |

## Output Locations

```
.claude/state/prompt-variations/
├── analysis.json           # Analysis results
├── scores_*.json          # Detailed section scores
├── test_results.json      # Test rankings
├── current/               # Generated variations
│   ├── simplify_*.md
│   ├── clarify_*.md
│   ├── expand_*.md
│   ├── reorganize_*.md
│   └── validate_*.md
├── best/                  # Best variation
│   ├── current.md
│   └── meta.json
└── history/               # Version history

.claude/state/prompt-backups/
└── AGENTS_<timestamp>.md  # Backups before apply
```

## Analysis Metrics

The analyzer scores each section on:

- **Clarity** (0-100): Structure, headers, code examples
- **Completeness** (0-100): Content depth, coverage
- **Actionability** (0-100): Actionable items, examples, checklists

## Recommendations

1. **Run analysis first**: Understand current strengths/weaknesses
2. **Generate variations**: Create all 5 strategies
3. **Review variations**: Check `current/*.md` manually
4. **Test**: Auto-rank based on strategy deltas
5. **Apply**: Apply best variation when satisfied
6. **Backup**: Old versions saved automatically

## Integration with Claude Hours

The optimizer integrates with Claude Hours autonomous system:

```bash
# Add to nightly routine for continuous improvement
./scripts/system-optimizer.sh analyze
./scripts/system-optimizer.sh improve
./scripts/system-optimizer.sh test
```

## Best Practices

- Review variations before applying
- Keep backups for rollback
- Track changes in version control
- Test variations on real tasks when possible
- Use history to understand prompt evolution

## File Structure

```
.claude/
└── state/
    └── prompt-variations/
        ├── analysis.json        # Latest analysis
        ├── scores_*.json       # Per-section scores
        ├── test_results.json   # Ranked variations
        ├── current/            # Generated variations
        │   ├── <strategy>_<ts>.md
        │   └── <strategy>_<ts>.meta.json
        ├── best/               # Best variation
        │   ├── current.md
        │   └── meta.json
        └── history/            # Archived versions
```

## Version History

Each apply creates:
1. Backup in `prompt-backups/`
2. Version in `history/`
3. Log entry in `best/apply.log`

## See Also

- `AGENTS.md` - Main system prompt
- `SOUL.md` - Core identity prompt
- `docs/AUTONOMY_VISION.md` - Autonomy goals
