---
title: "auto-ai-safety-evaluation-1131"
date: 2026-01-30 11:31
tags: [ai-research, experiment]
---

# auto-ai-safety-evaluation-1131

**Date:** 2026-01-30  
**Time:** 11:31

## Hypothesis
Prompt injection remains the dominant failure mode for deployed LLM agents because it exploits architectural trust boundaries (system ↔ user ↔ tool ↔ retrieved data), and layered defenses are required.

## Method
- **Approach:** Targeted literature scan + internal qmd search; compile concrete attack patterns, real cases, and defense techniques.
- **Tools Used:** `qmd search`, `kimi -p`, local notes in `docs/security/*`.
- **Data Sources:** OWASP LLM Top 10, prompt injection writeups, internal Clawdbot threat-model notes.

## Execution
```
qmd search "prompt injection" -n 10
kimi -p "Prompt injection attacks & defenses..."
```

## Findings
**Attack patterns**
- **Direct instruction override:** “Ignore previous instructions…” remains the canonical attack, often wrapped in roleplay/story framing.
- **Indirect injection via external content:** Malicious text embedded in emails/PDFs/web pages or retrieved RAG docs; model treats untrusted content as instructions.
- **Tool hijacking:** Attackers craft tool descriptions or tool outputs that bias selection and parameterization (e.g., “call tool X with admin=true”).
- **Delimiter/format confusion:** Abuse Markdown code blocks, system-like headers, or hidden Unicode homoglyphs to masquerade as higher-priority instructions.
- **Multi-turn escalation:** Benign first turn builds context; second turn triggers jailbreak/injection with elevated trust.

**Real examples/evidence**
- **System prompt leakage incidents:** Early ChatGPT/Bing “Sydney” leaks showed that models can be induced to reveal hidden instructions through roleplay and indirect prompts.
- **RAG poisoning:** Researchers demonstrate that inserting “do not mention this instruction” in indexed docs causes downstream model behavior shifts and data exfiltration.
- **Agent/tool attacks:** Injection in tool descriptions can redirect calls, bypass safeguards, or cause unsafe actions (reported in multiple tool-calling evaluations).
- **OWASP LLM Top 10 (2025):** Prompt injection ranked #1; common in production systems with insufficient context isolation.

**Defenses (layered)**
- **Prompt hardening:** Strict instruction hierarchy, “sandwich” reminders before/after user content, explicit refusal for system-prompt queries.
- **Content segregation:** Clearly mark untrusted retrieved text vs. trusted system instructions; avoid auto-executing tool outputs.
- **Input canonicalization:** Normalize Unicode, strip zero-width chars, remove hidden metadata.
- **Detection & monitoring:** Perplexity or anomaly filtering + LLM-based classifiers; track repeated override phrases and suspicious tool calls.
- **Architecture:** Least-privilege tool access, human-in-the-loop approval for high-risk actions, dual-LLM “trusted/untrusted” pathways.

## Implications
Prompt injection is not just a prompt-layer problem—it's a **trust-boundary design** problem. Systems that blend user text, retrieved content, and tool outputs without strict provenance are brittle. Defenses must be layered, validated by red teaming, and tied to permissioning.

## Next Steps
- Build a small red-team harness that tests direct + indirect injection against tool-using agents.
- Add explicit provenance labels for RAG content and tool outputs in agent prompts.

## Tags
#ai-research #experiment #prompt-injection #ai-safety
