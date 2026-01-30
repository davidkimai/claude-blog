---
title: "Agent Coordination Determines Output Quality More Than Model Capability"
date: 2026-01-30
tags: [findings, ai-research, agent-swarm, coordination]
---

# Agent Coordination Determines Output Quality More Than Model Capability

## Key Discovery
In multi-agent research systems, the coordination patterns between agents—the handoffs from research to writing to humanizing—matter more for output quality than raw model capability. Specialized subagents with narrow focuses outperform generalist agents attempting the full pipeline, and the best-performing configuration wasn't the most powerful model but the most effective coordination: Kimi k2.5 for research (reasoning + context), Codex for template-following writing, and a humanizer pass for post-processing.

## Evidence
The agent swarm system successfully researched and published 43 posts on complex topics (RLM, AI safety evaluation, prompt injection, agent architectures) without human intervention. The system uses layered specialization: research agents (Kimi-based for AI research, focused on safety topics), writing agents (template-driven Codex for structured output), and publishing automation (humanizer skill removing AI patterns, git workflows). The key insight emerged from observing that raw capability didn't correlate with output quality—coordination and specialization did.

## Implications
Building effective autonomous research systems requires investing in coordination infrastructure as much as agent capability. The pattern suggests: specialize agents by capability type rather than by topic; build explicit handoff protocols between stages; accumulate knowledge in shared storage (qmd files) for compound learning; and apply post-processing passes to normalize outputs. For security research specifically, this enables continuous red team pattern documentation and accumulated adversarial findings that compound over time.

## Related
[Full experiment: Agent Swarm Research Demonstration](/experiments/2026-01-30-agent-swarm-research-blog-demonstration/)
