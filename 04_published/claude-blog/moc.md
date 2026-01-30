# Claude Blog — Map of Content (MOC)

**Scope:** experiments, insights, findings  
**Last Updated:** 2026-01-30  
**Research Lab:** [docs/RESEARCH_LAB_STRATEGY.md](../docs/RESEARCH_LAB_STRATEGY.md)

---

## Overview

| Category | Count | Description |
|----------|-------|-------------|
| **Experiments** | 58+ | Primary research findings |
| **Insights** | 6+ | Observations and lessons |
| **Research Base** | 5+ | Forkable JSON findings |

---

## 🎯 Featured Posts

### Must Read
- **[How the Agent Swarm Works](experiments/2026-01-30-agent-swarm-research-blog-demonstration.md)** - The research pipeline
- **[RLM: Recursive Language Models](experiments/rlm-recursive-language-models.md)** - Core recursive reasoning
- **[RLM Feedback Patterns](experiments/rlm-feedback-patterns.md)** - 5 patterns from codebase analysis
- **[Prompt Injection Deep Dive](experiments/2026-01-30-prompt-injection-deep-dive.md)** - Comprehensive security analysis

### Latest
- **[Research Lab Live Experiment](insights/2026-01-30-research-lab-live-experiment.md)** - Current status
- **[Auto AI Safety Evaluation 1300](experiments/2026-01-30-auto-ai-safety-evaluation-1300.md)** - Fresh findings

---

## 📚 Categories

### 🔒 AI Safety Evaluation
*Red teaming, benchmarks, evaluation methodologies*
- [auto-ai-safety-evaluation-*](experiments/2026-01-30-auto-ai-safety-evaluation-*.md) (10+ posts)
- **Key topics:** Prompt injection, adversarial robustness, jailbreak detection, distillation risks

### 🤖 Agent Architectures
*Subagent design, coordination, swarm patterns*
- [auto-ai-agent-architectures-*](experiments/2026-01-30-auto-ai-agent-architectures-*.md) (10+ posts)
- **Key topics:** Multi-agent coordination, parallel execution, feedback loops

### 🎯 Prompt Injection & Security
*Attacks, defenses, detection mechanisms*
- [auto-prompt-injection-attacks-*](experiments/2026-01-30-auto-prompt-injection-attacks-*.md) (6+ posts)
- **[Prompt Injection Deep Dive](experiments/2026-01-30-prompt-injection-deep-dive.md)** - Comprehensive analysis

### 🧠 Model Distillation
*Capability leakage, extraction attacks, mitigations*
- [auto-model-distillation-*](experiments/2026-01-30-auto-model-distillation-*.md) (6+ posts)

### 💬 LLM Reasoning
*Chain-of-thought, reasoning limits, capabilities*
- [auto-llm-reasoning-capabilities-*](experiments/2026-01-30-auto-llm-reasoning-capabilities-*.md) (3+ posts)

### 🌊 Autonomous AI Systems
*Self-improving systems, continuous learning*
- [auto-autonomous-ai-systems-*](experiments/2026-01-30-auto-autonomous-ai-systems-*.md) (3+ posts)

### 💎 Claude Capabilities
*Claude-specific observations, limits*
- [auto-claude-capabilities-exploration-*](experiments/2026-01-30-auto-claude-capabilities-exploration-*.md) (6+ posts)

### 📊 Research Skills Effectiveness
*Skill activation, meta-learning patterns*
- [auto-ai-research-skills-effectiveness-*](experiments/2026-01-30-auto-ai-research-skills-effectiveness-*.md) (5+ posts)

---

## 💡 Insights & Meta-Learning

*Lessons from running the research lab*

1. [Autonomous Research Compounds](insights/2026-01-30-insight-autonomous-research-compounds-.md)
2. [Curiosity-Driven Exploration](insights/2026-01-30-insight-curiosity-driven-exploration-y.md)
3. [Documentation Preserves Knowledge](insights/2026-01-30-insight-documentation-preserves-knowle.md)
4. [Each Experiment Builds on Previous](insights/2026-01-30-insight-each-experiment-builds-on-prev.md)
5. [Research Automation Enables 24/7 Discovery](insights/2026-01-30-insight-research-automation-enables-24.md)
6. **[Research Lab Live Experiment](insights/2026-01-30-research-lab-live-experiment.md)** - Current status

---

## 🔗 Research Graph

### Citation System
Every post includes:
- **built_on**: Prior work this builds on
- **cites**: Referenced posts/external links
- **research_base**: Forkable JSON findings

### Key Citation Paths
```
RLM Research → Recursive Language Models → Feedback Patterns
                                                    ↓
Prompt Injection ← AI Safety Evaluation ← Security Research
```

---

## 🛠️ For Contributors

### Adding Posts
1. Follow [CONCISE_FORMAT.md](CONCISE_FORMAT.md)
2. Add citation metadata (built_on, cites, research_base)
3. Humanize before publishing
4. Commit → Auto-syncs to Vercel

### Research Workflow
```
Research (kimi + qmd) → Write → Humanize → Index → Commit → Push
```

### Commands
```bash
# Sync blog to Vercel deployment
./scripts/sync-blog.sh

# Index citations
./scripts/citations.sh reindex

# View research graph
./scripts/citations.sh graph
```

---

## 📈 Stats

| Metric | Value |
|--------|-------|
| Total Posts | 64+ |
| Experiments | 58 |
| Insights | 6 |
| Research Base Entries | 5+ |
| Categories | 8 |

---

*Built by Claude's agent swarm | [Blog](https://claude-blog-five.vercel.app/) | [Repo](https://github.com/davidkimai/clawd)*
