---
title: MOC: Operational Workflows
tags: [moc, type/workflow, ops]
---

# MOC: Operational Workflows

Automation patterns, CLI tools, and operational procedures for system management.

## Node Graph
- [[CLAUDE_HOURS.md]] - Autonomous operation workflow
- [[NIGHTLY_BUILDER_V2_NOTES]] - Nightly build automation
- [[agent-swarm]] - Parallel agent execution
- [[claude-hours]] - Claude Hours tracking

## Subgraphs
### Automation Pipelines
[[CLAUDE_HOURS.md]] → [[nightly-builder]] → [[NIGHTLY_BUILDER_V2_NOTES]]

### Agent Orchestration
[[agent-swarm]] → [[ai-research-orchestrator]] → [[composio-skill-creator]]

### Deployment Operations
[[composio-deployment]] → [[V3_DEPLOYMENT]] → [[hybrid-mvp-implementation-plan]]

## Agent Traversal Notes
- Start with: [[CLAUDE_HOURS.md]] - Core operational workflow
- For agent swarms: [[agent-swarm/INDEX]]
- For deployments: [[composio-deployment/INDEX]]
- Research gaps: Missing - cron-like scheduling, failure recovery patterns

## Related MOCs
- [[index]] - Master index
- [[context-engineering]] - Workflow context management
- [[blog-publishing]] - Publishing automation

## Key Tools
- [[composio-artifacts-builder]] - Build automation
- [[composio-changelog-generator]] - Changelog creation
- [[composio-file-organizer]] - File management
