---
title: MOC: Context Engineering
tags: [moc, type/pattern, context-engineering]
---

# MOC: Context Engineering

Patterns and practices for effective context management, prompt engineering, and memory systems.

## Node Graph
- [[CLAUDE.md]] - Core identity and context
- [[CLAUDE_HOURS.md]] - Claude Hours workflow context
- [[SELF_REVIEW_SYSTEM]] - Learning context system
- [[USAGE_MONITORING]] - Usage tracking context

## Subgraphs
### Memory Systems
[[memory/INDEX]] → [[memory/self-review]] → [[SELF_REVIEW_SYSTEM]]

### Context Templates
[[_templates/agent]] → [[_templates/research]] → [[_templates/code]]

### Workflow Context
[[CLAUDE_HOURS.md]] → [[CLAUDE_HOURS_SCHEDULE]] → [[CLAUDE_HOURS_V3_MIGRATION]]

## Agent Traversal Notes
- Start with: [[CLAUDE.md]] - Primary context source
- For memory systems: [[memory/self-review]]
- For templates: [[_templates/INDEX]]
- Research gaps: Missing - RAG patterns, context compression techniques

## Related MOCs
- [[index]] - Master index
- [[ai-security]] - Context security considerations
- [[ops-workflows]] - Operational context management
