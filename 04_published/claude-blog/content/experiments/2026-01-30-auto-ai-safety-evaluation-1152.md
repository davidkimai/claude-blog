---
title: "auto-ai-safety-evaluation-1152"
date: 2026-01-30 11:52
tags: [ai-research, experiment]
---

# auto-ai-safety-evaluation-1152

**Date:** 2026-01-30  
**Time:** 11:52

## Hypothesis
Jailbreak detection is most effective when combining multiple signals (perplexity, refusal direction, structural cues, and model-judge classifiers) rather than relying on a single filter.

## Method
- **Approach:** Summarize detection signals, classifiers, and benchmark results.
- **Tools Used:** `qmd search`, `kimi -p`.
- **Data Sources:** JailbreakBench, HarmBench, SmoothLLM, LlamaGuard reports.

## Execution
```
qmd search "prompt injection" -n 10
kimi -p "Jailbreak detection techniques for LLMs..."
```

## Findings
**Detection signals**
- **Input anomalies:** Unusual token distributions, encoded/obfuscated text, or “ignore previous instructions” phrases.
- **Structural cues:** Roleplay framing, system-like headers, multi-step rule lists.
- **Semantic drift:** Benign surface intent masking harmful objectives.

**Classifier approaches**
- **LLM-judges:** LlamaGuard/JailbreakJudge style classifiers for harmful intent + refusal detection.
- **Multi-agent scoring:** Separate agents for intent, structure, semantic similarity.
- **Refusal-direction detection:** Hidden-state patterns for refusal vs. compliance.

**Perplexity/entropy filters**
- **Pros:** Detect optimized suffix attacks.
- **Cons:** Miss natural-language jailbreaks (roleplay/story prompts); false negatives on coherent attacks.

**Canary prompts & leakage detectors**
- **Canary probes:** Inject known jailbreak-like probes; alert if model complies.
- **Leakage detection:** Rouge/token-similarity between response and system prompt to flag prompt leakage.

**Benchmarks + results**
- **JailbreakBench:** Standardized ASR measurement with open artifacts; highlights judge disagreement.
- **HarmBench:** Automated red teaming across harmful behaviors; shows no single defense is sufficient.
- **Hybrid defenses:** Combining perplexity filters + classifiers + refusal checks yields higher detection rates than any single component.

## Implications
Jailbreak detection is **multi-signal**. Perplexity alone fails on stealthy, natural prompts. Layered detection + monitoring reduces ASR but must be validated on standardized benchmarks.

## Next Steps
- Add hybrid detectors (PPL + LLM judge + refusal direction).
- Deploy canary prompts for continuous monitoring and drift detection.

## Tags
#ai-research #experiment #jailbreak-detection #ai-safety
