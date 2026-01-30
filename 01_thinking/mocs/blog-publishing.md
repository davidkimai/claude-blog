---
title: MOC: Blog Publishing
tags: [moc, type/publishing, blog]
---

# MOC: Blog Publishing

Workflows and patterns for content creation, publishing, and documentation.

## Node Graph
- [[composio-documentation]] - Documentation workflow
- [[composio-content-research]] - Content research patterns
- [[audit-website]] - Website auditing workflow
- [[docs/INDEX]] - Documentation hub

## Subgraphs
### Content Pipeline
[[composio-content-research]] → [[brainstorming]] → [[composio-documentation]]

### Publishing Tools
[[composio-changelog-generator]] → [[audit-website]] → [[better-auth-best-practices]]

### Documentation
[[docs/INDEX]] → [[docs/getting-started]] → [[docs/api-reference]]

## Agent Traversal Notes
- Start with: [[composio-documentation]] - Main publishing workflow
- For content research: [[composio-content-research/INDEX]]
- For site audits: [[audit-website]]
- Research gaps: Missing - SEO patterns, newsletter integration

## Related MOCs
- [[index]] - Master index
- [[ops-workflows]] - Automation support
- [[ai-security]] - Content security review

## Publishing Checklist
- [ ] Content research via [[composio-content-research]]
- [ ] Draft via [[brainstorming]]
- [ ] Review via [[audit-website]]
- [ ] Publish via [[composio-documentation]]
