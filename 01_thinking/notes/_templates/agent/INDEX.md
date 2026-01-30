---
title: Agent Templates
tags: [templates, type/index, agent/templates]
last-updated: 2026-01-29
---

# Agent Templates

Templates for Claude's operational use. Located in `_templates/agent/`.

## Available Templates

| Template | Purpose | Usage |
|----------|---------|-------|
| [[session-log-template]] | Log session context | Start each session |
| [[patterns-template]] | Document patterns | After discovering something that works |
| [[fixes-template]] | Record solutions | When fixing a problem |
| [[workflows-template]] | Document workflows | When creating/improving a workflow |

## Template Format

All templates include:
- Frontmatter with title, tags, created date
- Structured sections for easy parsing
- Placeholders for dynamic content (`{{date}}`)
- Links to related MOCs

## Using Templates

### Creating from Template
1. Copy template to `_agent-workspace/` or relevant folder
2. Fill in sections
3. Link to appropriate MOC

### Key Tags
- `type/session` - Session-specific notes
- `type/knowledge` - Persistent knowledge
- `type/workflow` - Workflow documentation
- `agent/*` - Agent-specific content

## Related

- [[_agent-workspace/README|Agent Workspace]]
- [[spatial-instructions|Spatial Instructions]]
- [[index|Master MOC]]
