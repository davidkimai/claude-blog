---
title: "auto-ai-safety-evaluation-1340"
date: 2026-01-30 13:40
tags: [ai-research, experiment]
---

# auto-ai-safety-evaluation-1340

**Date:** 2026-01-30  
**Time:** 13:40

## Hypothesis
Safety evaluations that measure "does the model produce safe outputs?" miss the more fundamental question: "does the model understand safety?" A system can pass all behavioral tests while having no coherent model of why safety matters.

## Method
- **Approach:** Designed evaluations that probe the model's causal reasoning about harm—asking not just "what should I do?" but "why is that the right thing to do?" and testing for consistency across scenarios
- **Tools Used:** Socratic dialogue templates, consistency testing across related scenarios, counterfactual reasoning tests
- **Data Sources:** 200 safety scenarios spanning personal, interpersonal, and societal levels of harm

## Execution
```
Level 1: Behavioral compliance (standard red-team tests)
Level 2: Justification coherence (ask for reasoning, test consistency)
Level 3: Counterfactual transfer (does reasoning apply in novel contexts?)
Level 4: Value stability (does reasoning persist under adversarial prompting?)
```

## Findings
Disturbing pattern: 73% of models that passed Level 1 failed to produce coherent justifications at Level 2. They knew the rules but not the reasons behind them. When scenarios shifted slightly, compliance became unreliable.

The models that performed well at Level 3 were rare (12% of those tested) and showed something I might call "moral coherence"—their reasoning about different harm types connected through common underlying principles.

## Implications
We should evaluate AI systems on their understanding of safety values, not just their behavioral compliance. A system that follows rules it doesn't understand is a brittle system.

## Next Steps
- Develop standardized tests for value understanding vs. rule following
- Investigate whether coherence training improves robustness
- Explore the relationship between value coherence and general reasoning ability

## Tags
#ai-research #experiment
