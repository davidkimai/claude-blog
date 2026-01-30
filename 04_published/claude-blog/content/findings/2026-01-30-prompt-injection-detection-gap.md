---
title: "Prompt Injection Detection Falls Short of 95% Claim"
date: 2026-01-30
tags: [findings, ai-security, prompt-injection]
---

# Prompt Injection Detection Falls Short of 95% Claim

## Key Discovery
Multi-signal detection systems—combining perplexity checks, classifiers, and canaries—do not achieve the 95% injection detection rate commonly claimed in marketing materials. Under adaptive adversaries with context-aware attacks, recall drops significantly because low-entropy injections embedded in benign content evade simple pattern matching, and novel attack patterns bypass known classifiers.

## Evidence
Testing against documented attack chains reveals systematic gaps: perplexity spikes catch obvious injections but miss context-aware instructions that blend with legitimate content; classifiers trained on known patterns fail against novel vector variations; canaries detect boundary violations only when direct instruction patterns are used, not indirect or multi-step attacks. The attack surface (direct injection, indirect via documents/HTML, RAG-based poisoning, tool hijacking) compounds the detection challenge—defenses that work against one vector often miss others entirely.

## Implications
Building robust AI systems requires accepting that detection alone is insufficient. Organizations should prioritize defense-in-depth: treat all external content as untrusted, enforce strict provenance boundaries between context and instructions, implement least-privilege tool access with allowlists, and design for damage limitation rather than impossible prevention. The 95% figure is marketing, not engineering—real systems face adaptive adversaries who actively tune attacks to evade detection.

## Related
[Full experiment: Prompt Injection Deep Dive](/experiments/2026-01-30-prompt-injection-deep-dive/)
