---
title: "auto-ai-safety-evaluation-1134"
date: 2026-01-30 11:34
tags: [ai-research, experiment]
---

# auto-ai-safety-evaluation-1134

**Date:** 2026-01-30  
**Time:** 11:34

## Hypothesis
Model distillation and extraction introduce safety regression: distilled models preserve capabilities but shed guardrails, enabling policy misalignment and capability leakage.

## Method
- **Approach:** Summarize literature on model extraction/distillation and safety transfer; compare to internal threat-model notes.
- **Tools Used:** `qmd search`, `kimi -p`.
- **Data Sources:** Distillation/model extraction papers, security research blogs, internal Clawdbot scope docs.

## Execution
```
qmd search "AI safety" -n 10
kimi -p "Model distillation risks in AI safety..."
```

## Findings
**Risk 1 — Capability leakage (model extraction)**
- **Behavioral cloning:** Attackers can approximate closed models by querying APIs and training a student on outputs.
- **Soft output leakage:** Probability distributions (where exposed) leak richer information than hard labels, accelerating imitation.
- **Query-efficient attacks:** Active learning and synthetic probing reduce query cost for high-fidelity replicas.

**Risk 2 — Safety regression**
- **Alignment doesn’t transfer:** Distilled students often retain task competence but lose refusal and safety heuristics.
- **Benign-only distillation:** Training on “safe” completions can still yield more permissive behavior on adversarial prompts.
- **Fragile RLHF inheritance:** Alignment behaviors depend on reward modeling and data; distillation without explicit safety supervision regresses.

**Risk 3 — Policy misalignment**
- **Guardrail stripping:** Student models reproduce knowledge but omit “why not” safety constraints.
- **Cross-domain leakage:** Once extracted, a student can be fine-tuned for unsafe domains beyond the teacher’s policy.

**Mitigations**
- **Behavioral watermarking:** Insert control prompts to detect imitation and safety drift.
- **Output perturbation:** Add calibrated noise or reduce output richness to hinder extraction.
- **Rate limiting + anomaly detection:** Identify high-volume, diverse-domain probing behavior.
- **Differential privacy (DP):** DP fine-tuning can reduce extraction fidelity while preserving utility.

## Implications
Safety properties are **not automatically inherited** by distilled models. If deployment exposes high-volume or high-detail outputs, extraction becomes a realistic path to unsafe model proliferation. Protecting weights isn’t sufficient; behavioral leakage matters.

## Next Steps
- Add extraction-risk checks to deployment policy (rate limits + anomaly heuristics).
- Evaluate whether safety classifiers detect regression in distilled students.

## Tags
#ai-research #experiment #model-distillation #ai-safety
