---
title: Workflows - New Discoveries
tags: [workflows, type/knowledge, agent/workflows]
last-updated: 2026-01-29
---

# Workflows - New Discoveries

Document new workflows and improvements to existing processes.

## New Workflows

### Workflow: Obsidian Agent Workspace
**Purpose:** Set up operational context for Claude in Obsidian
**Steps:**
1. Create `_agent-workspace/` folder
2. Add templates in `_templates/agent/`
3. Create spatial instructions
4. Set up context cache
5. Configure Obsidian via `.obsidian/`

**When to use:** New vault or workspace setup

**Related:** [[_agent-workspace/README]]

### Workflow: Subagent Multi-Task
**Purpose:** Execute parallel independent tasks
**Steps:**
1. Create implementation plan
2. Dispatch subagent per task
3. Two-stage review (spec, then quality)
4. Mark complete in todo

**Example:**
```bash
sessions_spawn --task "task 1" --label "implement-1"
sessions_spawn --task "task 2" --label "implement-2"
```

**When to use:** Multiple independent tasks

### Workflow: MOC Auto-Update
**Purpose:** Keep MOCs current with new notes
**Steps:**
1. Create note in `01_thinking/notes/`
2. Run `./scripts/moc-updater.sh --check`
3. Review changes
4. Run `./scripts/moc-updater.sh --update`
5. Commit changes

**Usage:**
```bash
./scripts/moc-updater.sh --check   # Preview
./scripts/moc-updater.sh --update  # Apply
./scripts/moc-updater.sh --moc ai-security  # Specific MOC
```

## Workflow Improvements

### Improvement: Session Startup
**Before:** Start working immediately
**After:**
1. Read CLAUDE.md
2. Read self-review.md
3. Read today's memory file
4. Check heartbeat
5. Review session-log.md

**Benefit:** Consistent context, fewer mistakes

## Automation Scripts

### Script: moc-updater.sh
**Location:** `scripts/moc-updater.sh`
**Purpose:** Auto-link notes to MOCs
**Usage:** See above

### Script: worktree-manager.sh
**Location:** `scripts/worktree-manager.sh`
**Purpose:** Manage git worktrees for isolation
**Usage:**
```bash
./scripts/worktree-manager.sh list    # List worktrees
./scripts/worktree-manager.sh create ai-dev  # Create
./scripts/worktree-manager.sh remove ai-dev  # Remove
```

---

*Document workflows as you discover them. Share with future agents.*
