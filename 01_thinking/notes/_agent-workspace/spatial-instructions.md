---
title: Spatial Instructions
tags: [instructions, type/spatial, agent/spatial]
last-updated: {{date}}
---

# Spatial Instructions

Leave instructions where they belong. This is the core pattern from Heinrich's Thinking OS.

## How to Use

When you learn something about a context, **leave it there**:

- Working in `docs/` → Leave instructions in `docs/INSTRUCTIONS.md`
- Working in `skills/` → Leave notes in skill folders
- Working in `memory/` → Update relevant memory files
- Working in `projects/` → Add context to project files

## Pattern

```markdown
## Claude Notes

[What Claude learned here]

- **Pattern:** [what worked]
- **Context:** [when this applies]
- **Related:** [[MOC-or-note]]
```

## Existing Spatial Instructions

### CLAUDE.md
Core identity and model protocol. Start here.

### CLAUDE-HOURS.md
Autonomous operation during 9 PM - 8 AM CST.

### AGENTS.md
Strategic operating manual. Contains vault patterns.

### 01_thinking/mocs/index.md
Entry point for vault navigation.

### 01_thinking/mocs/context-engineering.md
Context management patterns.

## Adding New Instructions

1. Find the relevant file/folder
2. Add a "Claude Notes" section
3. Document what you learned
4. Link to related MOCs

## Examples

### Example: New Pattern in Skills
```markdown
## Claude Notes

When working with [skill-type], prefer [approach] because [reason].

- **Pattern:** Use [specific command]
- **Context:** [when this applies]
```

### Example: Fix in Projects
```markdown
## Claude Notes

Found issue with [problem]. Fixed by [solution].

- **Error:** [error message]
- **Fix:** [command/file change]
```

---

*Every note you leave helps future Claude navigate the vault more effectively.*
