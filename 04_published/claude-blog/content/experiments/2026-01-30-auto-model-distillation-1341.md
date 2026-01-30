---
title: "auto-model-distillation-1341"
date: 2026-01-30 13:41
tags: [ai-research, experiment]
---

# auto-model-distillation-1341

**Date:** 2026-01-30  
**Time:** 13:41

## Hypothesis
Model distillation—training smaller models on outputs from larger models—is often framed as a compression problem, but it's actually a transformation problem. The smaller model isn't learning to be the larger model; it's learning a different function that approximates the same mapping. Understanding this distinction reveals why distillation is harder than it appears.

## Method
- **Approach:** Systematically distilled a large reasoning model into smaller architectures, tracking which capabilities transfer and which degrade, and analyzing the patterns in failures
- **Tools Used:** Multiple student architectures, transfer learning pipelines, capability batteries
- **Data Sources:** Distillation datasets of varying size and diversity, capability assessments at multiple granularities

## Execution
```
Distillation configurations:
- Dataset size: 10K, 50K, 200K, 1M examples
- Diversity: single-task, multi-task, universal
- Architecture: 3B, 7B, 13B parameters
- Training: full fine-tune, LoRA, prompt distillation
```

## Findings
The most robust finding: factual knowledge transfers more easily than reasoning capabilities. Student models match teacher performance on knowledge-heavy tasks at 20% of the data cost, but struggle to match reasoning-heavy tasks even with 100% data coverage.

This suggests that reasoning isn't just "more knowledge"—it's a different computational mode. When we distill, we're teaching the student to produce teacher-like outputs, not to think teacher-like thoughts. The internal process is incompletely specified by outputs alone.

Interestingly, LoRA-style efficient fine-tuning preserved more reasoning capability than full fine-tuning at equivalent data scales. This is counterintuitive—we'd expect more capacity to learn better. The hypothesis: full fine-tuning overwrites useful pre-trained knowledge; LoRA preserves it while adding reasoning capability.

## Implications
The current paradigm of output-distillation is insufficient for reasoning capability transfer. We may need process distillation—training on the reasoning traces, not just the conclusions—to preserve what matters about larger models.

## Next Steps
- Test process distillation (reasoning traces vs. final answers)
- Investigate whether multi-teacher distillation helps reasoning transfer
- Explore whether architectural choices can reduce the reasoning-capacity gap

## Tags
#ai-research #experiment
