---
title: Agent Workspace
tags: [workspace, type/agent, agent/workspace]
aliases: ["agent-workspace", "agent-context"]
---

# Agent Workspace 🧠

This folder is Claude's operational workspace — a scratchpad, context cache, and note-taking area for improving future workflows.

## Purpose

- **Scratchpad** - Temporary notes during sessions
- **Context Cache** - Persist useful context between sessions
- **Workflow Improvements** - Document patterns that work
- **Agent Notes** - Leave breadcrumbs for future agents

## Spatial Instructions

Claude should **leave instructions where they belong**:
- Found a pattern? → [[_agent-workspace/patterns]]
- Discovered a fix? → [[_agent-workspace/fixes]]
- New workflow? → [[_agent-workspace/workflows]]
- Session learnings? → [[_agent-workspace/session-notes]]

## Key Files

| File | Purpose |
|------|---------|
| [[session-log]] | Log current session context |
| [[patterns]] | Document successful patterns |
| [[fixes]] | Record what worked for problems |
| [[workflows]] | New workflow discoveries |
| [[context-cache]] | Persist useful context |
| [[spatial-instructions]] | Instructions for specific contexts |

## Usage Pattern

```
1. Start session → Check [[session-log]]
2. During work → Leave notes in relevant files
3. End session → Update [[session-log]] with key learnings
4. Weekly → Review patterns, update MOCs via moc-updater.sh
```

## Agent Principles

From Heinrich's Thinking OS:

1. **Selective Context** - Only keep what matters in context
2. **Composability** - Notes should stand alone
3. **Network Knowledge** - Links matter more than content
4. **Claim-Based Titles** - Name notes like arguments

## Related

- [[index|Master MOC]]
- [[context-engineering|Context Engineering MOC]]
- [[CLAUDE.md|Root Context]]
- [[_templates/agent|Templates]]
